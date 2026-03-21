/* eslint-disable @typescript-eslint/no-explicit-any */
import { Listr, ListrTaskWrapper } from 'listr2';
import { Task } from './task.model';
import { TaskExecutorProps } from '../../types/task';

export class TaskExecutor {
    public tasks: Task[] = [];
    private executedTasks: Task[] = [];
    private taskExecutor = new Listr([]);
    private showSubTasks?: boolean;
    private showErrorMessage?: boolean;

    constructor(props: TaskExecutorProps) {
        this.tasks = props.tasks;
        this.showErrorMessage = props.showErrorMessage ?? false;
        this.showSubTasks = props.showSubTasks ?? true;
    }

    async execute(): Promise<void> {
        try {
            const listrTasks = await Promise.all(
                this.tasks.map(
                    async (task) => await this.buildExecutableTask(task),
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
            console.log(error);
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

    private async buildExecutableTask(
        task: Task,
    ): Promise<{ title: string; task: any; enabled?: any }> {
        if (!task.subTasks?.length) {
            return {
                title: task.title,
                enabled: task.enabled,
                task: async () => {
                    await task.handler();
                    this.executedTasks.push(task);
                },
            };
        }

        return {
            title: task.title,
            task: async (
                _: any,
                listrTask: ListrTaskWrapper<any, any, any>,
            ) => {
                await task.handler();
                this.executedTasks.push(task);

                const subTasks = [];
                for (const subTask of task.subTasks || []) {
                    subTasks.push(await this.buildExecutableTask(subTask));
                }

                return listrTask.newListr([...subTasks], {
                    exitOnError: task.exitOnError,
                    concurrent: task.concurrent,
                });
            },
        };
    }
}
