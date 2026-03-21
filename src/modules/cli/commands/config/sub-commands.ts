import { SubCommandConfig } from '../../../../types/cli';

export const SubCommands = {
    LIST_TEMPLATES: {
        command: 'list-templates',
        description: 'List all available templates',
        options: [],
    },
    CREATE: {
        command: 'create <template>',
        description: 'Create project from <template>',
        options: [
            {
                flags: '--cli-config <config>',
                description: 'Enable CLI mode',
            },
        ],
    },
    SHOW_CONFIG: {
        command: 'show-config <template>',
        description: 'Show <template> configuration',
        options: [],
    },
} as const satisfies Record<string, SubCommandConfig>;
