#!/usr/bin/env node

import { Command } from 'commander';
import cliConfig from '../src/config/cli-config';
import { CreateNodeApp, CreateSimpleApp } from '../src/templates';
import path from 'path';

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

    console.log(path.resolve(__dirname, '../templates'));

    new CreateNodeApp({ program });
    new CreateSimpleApp({ program });

    program.parse();
})();
