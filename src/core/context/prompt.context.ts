import { PromptContextData } from '../types/context';
import { merge } from 'lodash';

export class PromptContext {
    static #instance: PromptContext;
    data: PromptContextData;

    private constructor() {
        this.data = {
            app: {},
        };
    }

    static getContext(): PromptContext {
        if (!PromptContext.#instance) {
            PromptContext.#instance = new PromptContext();
        }
        return PromptContext.#instance;
    }

    static setContext(data: Partial<PromptContextData>) {
        const ctx = this.getContext();
        ctx.data = merge({}, ctx.data, data);
    }
}
