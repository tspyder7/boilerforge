import { Command } from 'commander';
import { CmdProps } from '../../../types/cli';
import { CMDOptions } from '../../../constants/cli.constants';

export class BaseCommand {
    private constructor() {}

    static create(props: CmdProps) {
        const { flags, description } = CMDOptions.VERSION;
        return new Command(props.name)
            .description(props.description)
            .version(props.version, flags, description);
    }
}
