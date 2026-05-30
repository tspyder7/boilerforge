import Enquirer from 'enquirer';

export type PromptType =
    | 'text'
    | 'select'
    | 'toggle'
    | 'password'
    | 'number'
    | 'multiselect';

export interface PromptDisplay {
    message: string;
    defaultValue?: string;
}

export interface PromptValidation {
    expression: string;
    error: string;
}

export interface ChoiceOption {
    name: string;
    value: string;
}

export interface ToggleOptions {
    enabled: string;
    disabled: string;
}

export interface PromptItem {
    type: PromptType;
    name: string;
    description: string;
    prompt: PromptDisplay;
    skip?: string;
    validate?: PromptValidation;
    choices?: string[];
    options?: ToggleOptions;
}

export interface PromptConfig {
    prompts: PromptItem[];
}

export interface PromptDefinition {
    type: string;
    message: string;
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    skip?: Function;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    initial?: Function;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    validate?: Function;
    enabled?: string;
    disabled?: string;
    choices?: string[];
}

// Use 'Parameters' to grab the type from the constructor or prompt method
export type EnquirerOptions = Parameters<typeof Enquirer.prompt>[0];
