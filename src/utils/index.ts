import { existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

import { logger } from './logger';

export const Regex = {
    PROJECT_NAME: /^[a-zA-Z][a-zA-Z0-9-]*$/,
    VERSION:
        /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/,
};

export namespace DirectoryUtils {
    export type RemoveDirectoryOptions = {
        recursive: boolean;
        errorIfNotExists: boolean;
    };

    export const create = (dir: string, parentDirPath: string = __dirname) => {
        const dirPath = join(parentDirPath, dir);
        try {
            if (existsSync(dirPath)) return;

            mkdirSync(dirPath, { recursive: true });
        } catch (error) {
            logger.err(
                `Error while creating the directory: ${dirPath}, ${(error as Error).message}`,
            );

            throw new Error(`Error while creating the directory ${dirPath}`);
        }
    };

    export const remove = (
        relativeDirPath: string,
        parentDirPath: string = __dirname,
        removeDirectoryOptions: Partial<RemoveDirectoryOptions> = {
            recursive: false,
            errorIfNotExists: false,
        },
    ) => {
        const { recursive, errorIfNotExists } = removeDirectoryOptions;

        const dirPath = join(parentDirPath, relativeDirPath);
        try {
            const dirExists = existsSync(dirPath);
            if (!dirExists && errorIfNotExists)
                throw new Error(`Error directory does not exists: ${dirPath}`);

            if (!dirExists && !errorIfNotExists) return;

            rmSync(dirPath, { recursive, force: !errorIfNotExists });
        } catch (error) {
            logger.err(
                `Error while removing the directory: ${dirPath}, ${(error as Error).message}`,
            );

            throw new Error(`Error while removing the directory ${dirPath}`);
        }
    };
}
