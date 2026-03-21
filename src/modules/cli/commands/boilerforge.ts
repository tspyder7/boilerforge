import { CLI } from '../../../constants/cli.constants';
import { BaseCommand } from '../base-command';
import * as SubCommands from './sub-commands';

export const Boilerforge = BaseCommand.create({
    name: CLI.NAME,
    description: CLI.DESCRIPTION,
    version: CLI.VERSION,
});

Object.values(SubCommands).forEach((Cmd) => {
    const instance = new Cmd();
    instance.register(Boilerforge);
});
