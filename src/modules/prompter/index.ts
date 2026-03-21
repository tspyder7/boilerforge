import { prompt } from 'enquirer';
import { PromptParser } from './prompt.parser';
import { AppArgs } from '../../types/common';
import { Template } from '../template/template.model';

export const dispatchPrompts = async (template: Template): Promise<AppArgs> => {
    const parser = new PromptParser(template);
    const promptConfig = await parser.parse();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await prompt(promptConfig as any)) as AppArgs;
};
