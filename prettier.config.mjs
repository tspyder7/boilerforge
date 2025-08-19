/**
 * @type {import('prettier').Config}
 */
 const config = {
    printWidth: 80,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    singleQuote: true,
    quoteProps: 'as-needed',
    trailingComma: 'all',
    arrowParens: 'always',
    parser: 'typescript',
    proseWrap: 'always',
    endOfLine: 'auto',
    embeddedLanguageFormatting: 'auto',
    singleAttributePerLine: true,
};

export default config;
