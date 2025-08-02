// esbuild.config.ts
import { build } from 'esbuild';
import { readFileSync } from 'fs';

const { version } = JSON.parse(readFileSync('package.json', 'utf-8'));

build({
    entryPoints: ['bin/cli.ts'],
    outfile: 'dist/cli.js',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    logLevel: 'info',
    define: {
        VERSION: JSON.stringify(version), // injects into runtime
    },
}).catch(() => process.exit(1));
