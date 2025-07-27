import { Command } from 'commander';
import { Listr, ListrTaskWrapper } from 'listr2';
import { dirname, join, sep } from 'path';
import { logger } from '../utils/logger';
import { File } from './file';
import { Task } from './task';

export interface GitCheck {
    version?: string;
    configuration?: {
        username: string;
        email: string;
    };
}

export interface SystemCheck {
    git?: GitCheck;
    packageManager?: string;
}

export interface ProjectDependency {
    devDependencies: string[];
    dependencies: string[];
}

export interface Resource {
    filename: string;
    content: string;
}

export interface ProjectProps {
    name: string;
    packageManager: string;
    description?: string;
    version?: string;
    author?: string;
}

export interface BootstrapProps extends Partial<ProjectProps> {
    program: Command;
    showSubTasks?: boolean;
    showErrorMessage?: boolean;
}

export interface NodejsProjectProps extends BootstrapProps {}

export abstract class Project {
    name: string = '';
    description: string = '';
    version: string = '';
    author: string = '';
    projectPath: string = '';
    parentDirPath: string = '';
    packageManager: string = '';
    packageManagerVersion: string = '';

    protected configureProject(projectProps: Partial<ProjectProps>) {
        const {
            name = this.name,
            description,
            version = '0.0.1',
            author,
            packageManager = '',
        } = projectProps;

        const cwd = process.cwd();

        this.name = !name.length ? cwd.split(sep).slice(-1)[0] : name;
        this.description = description?.length
            ? description
            : `Node.js application for ${this.name}`;
        this.version = version;
        this.author = author ?? '';
        this.packageManager = packageManager;
        this.projectPath = join(cwd, name.length ? name : '');
        this.parentDirPath = name.length ? cwd : dirname(cwd);
        this.packageManagerVersion = '';
    }

    getPackageManager() {
        return `${this.packageManager}@${this.packageManagerVersion}`;
    }
}

export abstract class Bootstrap extends Project {
    protected tasks: Task[];
    protected executedTasks: Task[];
    protected showSubTasks?: boolean;
    protected showErrorMessage?: boolean;
    protected taskExecutor: Listr;
    protected systemCheck: SystemCheck;
    protected files: File[];
    protected program: Command;
    protected cmdExecutedFromDir: string;

    constructor(props: BootstrapProps) {
        super();
        this.tasks = [];
        this.executedTasks = [];
        this.showSubTasks = props.showSubTasks ?? true;
        this.showErrorMessage = props.showErrorMessage ?? false;
        this.taskExecutor = new Listr([]);
        this.systemCheck = {};
        this.files = [];
        this.program = props.program;
        this.cmdExecutedFromDir = process.cwd();
        this.configureProject(props);
    }

    private async buildListrTask(
        taskHandler: Task,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<{ title: string; task: any; enabled?: any }> {
        if (!taskHandler.subTasks.length) {
            return {
                title: taskHandler.title,
                enabled: taskHandler.enabled,
                task: async () => {
                    await taskHandler.task();
                    this.executedTasks.push(taskHandler);
                },
            };
        }

        return {
            title: taskHandler.title,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            task: async (_: any, task: ListrTaskWrapper<any, any, any>) => {
                await taskHandler.task();
                this.executedTasks.push(taskHandler);

                const subTasks = [];
                for (const subTask of taskHandler.subTasks) {
                    subTasks.push(await this.buildListrTask(subTask));
                }

                return task.newListr([...subTasks], {
                    exitOnError: taskHandler.exitOnError,
                    concurrent: taskHandler.concurrent,
                });
            },
        };
    }

    async bootstrap(): Promise<void> {
        try {
            const listrTasks = await Promise.all(
                this.tasks.map(
                    async (taskHandler) =>
                        await this.buildListrTask(taskHandler),
                ),
            );

            this.taskExecutor.add(listrTasks);
            this.taskExecutor.options = {
                rendererOptions: {
                    showErrorMessage: this.showErrorMessage,
                    showSubtasks: this.showSubTasks,
                },
            };
            await this.taskExecutor.run();
        } catch (error) {
            logger.err(error);

            const rollbacks = this.tasks
                .map(({ rollback }) => rollback)
                .reverse();

            await Promise.all(
                rollbacks.map(
                    async (rollback) => rollback && (await rollback()),
                ),
            );
        }
    }

    async setup(): Promise<Bootstrap> {
        throw new Error('Not Implemented');
    }

    async configureCliCommand(): Promise<Bootstrap> {
        throw new Error('Not Implemented');
    }

    async promptUser() {
        throw new Error('Not Implemented');
    }

    getSystemCheck() {
        return this.systemCheck;
    }
}

export abstract class NodejsProject extends Bootstrap {
    protected isTypescript: boolean;
    protected isEslintPrettier: boolean;

    constructor(nodejsProjectProps: NodejsProjectProps) {
        super(nodejsProjectProps);
        this.isTypescript = false;
        this.isEslintPrettier = false;
    }

    get enabledTypescript() {
        return this.isTypescript;
    }

    get enabledEslintPrettier() {
        return this.isEslintPrettier;
    }
}
