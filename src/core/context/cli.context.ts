import { join } from 'path';
import { TemplateConfig } from '../../constants/cli.constants';
import { getCLIVersion } from '../../utils/cliVersion';
import { CLIContextData } from '../types/context';

export class CLIContext {
    static #instance: CLIContext;
    readonly data: CLIContextData;

    private constructor() {
        const dirPath = __dirname;
        const templateRegistry = join(dirPath, TemplateConfig.DIR_NAME);
        const version = getCLIVersion();
        this.data = {
            dirPath,
            templateRegistry,
            version,
        };
    }

    static getContext(): CLIContext {
        if (!CLIContext.#instance) {
            CLIContext.#instance = new CLIContext();
        }
        return CLIContext.#instance;
    }
}
