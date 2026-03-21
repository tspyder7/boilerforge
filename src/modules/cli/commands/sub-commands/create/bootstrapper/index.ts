/* eslint-disable @typescript-eslint/no-unused-vars */
import { difference } from 'lodash';
import { Regex } from '../../../../../../constants';
import { ExecutionContext } from '../../../../../../core/context/execution.context';
import {
    AppArgs,
    CompiledFile,
    JSONObject,
} from '../../../../../../types/common';
import { PromptConfig } from '../../../../../../types/prompt';
import { Expr } from '../../../../../expr';
import { FileHandler } from '../../../../../filesystem/file.handler';
import { FileResource } from '../../../../../filesystem/file.model';
import { dispatchPrompts } from '../../../../../prompter';
import { TaskExecutor } from '../../../../../task/task.executor';
import { Task } from '../../../../../task/task.model';
import { Template } from '../../../../../template/template.model';
import { TemplateCompiler } from '../../../../../template/template.compiler';

export class Bootstrapper {
    private template: Template;
    private compiledFiles: CompiledFile[] = [];

    constructor(
        public readonly templateName: string,
        public readonly cliConfig: string = '',
    ) {
        this.template = new Template(this.templateName);
    }

    async init() {
        const args = await this.getArgsToCompileTemplateFiles();
        const compiler = new TemplateCompiler(this.template);
        this.compiledFiles = await compiler.compile(args);
        const tasks = this.getTasks();
        new TaskExecutor({
            tasks,
        }).execute();
    }

    private async getArgsToCompileTemplateFiles(): Promise<AppArgs> {
        return !this.cliConfig.length
            ? await dispatchPrompts(this.template)
            : await this.getArgsFromCLI();
    }

    private async getArgsFromCLI(): Promise<AppArgs> {
        const parsedCliConfig = this.parseCliConfigOptions(this.cliConfig);
        const cliConfig = await this.validateCliConfigOptions(parsedCliConfig);

        return cliConfig as AppArgs;
    }

    private getTasks(): Task[] {
        const files = this.compiledFiles
            .map(({ file, content }) => {
                const fileResource = new FileResource(
                    file,
                    content,
                    ExecutionContext.getContext(),
                );
                return fileResource;
            })
            .map((resource) => {
                const file = new FileHandler(resource);
                return file;
            });

        return [
            {
                title: 'Scaffolding project',
                handler: () => {
                    files.map((file) => file.create());
                },
                rollback: () => {
                    files.map((file) => file.delete());
                },
            },
        ];
    }

    private parseCliConfigOptions(cliConfig: string): Record<string, string> {
        if (!Regex.CLI_CONFIG_OPTION.test(cliConfig.trim())) {
            throw new Error(
                "Invalid format: --cli-config must be 'key=value;key=value'",
            );
        }

        return Object.fromEntries(
            cliConfig
                .split(';')
                .filter((pair) => pair.trim() !== '')
                .map((pair) => {
                    const [key, value] = pair.split('=');
                    return [key.trim(), value.trim()];
                }),
        );
    }

    private async validateCliConfigOptions(
        cliConfig: Record<string, string>,
    ): Promise<JSONObject> {
        const sanitizedCliConfig: JSONObject = {};
        const { prompts } =
            this.template.getPromptConfig() as unknown as PromptConfig;

        const missingConfig = difference(
            prompts.map(({ name }) => name),
            Object.keys(cliConfig),
        );

        if (missingConfig.length) {
            console.info(`Missing configs: ${missingConfig.join(', ')}`);
            process.exit(1);
        }

        for await (const prompt of prompts) {
            const { name, validate, type } = prompt;
            const configValue = cliConfig[name];
            sanitizedCliConfig[name] =
                type === 'toggle'
                    ? configValue.toLowerCase() === 'true'
                    : configValue;

            if (!validate) continue;

            const isValid = await Expr.evaluate<boolean>(validate.expression, {
                input: configValue,
            });

            if (!isValid) {
                console.error(validate.error);
                process.exit(1);
            }
        }

        return sanitizedCliConfig;
    }
}
