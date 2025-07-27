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
    version: '1.0.0',
};

export default cliConfig;
