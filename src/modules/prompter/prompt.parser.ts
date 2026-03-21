import { validateJson } from '../../utils/schemaValidator';
import { PromptConfig, PromptDefinition } from '../../types/prompt';
import { Expr } from '../expr';
import { PromptContext } from '../../core/context/prompt.context';
import { AppContext } from '../../core/context/app.context';
import { Template } from '../template/template.model';

export class PromptParser {
    constructor(private templateLoader: Template) {
        PromptContext.setContext({
            app: {
                ...AppContext.getContext().data,
            },
        });
    }

    async parse(): Promise<PromptDefinition[]> {
        const promptConfig = this.templateLoader.getPromptConfig();
        const schema = this.templateLoader.getSchema();

        const {
            success: isValid,
            data: { prompts },
            errors,
        } = validateJson<PromptConfig>(promptConfig, schema);

        if (!isValid) {
            console.error('Invalid Prompt Configuration:');
            errors.forEach(({ path, message = '' }) => {
                console.error(`  - [${path}]: ${message}`);
            });
            console.error('Please check your JSON file against the schema.');
            process.exit(1);
        }

        const promptItems = await Promise.all(
            prompts.map(async (promptItem): Promise<PromptDefinition> => {
                const {
                    type,
                    name,
                    prompt: { message = '', defaultValue = '' } = {},
                    skip,
                    validate,
                    choices,
                    options: { enabled, disabled } = {},
                } = promptItem || {};

                const prompt: PromptDefinition = {
                    type,
                    name,
                    message,
                    initial: async () => {
                        if (!defaultValue) return undefined;
                        return await Expr.evaluate<string>(defaultValue);
                    },
                    skip: async () => {
                        if (!skip) return false;
                        return await Expr.evaluate<boolean>(skip);
                    },
                    validate: async (value: unknown) => {
                        if (!validate) return true;
                        const isValid = await Expr.evaluate<boolean | string>(
                            validate.expression,
                            { input: value },
                        );
                        return isValid || validate.error;
                    },
                };

                choices && choices.length && (prompt.choices = choices);
                enabled && (prompt.enabled = enabled);
                disabled && (prompt.disabled = disabled);

                return prompt;
            }),
        );

        return promptItems;
    }
}
