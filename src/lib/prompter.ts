import chalk from 'chalk';
import { prompt } from 'enquirer';

type QuestionResponse<Q extends Question> = Q extends InputQuestion
    ? string
    : Q extends SelectQuestion
      ? string
      : Q extends RadioQuestion
        ? boolean
        : Q extends MultiselectQuestion
          ? string[]
          : never;

type ResponseShape<T extends readonly Question[]> = {
    [K in T[number] as K['name']]: QuestionResponse<K>;
};

type QuestionType = 'input' | 'radio' | 'select' | 'multiselect';

type QuestionDescription = {
    message: string;
    default?: string;
};

type MultiselectChoice = {
    name: string;
    message: string;
};

type QuestionMap = {
    input: InputQuestion;
    select: SelectQuestion;
    multiselect: MultiselectQuestion;
    radio: RadioQuestion;
};

type PromptMap = {
    input: InputPrompt;
    select: SelectPrompt;
    multiselect: MultiselectPrompt;
    radio: RadioPrompt;
};

type QuestionHandler = {
    [K in keyof QuestionMap]: (question: QuestionMap[K]) => PromptMap[K];
};

interface BaseQuestion {
    type: QuestionType;
    name: string;
    description?: QuestionDescription;
    skip?: boolean;
    validate?: (value: string) => boolean | string;
}

interface SelectQuestion extends BaseQuestion {
    type: 'select';
    choices: readonly string[];
    default: number;
}

interface MultiselectQuestion extends BaseQuestion {
    type: 'multiselect';
    choices: readonly MultiselectChoice[];
    default: number;
}

interface InputQuestion extends BaseQuestion {
    type: 'input';
    default: string;
}

interface RadioQuestion extends BaseQuestion {
    type: 'radio';
    enabled: string;
    disabled: string;
    default: boolean;
}

interface InputPrompt {
    type: 'input';
    name: string;
    message: string;
    initial: string;
}

interface SelectPrompt {
    type: 'select';
    name: string;
    message: string;
    choices: readonly string[];
    initial: number;
}

interface MultiselectPrompt {
    type: 'multiselect';
    name: string;
    message: string;
    choices: readonly MultiselectChoice[];
    initial: number;
}

interface RadioPrompt {
    type: 'toggle';
    name: string;
    message: string;
    enabled: string;
    disabled: string;
    initial: boolean;
}

export type Question =
    | InputQuestion
    | SelectQuestion
    | RadioQuestion
    | MultiselectQuestion;

export type PromptObject =
    | InputPrompt
    | SelectPrompt
    | RadioPrompt
    | MultiselectPrompt;

export class Prompter<T extends readonly Question[] = Question[]> {
    questions: T;

    constructor(questions?: T) {
        this.questions = (questions ?? []) as T;
    }

    addQuestion<Q extends Question>(question: Q): Prompter<[...T, Q]> {
        return new Prompter<[...T, Q]>([...this.questions, question]);
    }

    buildPrompt(): PromptObject[] {
        const baseBuilder = <T extends Question>(
            question: T,
        ): {
            type: T['type'];
            name: string;
            message: string;
            validate?: (value: string) => boolean | string;
        } => ({
            type: question.type,
            name: question.name,
            message:
                chalk.cyan(question.description?.message) +
                (question.description?.default
                    ? chalk.gray(` (${question.description.default})`)
                    : ''),
            validate: question.validate
                ? (value) => {
                      const result = question.validate?.(value);
                      if (typeof result === 'boolean') return result;
                      return chalk.redBright(result);
                  }
                : undefined,
        });

        const questionHandler: QuestionHandler = {
            input: (question: InputQuestion) => ({
                ...baseBuilder(question),
                initial: question.default,
            }),
            select: (question: SelectQuestion) => ({
                ...baseBuilder(question),
                choices: question.choices,
                initial: question.default,
            }),
            multiselect: (question: MultiselectQuestion) => ({
                ...baseBuilder(question),
                choices: question.choices,
                initial: question.default,
            }),
            radio: (question: RadioQuestion) => ({
                ...baseBuilder(question),
                type: 'toggle',
                enabled: question.enabled,
                disabled: question.disabled,
                initial: question.default,
            }),
        };

        const prompts: PromptObject[] = [];

        this.questions.forEach((question) => {
            const handler = questionHandler[question.type] as (
                q: typeof question,
            ) => PromptObject;

            !question.skip && prompts.push(handler(question));
        });

        return prompts;
    }

    async prompt(): Promise<ResponseShape<T>> {
        const prompts = this.buildPrompt();
        return (await prompt(prompts)) as ResponseShape<T>;
    }
}
