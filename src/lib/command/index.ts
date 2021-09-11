import fs from "fs"
import path from "path"
import { CliPrompter } from "../cli"
import { Merger } from "../env/merger"
import { ProcessDependencies as OptionsProcessDependencies } from "../options"
import help from './help'
import version from './version'
import merge from './merge'
import { PackageJsonReader } from "../package-json"
import { InvalidCommandError } from "../env/error"

// TODO rename ProcessDependencies?
export type ProcessDependencies = Pick<NodeJS.Process, 'exit'> & OptionsProcessDependencies
export type NodeFs = Pick<typeof fs, "existsSync" | "readFileSync" | "writeFileSync">;
export type NodePath = Pick<typeof path, "resolve">

interface CliDependencies {
    console: Console
    fs: NodeFs
    path: NodePath
    merger: Merger
    cliPrompter: CliPrompter
    process: ProcessDependencies
    packageJsonReader: PackageJsonReader
}

const runCommand = async ({ merger, cliPrompter, process, packageJsonReader }: CliDependencies) => {
    const [,,command] = process.argv

    const isHelpCommand = command === 'help' || command === '--help'
    if (isHelpCommand) return help(console, packageJsonReader)

    const isVersionCommand = command === 'version' || command === '--version' || command === '-v'
    if (isVersionCommand) return version(console, packageJsonReader)

    const isMergeCommand = command === 'merge'
    const isCliFlag = /^-/.test(command)
    const isImplicitMergeCommand = !command || isCliFlag
    if (isMergeCommand || isImplicitMergeCommand) return await merge(merger, cliPrompter, process)

    throw new InvalidCommandError().setName(command)
}

export default async (dependencies: CliDependencies) => {
    try {
        await runCommand(dependencies)
    } catch (e) {
        const { cliPrompter, process } = dependencies
        cliPrompter.printError(e)
        process.exit(1)
    }
}
