import { NodejsProject, ProjectDependency } from '../../../lib/project';

export const getProjectDeps = (project: NodejsProject): ProjectDependency => {
    const { enabledEslintPrettier, enabledTypescript } = project;

    const esLintPrettierDeps = enabledEslintPrettier
        ? [
              '@eslint/js',
              'eslint',
              'globals',
              'prettier',
              ...(enabledTypescript
                  ? [
                        '@typescript-eslint/eslint-plugin',
                        '@typescript-eslint/parser',
                        'typescript-eslint',
                    ]
                  : []),
          ]
        : [];

    const tsDeps = enabledTypescript
        ? ['@types/node', 'ts-node', 'typescript', 'rimraf']
        : [];

    return {
        dependencies: [],
        devDependencies: [...esLintPrettierDeps, ...tsDeps],
    };
};
