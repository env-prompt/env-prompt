import { CliPrompter } from "lib/cli"
import { Merger } from "lib/env/merger"
import { getOptionsFromEnvironment, ProcessDependencies as OptionsProcessDependencies } from "../options"

type ProcessDependencies = Pick<NodeJS.Process, 'exit'> & OptionsProcessDependencies

export default async (merger: Merger, cliPrompter: CliPrompter, process: ProcessDependencies) => {
    try {
        const options = getOptionsFromEnvironment(process)
        await merger.merge(options)
    } catch (e) {
        cliPrompter.printError(e)
        process.exit(1)
    }
}
