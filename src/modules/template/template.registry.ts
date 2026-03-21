import { join } from 'path';
import { readdirSync, readFileSync } from 'fs';
import { Path } from '../../utils/path';
import { ForgeConfig, JSONObject } from '../../types/common';
import { Template } from './template.model';

export class TemplateRegistry {
    private constructor() {}

    static getTemplateFiles(template: Template): string[] {
        const templateFiles = readdirSync(template.filesDir, {
            recursive: true,
            withFileTypes: true,
        });
        return templateFiles
            .filter((file) => file.isFile())
            .map(({ parentPath, name }) => join(parentPath, name));
    }

    static getSchema(template: Template): JSONObject {
        const { schemaFilePath } = template;
        Path.existsOrThrow(
            schemaFilePath,
            `Prompt schema not found: ${schemaFilePath}`,
        );
        return JSON.parse(readFileSync(schemaFilePath, 'utf-8'));
    }

    static getPromptConfig(template: Template): JSONObject {
        const { promptConfigFilePath } = template;
        Path.existsOrThrow(
            promptConfigFilePath,
            `Prompt config not found: ${promptConfigFilePath}`,
        );
        return JSON.parse(readFileSync(promptConfigFilePath, 'utf-8'));
    }

    static getForgeConfig(template: Template): ForgeConfig {
        const { forgeConfigFilePath } = template;
        Path.existsOrThrow(
            forgeConfigFilePath,
            `Forge config not found: ${forgeConfigFilePath}`,
        );
        return JSON.parse(
            readFileSync(forgeConfigFilePath, 'utf-8'),
        ) as ForgeConfig;
    }
}
