/* eslint-disable @typescript-eslint/no-unused-vars */
import path, { sep } from 'path';
import { File } from '../../lib/file';
import {
    NodejsProject,
    NodejsProjectProps,
    ProjectDependency,
    Resource,
} from '../../lib/project';
import { Prompter } from '../../lib/prompter';
import { Task } from '../../lib/task';
import { execCmd } from '../../utils/exec-cmd';
import { getGitConfiguration, getGitVersion } from '../utils/git';
import {
    getLockFileName,
    getPackageManagerVersion,
    installDependencies,
} from '../utils/package-manager';
import { getReadmeContent } from '../utils/readme';
import { getProjectDeps } from '../create-node-app/resource/project-deps';
import { Regex } from '../../utils';
import { globby } from 'globby';
import Handlebars from 'handlebars';
import { readFile, readFileSync } from 'fs';

export class CreateSimpleApp extends NodejsProject {
    constructor(props: NodejsProjectProps) {
        super(props);
        this.isTypescript = false;
        this.isEslintPrettier = false;
        this.configureCliCommand();
    }

    async setup(): Promise<CreateSimpleApp> {
        // creating the tasks
        const {
            systemCheckTask,
            setupProjectTask,
            installDepsTask,
            gitInitTask,
        } = this.buildTasks(getProjectDeps(this));

        this.tasks = [
            systemCheckTask,
            setupProjectTask,
            installDepsTask,
            gitInitTask,
        ];

        await this.bootstrap();

        return this;
    }

    buildTasks(projectDeps: ProjectDependency): {
        systemCheckTask: Task;
        setupProjectTask: Task;
        installDepsTask: Task;
        gitInitTask: Task;
    } {
        // verify git
        const verifyGitTask = new Task({
            title: 'Checking Git availability',
            task: async () => {
                this.systemCheck.git = {
                    version: await getGitVersion(),
                };
            },
        });

        // git configuration (user.name & user.email)
        const verifyGitConfigTask = new Task({
            title: 'Checking Git config (user.name & user.email)',
            enabled: () => !!this.systemCheck.git,
            task: async () => {
                const gitConfig = await getGitConfiguration({
                    global: true,
                });

                if (!gitConfig) return;

                const username = gitConfig['user.name'];
                const email = gitConfig['user.email'];

                username &&
                    email &&
                    (this.systemCheck.git = {
                        ...this.systemCheck.git,
                        configuration: {
                            username,
                            email,
                        },
                    });
            },
        });

        // verify package manager
        const verifyPkgManagerTask = new Task({
            title: `Verifying ${this.packageManager} availability`,
            task: async () => {
                const pkgManagerVersion = await getPackageManagerVersion(
                    this.packageManager,
                );

                if (!pkgManagerVersion)
                    throw new Error(`${this.packageManager} is not installed`);

                this.packageManagerVersion = pkgManagerVersion;
                this.systemCheck.packageManager = `${this.packageManager}@${pkgManagerVersion}`;
            },
        });

        // checking system requirements
        const systemCheckTask = new Task({
            title: 'Verifying System Requirements',
            subTasks: [
                verifyGitTask,
                verifyGitConfigTask,
                verifyPkgManagerTask,
            ],
        });

        // creating the project dir
        const setupProjectTask = new Task({
            title: `Scaffolding ${this.name} project`,
            task: async () => {
                const resourceFileContent: Resource[] = [
                    // getGitIgnoreContent(),
                    // getEditorConfigContent(),
                    // ...(this.enabledEslintPrettier
                    //     ? [getEslintContent(this), getPrettierrcContent()]
                    //     : []),
                    // getPackageJsonContent(this),
                    // getPrettierIgnoreContent(),
                    // ...(this.enabledTypescript ? [getTsConfigContent()] : []),
                    // getReadmeContent(this),
                    // srcFileContent(this),
                ];

                this.files = resourceFileContent.map(
                    ({ filename, content }) =>
                        new File(filename, {
                            dirPath: this.projectPath,
                            content: `${content.trim()}\n`,
                        }),
                );

                await Promise.all(this.files.map((file) => file.create()));
            },
            rollback: () => {
                this.files.map((file) => file.delete());
            },
        });

        // installing dependencies
        const installDepsTask = new Task({
            title: `Installing dependencies`,
            task: async () => {
                await installDependencies(
                    this.projectPath,
                    this.packageManager,
                    projectDeps,
                );
            },
            rollback: async () => {
                await execCmd(`rm -rf node_modules`, {
                    cwd: this.projectPath,
                    throwError: false,
                });

                const lockFile = getLockFileName(this.packageManager);

                lockFile &&
                    (await execCmd(`rm ${lockFile}`, {
                        cwd: this.projectPath,
                        throwError: false,
                    }));
            },
        });

        // initialize git
        const gitInitTask = new Task({
            title: 'Initializing git',
            enabled: () => !!this.systemCheck.git?.version,
            task: async () => {
                await execCmd('git init', {
                    cwd: this.projectPath,
                });

                const { username, email } =
                    this.systemCheck.git?.configuration ?? {};

                username &&
                    email &&
                    (await execCmd('git commit -am"✨ Initial project setup"', {
                        cwd: this.projectPath,
                    }));
            },
            rollback: async () =>
                this.systemCheck.git?.version &&
                (await execCmd(`rm -rf .git`, {
                    cwd: this.projectPath,
                    throwError: false,
                })),
        });

        return {
            systemCheckTask,
            setupProjectTask,
            installDepsTask,
            gitInitTask,
        };
    }

