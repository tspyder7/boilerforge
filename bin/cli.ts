#!/usr/bin/env node

import { Command } from 'commander';
import cliConfig from '../src/config/cli-config';
import { CreateNodeApp } from '../src/templates';

(async function () {
    const program = new Command();
    program
        .name(cliConfig.name)
        .description(cliConfig.description)
        .version(
            cliConfig.version,
            '-v, --version',
            'output the version number',
        );

    new CreateNodeApp({ program });

    program.parse();
})();
