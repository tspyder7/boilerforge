import {
    createReadStream,
    createWriteStream,
    existsSync,
    mkdirSync,
    readdirSync,
    rmdirSync,
    unlinkSync,
    writeFileSync,
} from 'fs';
import { join, sep } from 'path';

import { logger } from '../utils/logger';

export class File {
    private fileName: string;
    private filePath: string;
    private fileExtension?: string;
    private dirPath: string;
    private contextPath: string;
    private relativeDirPath: string;
    private relativeFilePath: string;
    private content?: string;

    constructor(
        filePath: string,
        fileOptions?: { dirPath?: string; content?: string },
    ) {
        const { content = '', dirPath } = fileOptions ?? {};

        const filePathSplit = filePath.split('/');

        const relativeDirPath = join(
            ...filePathSplit.slice(0, filePathSplit.length - 1),
        );

        const fileName = filePathSplit[filePathSplit.length - 1];

        this.contextPath = dirPath ?? __dirname;
        this.fileName = fileName;
        this.content = content;
        this.dirPath = join(
            this.contextPath,
            relativeDirPath.length ? relativeDirPath : __dirname,
        );
        this.filePath = join(this.dirPath, fileName);
        this.fileExtension = fileName.split('.').at(1);
        this.relativeDirPath = relativeDirPath;
        this.relativeFilePath = join(relativeDirPath, fileName);
    }

    get getFileName(): string {
        return this.fileName;
    }

    get getFilePath(): string {
        return this.filePath;
    }

    get getFileExtension(): string | undefined {
        return this.fileExtension;
    }

    get getDirPath(): string {
        return this.dirPath;
    }

    get getContextPath(): string {
        return this.contextPath;
    }

    get getRelativeDirPath(): string {
        return this.relativeDirPath;
    }

    get getRelativeFilePath(): string {
        return this.relativeFilePath;
    }

    create(content?: string) {
        try {
            mkdirSync(this.dirPath, { recursive: true });
            writeFileSync(
                this.filePath,
                content || this.content || '',
                'utf-8',
            );
        } catch (error) {
            logger.err(
                `Error while creating the file: ${this.filePath}, ${(error as Error).message}`,
            );

            throw new Error(`Error while creating the file ${this.filePath}`);
        }
    }

    isExists() {
        return existsSync(this.filePath);
    }

    delete() {
        if (!this.isExists())
            throw new Error(`File does not exists: ${this.filePath}`);

        try {
            unlinkSync(this.filePath);
            this.deleteDir();
        } catch (error) {
            logger.err(
                `Error while deleting the file: ${this.filePath}, ${(error as Error).message}`,
            );

            throw new Error(`Error while deleting the file ${this.filePath}`);
        }
    }

    async createFrom(file: File) {
        if (!file.isExists())
            throw new Error(
                `File to copy from does not exist: ${file.getFilePath}`,
            );

        if (this.isExists())
            throw new Error(`File already exists: ${this.filePath}`);

        await new Promise((resolve, reject) => {
            const readStream = createReadStream(file.getFilePath, 'utf-8');
            const writeStream = createWriteStream(this.filePath);

            readStream.pipe(writeStream);

            readStream.on('error', reject);
            writeStream.on('error', reject);
            writeStream.on('finish', () => resolve);
        });
    }

    private deleteDir() {
        try {
            const dirs = this.relativeDirPath.split(sep);

            for (let i = dirs.length; i > 0; i--) {
                const dirPath = join(this.contextPath, ...dirs.slice(0, i));

                if (readdirSync(dirPath).length) break;

                rmdirSync(dirPath);
            }
        } catch (error) {
            logger.err(
                `Error while deleting the dirs: ${this.relativeDirPath}, ${(error as Error).message}`,
            );

            throw new Error(
                `Error while deleting the dirs: ${this.relativeDirPath}`,
            );
        }
    }
}
