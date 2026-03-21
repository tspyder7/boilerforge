import { existsSync } from 'fs';

export class Path {
    private constructor() {}

    static exists(path: string): boolean {
        return existsSync(path);
    }

    static existsOrThrow(path: string, message: string) {
        if (existsSync(path)) throw new Error(message);
    }
}
