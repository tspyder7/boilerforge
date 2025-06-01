import { NodejsProject, Resource } from '../../../lib/project';
import { PackageManager } from '../../utils/package-manager';

export const getPackageJsonContent = (project: NodejsProject): Resource => {
    const { name, author, description, packageManager, version } = project;

    const ci = `${packageManager} ${packageManager === PackageManager.NPM ? 'ci' : 'install --frozen-lockfile'}`;

    const prebuildScript = [`${packageManager} run clean`];

    project.enabledEslintPrettier &&
        prebuildScript.push(
            `${packageManager} run lint`,
            `${packageManager} run format`,
        );

    const packageJson = {
        name,
        version,
        description,
        author,
        license: 'ISC',
        packageManager: project.getPackageManager(),
        main: project.enabledTypescript ? 'dist/' : 'src/',
        scripts: {
            ci,
            ...(project.enabledTypescript
                ? {
                      clean: 'rimraf dist',
                      build: 'tsc',
                      dev: 'ts-node src/',
                      prebuild: prebuildScript.join(' && '),
                      start: 'node dist/',
                      ...(project.enabledEslintPrettier
                          ? {
                                lint: 'eslint --ext .js,.ts .',
                                format: 'prettier --write "**/*.+(js|ts)"',
                            }
                          : {}),
                  }
                : {
                      start: 'node src/',
                      ...(project.enabledEslintPrettier
                          ? {
                                lint: 'eslint --ext .js .',
                                format: 'prettier --write "**/*.+(js)"',
                            }
                          : {}),
                  }),
        },
    };

    return {
        filename: 'package.json',
        content: JSON.stringify(packageJson, null, 4),
    };
};
