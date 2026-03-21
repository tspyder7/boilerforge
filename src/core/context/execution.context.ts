import { uuid } from '../../utils/uuid';
import { ExecutionContextData } from '../types/context';

export class ExecutionContext {
    static #instance: ExecutionContext;
    readonly data: ExecutionContextData;

    private constructor() {
        this.data = {
            dirPath: process.cwd(),
            executionId: uuid(),
            executionTime: new Date().toISOString(),
        };
    }

    static getContext(): ExecutionContext {
        if (!ExecutionContext.#instance) {
            ExecutionContext.#instance = new ExecutionContext();
        }
        return ExecutionContext.#instance;
    }
}
