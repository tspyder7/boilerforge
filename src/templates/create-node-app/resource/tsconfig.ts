import { Resource } from '../../../lib/project';

export const getTsConfigContent = (): Resource => {
    const tsconfigJson = {
        compilerOptions: {
            target: 'ES2024',
            module: 'commonjs',
            outDir: './dist',
            esModuleInterop: true,
            forceConsistentCasingInFileNames: true,
            strict: true,
            skipLibCheck: true,
        },
        include: ['src'],
    };
    return {
        filename: 'tsconfig.json',
        content: JSON.stringify(tsconfigJson, null, 4),
    };
};
