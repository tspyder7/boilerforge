import { Command } from 'commander';
import {
    GetOptions,
    ISubCommand,
    SubCommandConfig,
} from '../../../../../types/cli';
import { SubCommands } from '../../config/sub-commands';

import { ForgeMetadata } from '../../../../../types/common';
import { Template } from '../../../../template/template.model';
import { PromptConfig } from '../../../../../types/prompt';
import { logger } from '../../../../../utils/logger';
import { TemplateRegistry } from '../../../../template/template.registry';

type ShowConfigOptions = GetOptions<typeof SubCommands.SHOW_CONFIG>;

export default class ShowConfigCommand
    implements ISubCommand<typeof SubCommands.SHOW_CONFIG>
{
    readonly config: SubCommandConfig = SubCommands.SHOW_CONFIG;

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
    async action(args: string[], option: ShowConfigOptions) {
        const [template] = args;
        const metadata = this.getConfig(template);
        const promptConfig = this.getPromptConfig(template);

        console.info(`${metadata.name}@${metadata.version}`);

        if (promptConfig) {
            console.info('\nOptions: ');
            const { prompts } = promptConfig;

            const options = prompts.map(({ name, description }) => [
                name,
                description,
            ]);

            logger.logColumns(options);
        }
    }

    private getConfig(templateName: string): ForgeMetadata {
        const template = new Template(templateName);
        const { metadata } = TemplateRegistry.getForgeConfig(template);
        return metadata;
    }

    private getPromptConfig(templateName: string): PromptConfig | undefined {
        const template = new Template(templateName);

        try {
            const promptConfig = TemplateRegistry.getPromptConfig(template);
            return promptConfig as unknown as PromptConfig;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return;
        }
    }
}
