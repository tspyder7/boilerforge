import { join } from 'path';
import { FileMetadata, FileProps } from '../../types/file';
import { ExecutionContext } from '../../core/context/execution.context';

/**
 * Represents a file resource within the system, handling path resolution,
 * metadata extraction, and content storage.
 */
export class FileResource {
    readonly name: string;
    readonly metadata: FileMetadata;
    readonly ctx: ExecutionContext;
    content?: string;

    /**
     * Creates an instance of FileResource.
     * @param relativePath - The path of the file relative to the project root or source directory eg. src/core/index.ts or index.ts.
     * @param content - The raw string content of the file.
     * @param ctx - The execution context containing base directory path.
     * @param fileProps - Optional properties to override default directory behavior.
     * @throws {Error} If relativePath is empty or invalid.
     */
    constructor(
        relativePath: string,
        content: string,
        ctx: ExecutionContext,
        fileProps?: FileProps,
    ) {
        if (!relativePath) {
            throw new Error('relativePath cannot be empty');
        }

        // Determine the base directory, prioritizing fileProps over the general context
        const { dirPath = ctx.data.dirPath } = fileProps ?? {};

        // Parse the path segments to separate the filename from the directory structure
        const pathSegments = relativePath.split(/[/\\]/);
        const fileName = pathSegments.pop() || '';
        const relativeDirPath = pathSegments.length
            ? join(...pathSegments)
            : undefined;

        // Resolve absolute paths
        const absDirPath = relativeDirPath
            ? join(dirPath, relativeDirPath)
            : dirPath;
        const absFilePath = join(absDirPath, fileName);

        this.name = fileName;
        this.content = content || '';
        this.ctx = ctx;
        this.metadata = {
            extension: fileName.split('.').pop() || '',
            dirPath: absDirPath,
            relativeDirPath,
            absPath: absFilePath,
            relativePath: relativeDirPath
                ? join(relativeDirPath, fileName)
                : undefined,
        };
    }
}
