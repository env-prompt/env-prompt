export type ArgumentName = string
export type ArgumentValue = string | boolean

export type RawArgument = string
export type ParsedArgument = [ArgumentName, ArgumentValue]
export type ParsedArgumentMap = Record<ArgumentName, ArgumentValue>

export interface Options {
    distFile: string
    localFile: string
}
type OptionName = keyof Options
type OptionValue = Options[OptionName]
export type Option = [OptionName, OptionValue]

export type ArgumentNamesByOptionName = Record<OptionName, ArgumentName[]>
export type OptionNameByArgumentName = Record<ArgumentName, OptionName>
export type OptionArgumentMaps = [ArgumentNamesByOptionName, OptionNameByArgumentName]
