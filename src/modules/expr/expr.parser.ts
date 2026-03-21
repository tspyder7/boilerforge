import jexl from 'jexl';
import { sep } from 'path';

const getCwdDirName = () => {
    return process.cwd().split(sep).pop();
};

const matches = (value: string, regex: RegExp) => {
    if (!(regex instanceof RegExp)) {
        throw new Error(`Invalid Regex Expression: ${regex}`);
    }
    return regex.test(value);
};

const isBoolean = (value: string | boolean) => {
    if (typeof value === 'string') {
        return ['true', 'false'].includes(value.toLowerCase());
    }
    return true;
};

jexl.addFunctions({
    getCwdDirName,
    matches,
    isBoolean,
});

export const parser = jexl;
