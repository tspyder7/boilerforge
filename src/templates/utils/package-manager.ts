import { ProjectDependency } from '../../lib/project';
import { execCmd, ExecCmdError } from '../../utils/exec-cmd';
import { logger } from '../../utils/logger';

export enum PackageManager {
    YARN = 'yarn',
    NPM = 'npm',
    PNPM = 'pnpm',
}

export const getPackageManagerVersion = async (
    packageManager: string,
): Promise<string | undefined> => {
    try {
        const { stdout: packageManagerVersion = '' } =
            (await execCmd(`${packageManager} --version`)) ?? {};

        return (
            packageManagerVersion.match(/(?=(\d+.\d+.\d+))/)?.[1] ?? undefined
        );
    } catch (error) {
        const { code, message } = error as ExecCmdError;

        if (code === 'ENOENT') return undefined;

        logger.err(
            `Error while checking if ${packageManager} exists, Code: ${code} | Message: ${message}`,
        );

        throw new Error(
            `${getPackageManagerVersion.name} error, Code: ${code} | Message: ${message}`,
        );
    }
};

export const installDependencies = async (
    projectDir: string,
    packageManager: string,
    projectDeps: ProjectDependency,
) => {
    try {
        const { dependencies, devDependencies } = projectDeps;

        const cmdForInstall =
            packageManager === PackageManager.YARN ? 'add' : 'install';

        const devDepsCmd = `${packageManager} ${cmdForInstall} -D ${devDependencies.join(' ')}`;

        devDependencies.length &&
            (await execCmd(devDepsCmd, { cwd: projectDir }));

        dependencies.length &&
            (await execCmd(
                `${packageManager} ${cmdForInstall} ${dependencies.join(' ')}`,
                { cwd: projectDir },
            ));
    } catch (error) {
        const { code, message } = error as ExecCmdError;

        logger.err(
            `Error while installing node dependencies ${packageManager}, Code: ${code} | Message: ${message}`,
        );

        throw new Error(
            `${installDependencies.name} error, Code: ${code} | Message: ${message}`,
        );
    }
};

export const getLockFileName = (packageManager: string): string | undefined => {
    const lockFileMap: Record<string, string> = {
        [PackageManager.YARN]: 'yarn.lock',
        [PackageManager.NPM]: 'package-lock.json',
        [PackageManager.PNPM]: 'pnpm-lock.yaml',
    };

    return lockFileMap[packageManager];
};
