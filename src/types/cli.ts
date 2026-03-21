/* eslint-disable @typescript-eslint/no-explicit-any */
import { Command } from 'commander';

export type SemVersion =
    | `${number}.${number}.${number}`
    | `${number}.${number}.${number}-${string}`
    | `${number}.${number}.${number}+${string}`
    | `${number}.${number}.${number}-${string}+${string}`;

export type CLIConfiguration = {
    name: string;
    description: string;
    version: SemVersion;
};

type DefaultType<T> = T extends boolean
    ? boolean
    : T extends number
      ? number
      : T extends string
        ? string
        : T;

// Extracts the flag name from a string like "-d, --detailed" or "--format <type>"
type ExtractFlagName<S extends string> =
    S extends `${string}--${infer Long} ${string}`
        ? TrimKebab<Long> // Handle "--long <arg>"
        : S extends `${string}--${infer Long}`
          ? TrimKebab<Long> // Handle "--long"
          : S extends `${string}-${infer Short} ${string}`
            ? Short // Handle "-s <arg>"
            : S extends `${string}-${infer Short}`
              ? Short // Handle "-s"
              : never;

// Helper to remove commas or trailing spaces from the extracted name
type TrimKebab<T extends string> = T extends `${infer Word},${string}`
    ? Word
    : T;

// Converts kebab-case (detailed-data) to camelCase (detailedData)
type KebabToCamel<S extends string> = S extends `${infer T}-${infer U}`
    ? `${T}${Capitalize<KebabToCamel<U>>}`
    : S;

// The Final Result: Extracts name and converts to camelCase
export type MapFlag<S extends string> = KebabToCamel<ExtractFlagName<S>>;

export type GetOptions<T> = T extends { options: readonly any[] }
    ? {
          [O in T['options'][number] as MapFlag<O['flags']>]: O extends {
              default: infer D;
          }
              ? DefaultType<D>
              : string;
      }
    : Record<string, never>;

export type CmdProps = CLIConfiguration;

export interface ISubCommand<T> {
    config: SubCommandConfig;
    register(program: Command): void;
    action(args: string[], options: GetOptions<T>): void;
}

export type SubCommandConfig = {
    command: string;
    description: string;
    options: Array<{
        flags: string;
        description: string;
        default?: string | string[] | boolean;
    }>;
};
