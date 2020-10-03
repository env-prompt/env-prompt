type RawArguments = string[]
type ArgumentName = string
type ArgumentValue = string|boolean
type PairedArgument = [ArgumentName, ArgumentValue]

export interface Options {
    distFile: string
    localFile: string
}

const isArgumentName = (value: string): boolean => /^--?\w+$/.test(value)

const getPairedArgumentsFromRawArguments = (rawArguments: RawArguments): PairedArgument[] => {
    const pairedArguments: PairedArgument[] = []
    for (let i = 0; i < rawArguments.length; i++) {
        const currentValue = rawArguments[i]
        const isCurrentValueArgument = isArgumentName(currentValue)
        if (isCurrentValueArgument) {
            const nextValue = rawArguments[i + 1]
            const isNextValueSet = rawArguments.length > i + 1
            const isNextValueArgument = isArgumentName(nextValue)

            const argumentName: ArgumentName = currentValue
            const argumentValue: ArgumentValue = isNextValueSet && !isNextValueArgument ? nextValue : true
            pairedArguments.push([argumentName, argumentValue])
        }
    }

    return pairedArguments
}

export const getOptionsFromRawArguments = (rawArguments: RawArguments): Options => {
    const options: Options = {
        distFile: '.env.dist',
        localFile: '.env'
    }
    getPairedArgumentsFromRawArguments(rawArguments)
        .filter(([_, value]: PairedArgument) => typeof value === 'string')
        .forEach(([name, value]: PairedArgument) => {
            const isDistFile = ['-d', '--distFile'].includes(name)
            const isLocalFile = ['-l', '--localFile'].includes(name)

            if (isDistFile) {
                options.distFile = value as string
            } else if (isLocalFile) {
                options.localFile = value as string
            }
        })

    return options
}
