import { CliPrompter } from "../cli"
import { Merger } from "../env/merger"
import { ProcessDependencies } from "."
import { getOptionsFromEnvironment } from "../options"

export default async (merger: Merger, cliPrompter: CliPrompter, process: ProcessDependencies) => {
    try {
        const options = getOptionsFromEnvironment(process)
        await merger.merge(options)
    } catch (e) {
        cliPrompter.printError(e)
        process.exit(1)
    }
}
