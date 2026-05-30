export const Regex = {
    PROJECT_NAME: /^[a-zA-Z][a-zA-Z0-9-]*$/,
    APP_VERSION:
        /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/,
    CLI_CONFIG_OPTION: /^([^=;]+=[^;]*)(;([^=;]+=[^;]*))*;?$/,
};
