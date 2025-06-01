import { Resource } from '../../../lib/project';

const prettierignore = `
.gitignore
.editorconfig
*.json

node_modules/

# build or bundles
build/

# Ignore built js files
dist/
`;

export const getPrettierrcContent = (): Resource => {
    const prettierrcJson = {
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

    return {
        filename: '.prettierrc.json',
        content: JSON.stringify(prettierrcJson, null, 4),
    };
};

export const getPrettierIgnoreContent = (): Resource => {
    return {
        filename: '.prettierignore',
        content: prettierignore,
    };
};
