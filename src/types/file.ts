export interface FileProps {
    dirPath?: string;
}

export interface FileMetadata {
    extension: string;
    dirPath: string;
    absPath: string;
    relativePath?: string;
    relativeDirPath?: string;
}
