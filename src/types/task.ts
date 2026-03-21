import { Task } from '../modules/task/task.model';

export type TaskHandler = (...args: unknown[]) => Promise<unknown> | unknown;

export type TaskProps = {
    title: string;
    handler?: TaskHandler;
    enabled?: TaskHandler;
    subTasks?: TaskProps[];
    concurrent?: boolean;
    rollback?: TaskHandler;
    exitOnError?: boolean;
};

export type TaskExecutorProps = {
    tasks: Task[];
    showErrorMessage?: boolean;
    showSubTasks?: boolean;
};
