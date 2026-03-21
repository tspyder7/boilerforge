import { CLIConfiguration } from '../types/cli';
import { getCLIVersion } from '../utils/cliVersion';

const cliConfig: CLIConfiguration = {
    name: 'boilerforge',
    description:
        'boilerforge is a blazing-fast CLI utility that scaffolds clean, ready-to-use project structures so you can skip the setup and start building instantly.',
    version: getCLIVersion(),
};

export default cliConfig;
