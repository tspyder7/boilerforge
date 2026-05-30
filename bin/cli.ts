#!/usr/bin/env node
import { Boilerforge } from '../src/modules/cli/commands/boilerforge';

(async function () {
    Boilerforge.parse(process.argv);
})();
