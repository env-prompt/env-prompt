type RawArgument = string
type ArgumentName = string
type ArgumentValue = string | boolean
type Argument = [ArgumentName, ArgumentValue]
type ArgumentMap = Record<ArgumentName, ArgumentValue>
type ProcessEnvVariable = [keyof NodeJS.ProcessEnv, NodeJS.ProcessEnv[keyof NodeJS.ProcessEnv]]

export enum NewlineType {
    unix = 'unix',
    windows = 'windows'
}

export interface Options {
    distFilePath: string
    localFilePath: string
    prompts: boolean
    newlineType: NewlineType
}

const defaultOptions: Options = {
    distFilePath: '.env.dist',
    localFilePath: '.env',
    prompts: true,
    newlineType: NewlineType.unix
}

export type ProcessDependencies = Pick<NodeJS.Process, 'argv' | 'env' | 'platform'>

export const getOptionsFromEnvironment = ({ argv, env, platform }: ProcessDependencies): Options => {
    const argumentMap = parseArguments(argv)

    const isWindows = platform === 'win32'
    const newlineType: NewlineType = isWindows ? NewlineType.windows : NewlineType.unix

    const cliOptions: Partial<Options> = {}
    const argumentList = Object.entries(argumentMap)
    argumentList.forEach((argument) => mapArgumentToOptions(argument, cliOptions))

    const processEnvOptions: Partial<Options> = {}
    const processEnvVariableList = Object.entries(env)
    processEnvVariableList.forEach(
        (variable) => mapProcessEnvVariableToOptions(variable, processEnvOptions)
    )

    return { ...defaultOptions, newlineType, ...processEnvOptions, ...cliOptions }
}

const mapArgumentToOptions = ([name, value]: Argument, options: Partial<Options>) => {
    const isDistFilePath = name === '-d' || name === '--distFile'
    if (isDistFilePath) {
        options.distFilePath = String(value)
        return
    }

    const isLocalFilePath = name === '-l' || name === '--localFile'
    if (isLocalFilePath) {
        options.localFilePath = String(value)
        return
    }

    const isPrompts = name === '-p' || name === '--prompts'
    if (isPrompts) {
        options.prompts = getBooleanFromArgumentValue(value)
        return
    }

    const isNewlineType = name === '-n' || name === '--newlineType'
    if (isNewlineType) {
        const validTypes = Object.values(NewlineType)
        const isValid = validTypes.find(type => type === value)
        if (!isValid) throw new Error(`Invalid newline type. Valid types: "${validTypes.join('", "')}"`)

        options.newlineType = value as NewlineType
        return
    }

    throw new Error(`Invalid argument ${name}`)
}

const mapProcessEnvVariableToOptions = ([name, value]: ProcessEnvVariable, options: Partial<Options>) => {
    const isContinuousIntegration = name === 'CI' && value === 'true'
    if (isContinuousIntegration) options.prompts = false
}

const argumentNameAndInlineValueExpression = /^(--?\w+)(?:=(.*))?/
const isArgumentName = (value: RawArgument): boolean => argumentNameAndInlineValueExpression.test(value)
const getArgumentNameAndInlineValue = (rawArgument: string): [string, string?] => {
    const [_, name, inlineValue] = argumentNameAndInlineValueExpression.exec(rawArgument)
    return [name, inlineValue]
}

const getArgumentNameAndValue = (rawArguments: RawArgument[], i: number): Argument => {
    const rawArgument = rawArguments[i]
    const [name, inlineValue] = getArgumentNameAndInlineValue(rawArgument)

    const hasInlineValue = typeof inlineValue !== 'undefined'
    if (hasInlineValue) return [name, inlineValue]
    
    const valueIndex = i + 1
    const value = rawArguments[valueIndex]

    const isEndOfRawArguments = rawArguments.length === valueIndex
    const isValueAnArgumentName = isArgumentName(value)
    if (isEndOfRawArguments || isValueAnArgumentName) return [name, true]

    return [name, value]
}

const parseArguments = (rawArguments: RawArgument[]): ArgumentMap => {
    const argumentMap: ArgumentMap = {}
    rawArguments
        .forEach((rawArgument: RawArgument, i: number) => {
            if (!isArgumentName(rawArgument)) return
            
            const [argumentName, argumentValue] = getArgumentNameAndValue(rawArguments, i)
            argumentMap[argumentName] = argumentValue
        })

    return argumentMap
}

const getBooleanFromArgumentValue = (value: ArgumentValue): boolean => value === 'false' ? false : true
