import { TaskHandler, TaskProps } from '../../types/task';

export class Task {
    title: string;
    handler: TaskHandler;
    enabled?: TaskHandler;
    subTasks?: Task[];
    concurrent?: boolean;
    rollback?: TaskHandler;
    exitOnError?: boolean;

    constructor(props: TaskProps) {
        this.title = props.title;
        this.handler = props.handler ?? (() => {});
        this.enabled = props.enabled;
        this.subTasks = props.subTasks?.map((task) => new Task(task)) ?? [];
        this.concurrent = props.concurrent ?? false;
        this.rollback = props.rollback;
        this.exitOnError = props.exitOnError ?? true;
    }
}
