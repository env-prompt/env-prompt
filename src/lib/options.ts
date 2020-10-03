import { RawArgument, ArgumentName, ArgumentValue, ParsedArgument, Options, ParsedArgumentMap } from "@/model/options"
import { defaultOptions, optionNameByArgumentName } from "@/data/options";

const isArgumentName = (value: RawArgument): boolean => /^--?\w+$/.test(value as string)

const isFlagArgument = ([_, value]: ParsedArgument): boolean => typeof value === 'boolean'

const getArgumentValue = (nameIndex: number, rawArguments: RawArgument[]): ArgumentValue => {
    const index = nameIndex + 1
    const value = rawArguments[index]

    const isEndOfRawArguments = rawArguments.length === index
    const isValueAnArgumentName = isArgumentName(value as string)
    const isFlagArgument = isEndOfRawArguments || isValueAnArgumentName

    return isFlagArgument ? true : value
}

const parseArguments = (rawArguments: RawArgument[]): ParsedArgumentMap => {
    const parsedArgumentMap: ParsedArgumentMap = {}
    rawArguments
        .forEach((argumentName: ArgumentName, index: number, rawArguments: RawArgument[]) => {
            if (isArgumentName) {
                parsedArgumentMap[argumentName] = getArgumentValue(index, rawArguments)
            }
        })

    return parsedArgumentMap
}

export const getOptionsFromRawArguments = (rawArguments: RawArgument[]): Options => {
    const parsedArgumentMap = parseArguments(rawArguments)
    const options: Options = { ...defaultOptions }

    Object
        .entries(parsedArgumentMap)
        .filter(parsedArgument => !isFlagArgument(parsedArgument))
        .filter(([argumentName]: ParsedArgument) => argumentName in optionNameByArgumentName)
        .forEach(([argumentName, argumentValue]: ParsedArgument) => {
            const optionName = optionNameByArgumentName[argumentName]
            options[optionName] = argumentValue as string
        })

    return options
}
