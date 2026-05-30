import { Command } from 'commander';
import {
    GetOptions,
    ISubCommand,
    SubCommandConfig,
} from '../../../../../types/cli';
import { SubCommands } from '../../config/sub-commands';
import { CLIContext } from '../../../../../core/context/cli.context';
import { Path } from '../../../../../utils/path';
import { globby } from 'globby';
import { TemplateConfig } from '../../../../../constants/cli.constants';
import { readFile } from 'node:fs/promises';
import { ForgeConfig } from '../../../../../types/common';

type ListTemplatesOptions = GetOptions<typeof SubCommands.LIST_TEMPLATES>;

export default class ListTemplatesCommand
    implements ISubCommand<typeof SubCommands.LIST_TEMPLATES>
{
    readonly config: SubCommandConfig = SubCommands.LIST_TEMPLATES;

    register(program: Command) {
        const { command, description, options } = this.config;
        const cmd = program.command(command).description(description);

        options?.forEach((option) =>
            cmd.option(option.flags, option.description, option.default),
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cmd.action(async (...args: any[]) => {
            args.pop(); // remove the self object
            const options = args.pop();
            await this.action(args, options);
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async action(args: string[], options: ListTemplatesOptions) {
        const templates = await this.getTemplateList();
        templates.forEach((template) => {
            console.log(template);
        });
    }

    private async getTemplateList(): Promise<string[]> {
        const {
            data: { templateRegistry },
        } = CLIContext.getContext();

        Path.existsOrThrow(
            templateRegistry,
            `Template directory not found: ${templateRegistry}`,
        );

        const configFiles = await globby([
            `${templateRegistry}/**/${TemplateConfig.FORGE_CONFIG_FILE}`,
        ]);

        const templateConfigs = await Promise.all(
            configFiles.map(
                async (file): Promise<ForgeConfig> =>
                    JSON.parse(
                        await readFile(file, { encoding: 'utf-8' }),
                    ) as ForgeConfig,
            ),
        );

        return templateConfigs.map(({ metadata: { name } }) => name);
    }
}
