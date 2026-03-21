import { join, sep } from 'path';
import { Template } from './template.model';
import { CompiledFile, ForgeFileConfig, AppArgs } from '../../types/common';
import { Expr } from '../expr';
import { difference } from 'lodash';
import { TemplateConfig } from '../../constants/cli.constants';
import { readFileSync } from 'fs';
import Handlebars from 'handlebars';
import { ExecutionContext } from '../../core/context/execution.context';
import { TemplateRegistry } from './template.registry';

export class TemplateCompiler {
    constructor(public readonly template: Template) {}

    async compile(args: AppArgs): Promise<CompiledFile[]> {
        const templateFiles = await this.getTemplateFilesToCompile(args);
        return await Promise.all(
            templateFiles.map(async (file) => {
                const template = readFileSync(file, 'utf-8');
                const render = Handlebars.compile(template);

                let fileRelativePath = file
                    .split(sep + 'app' + sep)[1]
                    .replace('.hbs', '');

                const {
                    data: { dirPath },
                } = ExecutionContext.getContext();

                dirPath.split(sep).pop() !== args.name &&
                    (fileRelativePath = join(args.name, fileRelativePath));

                return {
                    file: fileRelativePath,
                    content: render(args),
                };
            }),
        );
    }

    private async getTemplateFilesToCompile(config: AppArgs) {
        const templateFiles = TemplateRegistry.getTemplateFiles(this.template);
        const { fileConfig } = TemplateRegistry.getForgeConfig(this.template);

        if (!fileConfig) return templateFiles;

        const templateFilesToExclude =
            await this.getTemplateFilesToExcludeFromCompilation(
                fileConfig,
                config,
            );
        return difference(templateFiles, templateFilesToExclude);
    }

    private async getTemplateFilesToExcludeFromCompilation(
        fileConfig: ForgeFileConfig,
        config: AppArgs,
    ) {
        const templateFilesToExclude: string[] = [];
        await Promise.all(
            Object.entries(fileConfig).map(async ([file, check]) => {
                const templateFile = join(
                    this.template.templateDir,
                    TemplateConfig.TEMPLATE_APP_DIR,
                    ...`${file}.hbs`.split('/'),
                );
                const result = await Expr.evaluate<boolean>(check, config);
                !result && templateFilesToExclude.push(templateFile);
            }),
        );
        return templateFilesToExclude;
    }
}
