import { Context } from 'jexl/Expression';
import { PromptContext } from '../../core/context/prompt.context';
import { parser } from './expr.parser';
import { ExprContext } from '../../core/context/expr.context';
import { Regex } from '../../constants';

export class Expr {
    static {
        ExprContext.setContext({
            Regex: {
                PROJECT_NAME: Regex.PROJECT_NAME,
                VERSION: Regex.APP_VERSION,
            },
        });
    }

    private constructor() {}

    static async evaluate<T>(expression: string, ctx?: Context): Promise<T> {
        try {
            if (!expression.trim().length)
                throw new Error('Expression cannot be empty.');

            const { data: promptCtx } = PromptContext.getContext();
            const { data: exprCtx } = ExprContext.getContext();

            return (await parser.eval(expression, {
                ...(ctx || {}),
                ...promptCtx,
                ...exprCtx,
            })) as T;
        } catch (error) {
            console.log(`Error: ${error}`);
            throw error;
        }
    }
}
