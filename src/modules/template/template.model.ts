import { join } from 'path';
import { CLIContext } from '../../core/context/cli.context';
import { TemplateConfig } from '../../constants/cli.constants';
import { Path } from '../../utils/path';

export class Template {
    public readonly templateDir: string;
    public readonly filesDir: string;
    public readonly schemaFilePath: string;
    public readonly promptConfigFilePath: string;
    public readonly forgeConfigFilePath: string;

    constructor(public readonly name: string) {
        const {
            data: { templateRegistry },
        } = CLIContext.getContext();
        this.templateDir = join(templateRegistry, this.name);
        this.filesDir = join(this.templateDir, TemplateConfig.TEMPLATE_APP_DIR);
        this.schemaFilePath = join(
            this.templateDir,
            TemplateConfig.TEMPLATE_SCHEMA_DIR,
            TemplateConfig.PROMPT_SCHEMA_FILE,
        );
        this.promptConfigFilePath = join(
            this.templateDir,
            TemplateConfig.PROMPT_CONFIG_FILE,
        );
        this.forgeConfigFilePath = join(
            this.templateDir,
            TemplateConfig.FORGE_CONFIG_FILE,
        );

        Path.existsOrThrow(
            templateRegistry,
            `Template directory not found: ${templateRegistry}`,
        );
        Path.existsOrThrow(
            this.templateDir,
            `Template does not exists: ${this.templateDir}`,
        );
    }
}
