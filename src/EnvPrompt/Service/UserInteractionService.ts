import { Variable, VariableDictionary } from '@/EnvPrompt/Model/Variable';
import { FilesystemService } from '@/EnvPrompt/Service/FilesystemService';
import { NodeFactory } from '@/EnvPrompt/Factory/NodeFactory';
import { ReadLine }  from 'readline';

/**
 * Service containing all business logic for interacting with the user.  This includes interactively merging .env files
 */
export class UserInteractionService {
    private filesystemService: FilesystemService;

    private nodeFactory: NodeFactory;

    public constructor(filesystemService: FilesystemService, nodeFactory: NodeFactory) {
        this.filesystemService = filesystemService;
        this.nodeFactory = nodeFactory;
    }

    /**
     * Merge two .env files
     */
    public async mergeFiles(distPath, envPath) {
        console.log(this.bold('Updating') + ' ' + envPath);
        let dist: VariableDictionary = await this.filesystemService.getVariablesFromFile(distPath);
        let env: VariableDictionary = await this.filesystemService.getVariablesFromFile(envPath);
        this.mergeVariables(dist, env, envPath);
    }

    /**
     * Display an error to the user via stderr
     */
    public printError(error: Error) {
        console.error(this.fgRed('ERROR: ' + error.message));
    }

    /**
     * Merge two sets of environment variables interactively, and write the combined set of variables
     *  to a specified file.
     */
    private async mergeVariables(dist: VariableDictionary, env: VariableDictionary, envPath: string) {
        let stdIoReader: ReadLine = this.nodeFactory.buildStdIoReader();
        let isPromptGiven: boolean = false;

        for (let name in dist) {
            if (!env[name]) {
                if (!isPromptGiven) {
                    isPromptGiven = true;
                    console.warn(this.fgYellow('New environment variables were found. When prompted, please enter their values.'));
                }

                env[name] = await this.promptUserForVariable(stdIoReader, dist[name]);
            }
        }

        stdIoReader.close();
        this.filesystemService.writeVariablesToFile(envPath, env);
    }

    /**
     * Prompt user to input a value for a given environment variable
     */
    private async promptUserForVariable(stdIoReader: ReadLine, variable: Variable): Promise<Variable> {
        return new Promise<Variable>(async (resolve) => {
            let name = variable.name;
            let defaultValue = variable.value;
            let value: string = await this.promptUser(stdIoReader, this.buildQuestion(name, defaultValue));
            if (value.trim().length === 0) {
                value = defaultValue;
            }

            resolve({ name, value });
        });
    }

    /**
     * Builds question text to prompt user with
     */
    private buildQuestion(name: string, defaultValue: string) {
        if (defaultValue.trim().length > 0) {
            defaultValue = ` (${this.fgYellow(defaultValue)})`;
        }

        return `${this.bgCyan(name)}${defaultValue}: `;
    }

    /**
     * Prompt user with a question and return their input
     */
    private async promptUser(stdIoReader: ReadLine, question: string): Promise<string> {
        return new Promise<string>((resolve) => {
            stdIoReader.question(question, (input: string) => {
                resolve(input);
            });
        })
    }

    /**
     * Make text background color cyan
     */
    private bgCyan(message: string): string {
        return `\x1b[46m${message}\x1b[0m`;
    }

    /**
     * Make text color red
     */
    private fgRed(message: string): string {
        return `\x1b[31m${message}\x1b[0m`;
    }

    /**
     * Make text color yellow
     */
    private fgYellow(message: string): string {
        return `\x1b[33m${message}\x1b[0m`;
    }

    /**
     * Make text color green
     */
    private fgGreen(message: string): string {
        return `\x1b[32m${message}\x1b[0m`;
    }

    /**
     * Make text bold
     */
    private bold(message: string): string {
        return `\x1b[1m${message}\x1b[0m`;
    }
}
