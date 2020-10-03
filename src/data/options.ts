import { ArgumentName, OptionNameByArgumentName, Options } from "@/model/options";

export const defaultOptions: Options = {
    distFile: '.env.dist',
    localFile: '.env'
}

namespace ArgumentNames {
    export const distFileShortArgumentName: ArgumentName = '-d'
    export const distFileLongArgumentName: ArgumentName = '--distFile'
    export const localFileShortArgumentName: ArgumentName = '-l'
    export const localFileLongArgumentName: ArgumentName = '--localFile'
}

export const optionNameByArgumentName: OptionNameByArgumentName = {
    [ArgumentNames.distFileShortArgumentName]: 'distFile',
    [ArgumentNames.distFileLongArgumentName]: 'distFile',
    [ArgumentNames.localFileShortArgumentName]: 'localFile',
    [ArgumentNames.localFileLongArgumentName]: 'localFile',
}
