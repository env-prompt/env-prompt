import { StdIoReader } from "lib/std-io-reader"

const bgCyan = (message: string): string => `\x1b[46m${message}\x1b[0m`
const fgRed = (message: string): string => `\x1b[31m${message}\x1b[0m`
const fgYellow = (message: string): string => `\x1b[33m${message}\x1b[0m`
const buildQuestion = (name: string, defaultValue: string): string => {
    const hasDefaultValue = defaultValue.trim().length > 0
    const defaultValueNote = hasDefaultValue ? ` (${fgYellow(defaultValue)})` : ''

    return `${bgCyan(name)}${defaultValueNote}: `
}

export interface EnvironmentVariable {
    name: string
    value: string
}

export interface CliPrompterInterface {
    promptUserAboutNewVariables: () => void
    promptUserForEnvironmentVariable: (environmentVariable: EnvironmentVariable) => Promise<EnvironmentVariable>
    printError: (error: Error) => void
    printWarning: (warning: string) => void
}

export class CliPrompter implements CliPrompterInterface {
    public constructor(
        private console: Console,
        private stdIoReader: StdIoReader
    ) {}

    public promptUserAboutNewVariables() {
        this.console.warn(fgYellow(
            'New environment variables were found. When prompted, please enter their values.'
        ))
    }

    public async promptUserForEnvironmentVariable({ name, value: defaultValue }: EnvironmentVariable): Promise<EnvironmentVariable> {
        const question: string = buildQuestion(name, defaultValue)
        // TODO maybe trim inputValue before returning it
        const inputValue: string = await this.stdIoReader.promptUser(question)
        const blankValueProvided = inputValue.trim().length === 0
        const value = blankValueProvided ? defaultValue : inputValue
        this.stdIoReader.pause()
        return { name, value }
    }

    public printError(error: Error) {
        this.console.error(fgRed(`ERROR: ${error.message}`))
    }

    public printWarning(warning: string) {
        this.console.error(fgYellow(warning))
    }
}
