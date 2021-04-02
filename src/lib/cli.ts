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

export interface CliPrompter {
    promptUserAboutNewVariables: () => void
    promptUserForEnvironmentVariable: (environmentVariable: EnvironmentVariable) => Promise<EnvironmentVariable>
    printError: (error: Error) => void
    printWarning: (warning: string) => void
}
export const makeCliPrompter = (console: Console, stdIoReader: StdIoReader): CliPrompter => ({
    promptUserAboutNewVariables: () => console.warn(fgYellow(
        'New environment variables were found. When prompted, please enter their values.'
    )),

    promptUserForEnvironmentVariable: async ({ name, value: defaultValue }) => {
        const question: string = buildQuestion(name, defaultValue)
        // TODO maybe trim inputValue before returning it
        const inputValue: string = await stdIoReader.promptUser(question)
        const blankValueProvided = inputValue.trim().length === 0
        const value = blankValueProvided ? defaultValue : inputValue
        stdIoReader.pause()
        return { name, value }
    },

    printError: (error) => console.error(fgRed(`ERROR: ${error.message}`)),

    printWarning: (warning) => console.error(fgYellow(warning))
})
