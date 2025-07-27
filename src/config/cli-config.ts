// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const VERSION: string;

const runtimeVersion = typeof VERSION !== 'undefined' ? VERSION : '0.0.0-dev';

type SemVersion =
    | `${number}.${number}.${number}`
    | `${number}.${number}.${number}-${string}`
    | `${number}.${number}.${number}+${string}`
    | `${number}.${number}.${number}-${string}+${string}`;

type CLIConfiguration = {
    name: string;
    description: string;
    version: SemVersion;
};

const cliConfig: CLIConfiguration = {
    name: 'boilerforge',
    description:
        'boilerforge is a blazing-fast CLI utility that scaffolds clean, ready-to-use project structures so you can skip the setup and start building instantly.',
    version: runtimeVersion as SemVersion,
};

export default cliConfig;
