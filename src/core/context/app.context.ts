import { merge } from 'lodash';
import { AppContextData } from '../types/context';

export class AppContext {
    static #instance: AppContext;
    data: AppContextData;

    private constructor() {
        this.data = {
            name: '',
        };
    }

    static getContext(): AppContext {
        if (!AppContext.#instance) {
            AppContext.#instance = new AppContext();
        }
        return AppContext.#instance;
    }

    static setContext(data: AppContextData) {
        const ctx = this.getContext();
        ctx.data = merge({}, ctx.data, data);
    }
}
