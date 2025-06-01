import { NodejsProject, Resource } from '../../../lib/project';

export const srcFileContent = (project: NodejsProject): Resource => {
    const filename = `src/index.${project.enabledTypescript ? 'ts' : 'js'}`;
    const content = `
async function main() {
    console.log('Hello from ${project.name}');
}

main().catch((error) => console.error(error));
`;

    return {
        filename,
        content,
    };
};
