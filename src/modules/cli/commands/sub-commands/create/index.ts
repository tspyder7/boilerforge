import { Command } from 'commander';
import {
    GetOptions,
    ISubCommand,
    SubCommandConfig,
} from '../../../../../types/cli';
import { SubCommands } from '../../config/sub-commands';
import { Bootstrapper } from './bootstrapper';

type CreateOptions = GetOptions<typeof SubCommands.CREATE>;

export default class CreateCommand
    implements ISubCommand<typeof SubCommands.CREATE>
{
    readonly config: SubCommandConfig = SubCommands.CREATE;

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
    async action(args: string[], options: CreateOptions) {
        const [template] = args;
        const { cliConfig } = options;

        const bootstrapper = new Bootstrapper(template, cliConfig);
        await bootstrapper.init();
    }
}
