export type JSONObject = { [key: string]: JsonValue };

export type JsonValue =
    | string
    | number
    | boolean
    | null
    | RegExp
    | JsonValue[]
    | { [key: string]: JsonValue };

export interface ValidationResult<T> {
    success: boolean;
    data: T;
    errors: Array<{
        path: string;
        message?: string;
    }>;
}

export interface ForgeMetadata {
    name: string;
    version: string;
}

export interface ForgeFileConfig {
    [key: string]: string;
}

export interface ForgeConfig {
    metadata: ForgeMetadata;
    fileConfig?: ForgeFileConfig;
}

export interface CompiledFile {
    file: string;
    content: string;
}

export type AppArgs = { name: string } & JSONObject;
