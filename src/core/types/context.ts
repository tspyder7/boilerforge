import { AppArgs, JSONObject } from '../../types/common';

export interface Context {
    readonly dirPath: string;
}

export interface AppContextData extends AppArgs {}

export interface CLIContextData extends Context {
    readonly templateRegistry: string;
    readonly version: string;
}

export interface ExecutionContextData extends Context {
    readonly executionId: string;
    readonly executionTime: string;
}

export interface PromptContextData extends JSONObject {
    app: JSONObject;
}

export interface ExprContextData extends JSONObject {}
