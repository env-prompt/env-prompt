type ArgumentName = string
type ArgumentValue = string | boolean

type RawArgument = string
type ParsedArgument = [ArgumentName, ArgumentValue]
type ParsedArgumentMap = Record<ArgumentName, ArgumentValue>

export interface Options {
    distFilePath: string
    localFilePath: string
}
type OptionName = keyof Options
type OptionValue = Options[OptionName]
type Option = [OptionName, OptionValue]

type OptionNameByArgumentName = Record<ArgumentName, OptionName>

const defaultOptions: Options = {
    distFilePath: '.env.dist',
    localFilePath: '.env'
}

namespace ArgumentNames {
    export const distFilePathShorthand: ArgumentName = '-d'
    export const distFilePath: ArgumentName = '--distFile'
    export const localFilePathShorthand: ArgumentName = '-l'
    export const localFilePath: ArgumentName = '--localFile'
}

const optionNameByArgumentName: OptionNameByArgumentName = {
    [ArgumentNames.distFilePathShorthand]: 'distFilePath',
    [ArgumentNames.distFilePath]: 'distFilePath',
    [ArgumentNames.localFilePathShorthand]: 'localFilePath',
    [ArgumentNames.localFilePath]: 'localFilePath',
}

const isArgumentName = (value: RawArgument): boolean => /^--?\w+$/.test(value)

const isFlag = (value: ArgumentValue): boolean => typeof value === 'boolean'

const getArgumentValue = (argumentNameIndex: number, rawArguments: RawArgument[]): ArgumentValue => {
    const valueIndex = argumentNameIndex + 1
    const value = rawArguments[valueIndex]

    const isEndOfRawArguments = rawArguments.length === valueIndex
    const isValueAnArgumentName = isArgumentName(value)
    const useFlagForArgumentValue = isEndOfRawArguments || isValueAnArgumentName

    return useFlagForArgumentValue ? true : value
}

const parseArguments = (rawArguments: RawArgument[]): ParsedArgumentMap => {
    const parsedArgumentMap: ParsedArgumentMap = {}
    rawArguments
        .forEach((argumentName: RawArgument, argumentNameIndex: number) => {
            if (isArgumentName(argumentName)) {
                parsedArgumentMap[argumentName] = getArgumentValue(argumentNameIndex, rawArguments)
            }
        })

    return parsedArgumentMap
}

export const getOptionsFromRawArguments = (rawArguments: RawArgument[]): Options => {
    const parsedArgumentMap = parseArguments(rawArguments)
    const options: Options = { ...defaultOptions }

    Object
        .entries(parsedArgumentMap)
        .filter(([argumentName, argumentValue]: ParsedArgument) =>
            !isFlag(argumentValue) && argumentName in optionNameByArgumentName
        )
        .forEach(([argumentName, argumentValue]: ParsedArgument) => {
            const optionName = optionNameByArgumentName[argumentName]
            options[optionName] = argumentValue as string
        })

    return options
}
