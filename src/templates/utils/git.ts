import { ExecaError } from 'execa';
import { execCmd, ExecCmdError } from '../../utils/exec-cmd';
import { logger } from '../../utils/logger';

import type {} from '../../utils';

export type GitOptions = {
    global: boolean;
};

const defaultGitOptions: GitOptions = {
    global: false,
};

export const getGitVersion = async (): Promise<string | undefined> => {
    try {
        const { stdout: gitVersion = '' } =
            (await execCmd('git --version')) ?? {};
        return gitVersion.match(/(?=(\d+.\d+.\d+))/)?.[1];
    } catch (error) {
        const { code, message } = error as ExecCmdError;

        if (code === 'ENOENT') return undefined;

        logger.err(
            `Error while checking if git exists, Code: ${code} | Message: ${message}`,
        );

        throw new Error(
            `${getGitVersion.name} error, Code: ${code} | Message: ${message}`,
        );
    }
};

export const getGitConfiguration = async (
    options: GitOptions = { ...defaultGitOptions },
): Promise<Record<string, string | undefined> | undefined> => {
    const { global } = options;

    try {
        const { stdout: gitConfigResult = '' } =
            (await execCmd(`git config -l ${global ? '--global' : ''}`)) ?? {};

        if (!gitConfigResult.length) return undefined;

        const gitConfig = Object.fromEntries(
            gitConfigResult.split('\n').map((config) => config.split('=')),
        );

        return gitConfig;
    } catch (error) {
        const { code, message } = error as ExecaError;

        logger.err(
            `Error while getting ${global ? 'global' : 'local'} git config, Code: ${code} | Message: ${message}`,
        );

        if (code === 'ENOENT') throw new Error('git does not exists');

        throw new Error(
            `${getGitConfiguration.name} error, Code: ${code} | Message: ${message}`,
        );
    }
};
