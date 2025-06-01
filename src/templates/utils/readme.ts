import remarkStringify from 'remark-stringify';
import { Root } from 'remark-stringify/lib';
import { unified } from 'unified';
import { u } from 'unist-builder';
import { NodejsProject, Resource } from '../../lib/project';
import { Badge } from './badges';
import { PackageManager } from './package-manager';

const createBadgeNode = (alt: string, url: string, title?: string) =>
    u('paragraph', [
        u('image', {
            url,
            alt,
            title: title || alt,
        }),
    ]);

const generateReadMeContent = (project: NodejsProject): string => {
    const {
        name: projectName,
        description,
        packageManager,
        enabledTypescript,
        enabledEslintPrettier,
    } = project;

    const installDepsCommand =
        packageManager === PackageManager.YARN
            ? packageManager
            : `${packageManager} install`;

    const versionBadge = createBadgeNode(
        'version',
        `https://img.shields.io/badge/version-${project.version}-green.svg`,
    );

    const techBadges = [
        'nodejs',
        project.packageManager,
        enabledTypescript ? 'typescript' : 'javascript',
        ...(enabledEslintPrettier ? ['eslint', 'prettier'] : []),
    ].map((tech) => createBadgeNode(tech, Badge[tech.toUpperCase()]));

    const readmeAst = u('root', [
        u('heading', { depth: 1 }, [u('text', `🚀 ${projectName}`)]),

        u('paragraph', versionBadge),

        ...(description.length
            ? [
                  u('heading', { depth: 2 }, [u('text', '📖 About Project')]),
                  u('paragraph', [u('text', description)]),
              ]
            : []),

        u('heading', { depth: 3 }, [u('text', 'Built With')]),

        u('heading', { depth: 4 }, techBadges),

        u('heading', { depth: 3 }, [u('text', '🛠️ Installation')]),

        u('heading', { depth: 4 }, [
            u('text', 'Navigate into the project directory'),
        ]),
        u('code', { lang: '' }, `cd ${projectName}`),

        u('heading', { depth: 4 }, [u('text', 'Install dependencies')]),
        u('code', { lang: '' }, installDepsCommand),

        u('heading', { depth: 3 }, [u('text', '▶️ Running the App')]),

        ...(enabledTypescript
            ? [
                  u('heading', { depth: 4 }, [
                      u('text', 'To start the app in development mode:'),
                  ]),
                  u('code', { lang: '' }, `${packageManager} run dev`),
              ]
            : []),

        u('paragraph', [u('text', 'To start the app in production mode:')]),

        ...(enabledTypescript
            ? [
                  u('list', { ordered: false }, [
                      u('listItem', [
                          u('paragraph', [u('text', 'Build the project')]),
                          u(
                              'code',
                              { lang: '' },
                              `${packageManager} run build`,
                          ),
                      ]),
                      u('listItem', [
                          u('paragraph', [u('text', 'Run app in production')]),
                          u(
                              'code',
                              { lang: '' },
                              `${packageManager} run start`,
                          ),
                      ]),
                  ]),
              ]
            : [u('code', { lang: '' }, `${packageManager} run start`)]),
    ]);

    return unified()
        .use(remarkStringify)
        .stringify(readmeAst as Root);
};

export const getReadmeContent = (project: NodejsProject): Resource => ({
    filename: 'README.md',
    content: generateReadMeContent(project),
});
