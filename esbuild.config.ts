// esbuild.config.ts
import { build } from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import { readFileSync } from 'fs';

const { version } = JSON.parse(readFileSync('package.json', 'utf-8'));

build({
    entryPoints: ['bin/cli.ts'],
    outfile: 'dist/cli.js',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    logLevel: 'info',
    plugins: [
        copy({
            assets: {
                from: ['./templates/**/*'],
                to: ['./templates'],
            },
        }),
    ],
    define: {
        VERSION: JSON.stringify(version), // injects into runtime
    },
}).catch(() => process.exit(1));
