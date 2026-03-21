import { SemVersion } from '../types/cli';

declare const CLI_VERSION: string;

export const getCLIVersion = (): SemVersion => {
    return (
        typeof CLI_VERSION !== 'undefined' ? CLI_VERSION : '0.0.0-dev'
    ) as SemVersion;
};
