import { getCLIVersion } from '../utils/cliVersion';

export const TemplateConfig = {
    DIR_NAME: 'templates',
    TEMPLATE_APP_DIR: 'app',
    TEMPLATE_SCHEMA_DIR: 'schema',
    PROMPT_CONFIG_FILE: 'forge.prompt.json',
    PROMPT_SCHEMA_FILE: 'prompt.schema.json',
    FORGE_CONFIG_FILE: 'forge.config.json',
} as const;

export const CLI = {
    NAME: 'boilerforge',
    DESCRIPTION:
        'boilerforge is a blazing-fast CLI utility that scaffolds clean, ready-to-use project structures so you can skip the setup and start building instantly.',
    VERSION: getCLIVersion(),
} as const;

export const CMDOptions = {
    VERSION: {
        flags: '-v, --version',
        description: 'Output the version number',
    },
} as const;
