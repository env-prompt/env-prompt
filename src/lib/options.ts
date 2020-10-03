import { RawArgument, ArgumentValue, ParsedArgument, Options, ParsedArgumentMap } from "@/model/options"
import { defaultOptions, optionNameByArgumentName } from "@/data/options"

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
