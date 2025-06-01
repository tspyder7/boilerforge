import { $, ExecaError, Result } from 'execa';

export type ExecCmdProps = {
    cwd?: string;
    throwError?: boolean;
};

export type ExecCmdErrorProps = {
    code?: string;
    command: string;
    message: string;
    errorName: string;
    stack?: string;
    cause: unknown;
    shortMessage: string;
    originalMessage: string;
};

export class ExecCmdError implements Error {
    name: string;
    message: string;
    stack?: string | undefined;
    cause: unknown;
    shortMessage: string;
    originalMessage: string;
    errorName: string;
    command: string;
    code?: string;

    constructor(execCmdErrorProps: ExecCmdErrorProps) {
        this.name = 'ExecCmdError';
        this.message = execCmdErrorProps.message;
        this.cause = execCmdErrorProps.cause;
        this.stack = execCmdErrorProps.stack;
        this.shortMessage = execCmdErrorProps.shortMessage;
        this.originalMessage = execCmdErrorProps.originalMessage;
        this.errorName = execCmdErrorProps.errorName;
        this.command = execCmdErrorProps.command;
        this.code = execCmdErrorProps.code;
    }
}

export const execCmd = async (
    command: string,
    execCmdProps?: ExecCmdProps,
): Promise<Result<{}> | undefined> => {
    const { cwd = '', throwError = true } = execCmdProps ?? {};

    try {
        const $cmdExecutor = $.s({
            ...(cwd?.length ? { cwd } : {}),
        });

        return $cmdExecutor`${command.trim().split(' ')}`;
    } catch (error) {
        if (!throwError) return;

        const {
            message,
            cause,
            stack,
            shortMessage,
            originalMessage,
            name: errorName,
            command,
            code,
        } = error as ExecaError;

        throw new ExecCmdError({
            message,
            cause,
            stack,
            shortMessage,
            originalMessage,
            errorName,
            command,
            code,
        });
    }
};
