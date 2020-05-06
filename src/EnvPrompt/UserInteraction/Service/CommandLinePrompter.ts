import { StdIoReaderFlyweight } from '@/EnvPrompt/UserInteraction/Service/StdIoReaderFlyweight';
import { EnvironmentVariable } from '@/EnvPrompt/Environment/Model/EnvironmentVariable';
import { TextFormatter } from '@/EnvPrompt/UserInteraction/Service/TextFormatter';

export class CommandLinePrompter {
    private stdIoReaderFlyweight: StdIoReaderFlyweight;

    private textFormatter: TextFormatter;

    public constructor(stdIoReaderFlyweight: StdIoReaderFlyweight, textFormatter: TextFormatter) {
        this.stdIoReaderFlyweight = stdIoReaderFlyweight;
        this.textFormatter = textFormatter;
    }

    /**
     * Prompt user that new environment variables were found that they must provide values for.
     */
    public promptUserAboutNewVariables() {
        console.warn(this.textFormatter.fgYellow(
            'New environment variables were found. When prompted, please enter their values.'
        ));
    }

    public notifyUserAboutNewVariables(name: string, value: string) {
        console.warn(this.textFormatter.fgYellow(`Added new environment variable ${name}=${value}`));
    }

    /**
     * Prompt user to input an environment variable's value
     */
    public async promptUserForEnvironmentVariable(environmentVariable: EnvironmentVariable): Promise<EnvironmentVariable> {
        return new Promise<EnvironmentVariable>(async (resolve) => {
            let name: string = environmentVariable.name;
            let defaultValue: string = environmentVariable.value;
            let question: string = this.textFormatter.buildQuestion(name, defaultValue);
            let value: string = await this.stdIoReaderFlyweight.promptUser(question);
            if (value.trim().length === 0) {
                value = defaultValue;
            }

            this.stdIoReaderFlyweight.pause();
            resolve({ name, value });
        });
    }

    /**
     * Display an error to the user via stderr
     */
    public printError(error: Error) {
        console.error(this.textFormatter.fgRed('ERROR: ' + error.message));
    }
}
