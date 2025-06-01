export type TaskHandler = (...args: unknown[]) => Promise<unknown> | unknown;

export interface TaskProps {
    title: string;
    task?: TaskHandler;
    enabled?: TaskHandler;
    subTasks?: Task[];
    concurrent?: boolean;
    rollback?: TaskHandler;
    exitOnError?: boolean;
}

export class Task {
    title: string;
    task: TaskHandler;
    enabled?: TaskHandler;
    subTasks: Task[];
    concurrent: boolean;
    rollback?: TaskHandler;
    exitOnError?: boolean;

    constructor(taskProps: TaskProps) {
        const {
            title,
            task,
            enabled,
            subTasks,
            concurrent,
            rollback,
            exitOnError,
        } = taskProps;

        this.title = title;
        this.task = task ?? (() => {});
        this.enabled = enabled;
        this.subTasks = subTasks ?? [];
        this.concurrent = concurrent ?? false;
        this.rollback = rollback;
        this.exitOnError = exitOnError ?? true;
    }
}
