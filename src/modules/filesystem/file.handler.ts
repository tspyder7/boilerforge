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
import { pipeline } from 'stream/promises';
import { logger } from '../../utils/logger';
import { FileResource } from './file.model';

/**
 * Handles physical file system operations for a specific FileResource.
 */
export class FileHandler {
    constructor(public file: FileResource) {}

    /**
     * Persists the file to disk.
     * Creates parent directories automatically if they do not exist.
     * @param content - Optional content override; defaults to the content stored in the FileResource.
     */
    create(content?: string) {
        const {
            content: fileContent = '',
            metadata: { dirPath, absPath },
        } = this.file;
        try {
            mkdirSync(dirPath, { recursive: true });
            writeFileSync(absPath, content || fileContent, 'utf-8');
        } catch (error) {
            logger.err(`Failed to create file: ${absPath}. ${error}`);
            throw new Error(`File creation failed: ${absPath}`);
        }
    }

    /**
     * Checks if the file currently exists on the physical disk.
     */
    isExists(): boolean {
        return existsSync(this.file.metadata.absPath);
    }

    /**
     * Deletes the file from disk and performs an upward cleanup of empty directories.
     * Operation is idempotent; it returns early if the file does not exist.
     */
    delete() {
        const { absPath } = this.file.metadata;

        if (!this.isExists()) return;

        try {
            unlinkSync(absPath);
            this.deleteEmptyDirs();
        } catch (error) {
            logger.err(`Failed to delete file: ${absPath}, ${error}`);
            throw new Error(`Failed to delete file: ${absPath}`);
        }
    }

    /**
     * Copies content from a source FileResource to this instance's path.
     * Overwrites the destination if it exists.
     * @param sourceFile - The FileResource representing the source file.
     * @throws {Error} If the source file does not exist on disk.
     */
    async copy(sourceFile: FileResource) {
        const { absPath: src } = sourceFile.metadata;
        const { absPath: dest, dirPath: destDir } = this.file.metadata;

        if (!existsSync(src)) {
            throw new Error(`Source file missing: ${src}`);
        }

        try {
            mkdirSync(destDir, { recursive: true });
            await pipeline(createReadStream(src), createWriteStream(dest));
        } catch (error) {
            logger.err(`Stream copy failed from ${src} to ${dest}: ${error}`);
            throw new Error(`Failed to copy file to ${dest}`);
        }
    }

    /**
     * Recursively walks up the directory tree from the file's location
     * and deletes directories only if they are empty.
     * Stops at the files context root (ctx.dirPath).
     */
    public deleteEmptyDirs() {
        const {
            ctx,
            metadata: { relativeDirPath },
        } = this.file;

        try {
            const segments = relativeDirPath?.split(sep) || [];

            for (let i = segments.length; i > 0; i--) {
                const currentDir = join(
                    ctx.data.dirPath,
                    ...segments.slice(0, i),
                );

                if (
                    !existsSync(currentDir) ||
                    readdirSync(currentDir).length > 0
                )
                    break;

                rmdirSync(currentDir);
            }
        } catch (error) {
            logger.err(`Failed to delete dirs: ${relativeDirPath}, ${error}`);
            throw new Error(`Failed to delete dirs: ${relativeDirPath}`);
        }
    }
}
