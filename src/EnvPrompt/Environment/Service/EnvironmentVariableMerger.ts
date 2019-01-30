import { FilesystemFacade } from '@/EnvPrompt/Filesystem/Service/FilesystemFacade';
import { CommandLinePrompter } from '@/EnvPrompt/UserInteraction/Service/CommandLinePrompter';
import { EnvironmentVariableSerializer } from '@/EnvPrompt/Environment/Service/EnvironmentVariableSerializer';
import { EnvironmentVariableDictionary } from '@/EnvPrompt/Environment/Model/EnvironmentVariable';

export class EnvironmentVariableMerger {
    private filesystemFacade: FilesystemFacade;

    private environmentVariableSerializer: EnvironmentVariableSerializer;

    private commandLinePrompter: CommandLinePrompter;

    public constructor(
        filesystemFacade: FilesystemFacade,
        environmentVariableSerializer: EnvironmentVariableSerializer,
        commandLinePrompter: CommandLinePrompter
    ) {
        this.filesystemFacade = filesystemFacade;
        this.environmentVariableSerializer = environmentVariableSerializer;
        this.commandLinePrompter = commandLinePrompter;
    }

    /**
     * Interactively merge the "dist" and "local" environment variable files, writing any missing values to the
     *  "local" file.
     */
    public async merge(distFilePath: string, localFilePath: string) {
        // at minimum, a "dist" file is required
        if (!this.filesystemFacade.fileExists(distFilePath)) {
            throw new Error(`Could not locate ${distFilePath}`);
        }

        // parse the "dist" and "local" files into two dictionaries of environment variables
        const distEnvironmentVariables: EnvironmentVariableDictionary = this.getEnvironmentVariables(distFilePath);
        const localEnvironmentVariables: EnvironmentVariableDictionary = this.getEnvironmentVariables(localFilePath);
        let isPromptGiven: boolean = false;

        // merge the two dictionaries
        for (let name in distEnvironmentVariables) {
            if (!localEnvironmentVariables[name]) {
                // only prompt the user once that new environment variables exist
                if (!isPromptGiven) {
                    isPromptGiven = true;
                    this.commandLinePrompter.promptUserAboutNewVariables();
                }

                // get user input for environment variable
                localEnvironmentVariables[name] = await this.commandLinePrompter.promptUserForEnvironmentVariable(
                    distEnvironmentVariables[name]
                );
            }
        }

        // write to "local" environment variables file
        this.setEnvironmentVariables(localFilePath, localEnvironmentVariables);
    }

    /**
     * Read from environment variables file and deserialize the contents into a dictionary of environment variables
     */
    private getEnvironmentVariables(filePath: string): EnvironmentVariableDictionary {
        let content: string = '';

        if (this.filesystemFacade.fileExists(filePath)) {
            content = this.filesystemFacade.readFile(filePath);
        }

        return this.environmentVariableSerializer.deserialize(content);
    }

    /**
     * Write dictionary of environment variables to a file
     */
    private setEnvironmentVariables(filePath: string, environmentVariables: EnvironmentVariableDictionary): void {
        const content: string = this.environmentVariableSerializer.serialize(environmentVariables);

        this.filesystemFacade.writeFile(filePath, content)
    }
}
