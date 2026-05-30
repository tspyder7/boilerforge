import { merge } from 'lodash';
import { ExprContextData } from '../types/context';

export class ExprContext {
    static #instance: ExprContext;
    data: ExprContextData;

    private constructor() {
        this.data = {
            global: {
                cwd: process.cwd(),
                platform: process.platform,
            },
        };
    }

    static getContext(): ExprContext {
        if (!ExprContext.#instance) {
            ExprContext.#instance = new ExprContext();
        }
        return ExprContext.#instance;
    }

    static setContext(data: ExprContextData) {
        const ctx = this.getContext();
        ctx.data = merge({}, ctx.data, data);
    }
}