    async configureCliCommand(): Promise<CreateSimpleApp> {
        this.program
            .command('create-simple-app')
            .description('Create simple app')
            .argument('[name]', 'name of the project', '')
            .action(async (name) => {
                console.log(this);

                this.name = name;
                await this.promptUser();
                await this.compileTemplateFiles();
                // await this.setup();
            });

        return this;
    }

    async promptUser(): Promise<void> {
        const prompter = new Prompter([
            {
                type: 'input',
                name: 'name',
                default: '',
                description: {
                    message: 'Project name',
                    default: process.cwd().split(sep).slice(-1)[0],
                },
                validate: (value) =>
                    !value.length || Regex.PROJECT_NAME.test(value)
                        ? true
                        : 'Invalid project name',
                skip: !!this.name.length,
            },
            {
                type: 'input',
                name: 'description',
                default: '',
                description: { message: 'Description' },
            },
            {
                type: 'input',
                name: 'version',
                default: '0.0.1',
                description: { message: 'Version' },
                validate: (value) =>
                    Regex.VERSION.test(value) ? true : 'Invalid version',
            },
            {
                type: 'input',
                name: 'author',
                default: '',
                description: { message: 'Author' },
            },
            {
                type: 'select',
                name: 'packageManager',
                choices: ['npm', 'yarn', 'pnpm'],
                default: 0,
                description: { message: 'Package manager', default: 'npm' },
            },
            {
                type: 'radio',
                name: 'isTypescript',
                enabled: 'Yes',
                disabled: 'No',
                default: true,
                description: { message: 'Use TypeScript' },
            },
            {
                type: 'radio',
                name: 'isEslintPrettier',
                enabled: 'Yes',
                disabled: 'No',
                default: true,
                description: { message: 'Use ESLint & Prettier formatting' },
            },
        ] as const);

        const { isEslintPrettier, isTypescript, ...restResponse } =
            await prompter.prompt();

        this.configureProject({
            ...restResponse,
        });

        this.isTypescript = isTypescript;
        this.isEslintPrettier = isEslintPrettier;
    }

    async compileTemplateFiles(): Promise<Resource[]> {
        const templateDirPath = path.resolve(
            __dirname,
            '../templates',
            'create-simple-app',
        );

        const templateFiles = await globby('**/*.hbs', {
            cwd: templateDirPath,
            absolute: true,
            dot: true,
        });

        const compiledFiles = templateFiles.map((filePath) => {
            const tpl = readFileSync(filePath, 'utf-8');
            const render = Handlebars.compile(tpl);
            return {
                filename: filePath
                    .replace(templateDirPath + sep, '')
                    .replace('.hbs', ''),
                content: render({ name: this.name }),
            };
        });

        console.log({
            templateDirPath,
            templateFiles,
            compiledFiles,
        });

        return [];
    }
}
