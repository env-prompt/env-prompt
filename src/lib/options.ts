type RawArgument = string
type ArgumentName = string
type ArgumentValue = string | boolean
type Argument = [ArgumentName, ArgumentValue]
type ArgumentMap = Record<ArgumentName, ArgumentValue>

export interface Options {
    distFilePath: string
    localFilePath: string
    prompts: boolean
}

const defaultOptions: Options = {
    distFilePath: '.env.dist',
    localFilePath: '.env',
    prompts: true
}

export const getOptionsFromRawArguments = (rawArguments: RawArgument[]): Options => {
    const argumentMap = parseArguments(rawArguments)
    const options: Options = { ...defaultOptions }

    const argumentList = Object.entries(argumentMap)
    argumentList.forEach((argument) => mapArgumentToOptions(argument, options))

    return options
}

const mapArgumentToOptions = ([name, value]: Argument, options: Options) => {
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

    const isPrompts = name === '--prompts'
    if (isPrompts) {
        options.prompts = getBooleanFromArgumentValue(value)
        return
    }
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
