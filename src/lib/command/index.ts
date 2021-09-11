import fs from "fs"
import path from "path"
import { CliPrompter } from "lib/cli"
import { Merger } from "lib/env/merger"
import { ProcessDependencies as OptionsProcessDependencies } from "../options"
import help from './help'
import version from './version'
import merge from './merge'
import { PackageJsonReader } from "lib/package-json"

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

export default async ({ merger, cliPrompter, process, packageJsonReader }: CliDependencies) => {
    const [,,command] = process.argv

    const isHelpCommand = command === 'help' || command === '--help'
    if (isHelpCommand) return help(console, packageJsonReader)

    const isVersionCommand = command === 'version' || command === '--version' || command === '-v'
    if (isVersionCommand) return version(console, packageJsonReader)

    await merge(merger, cliPrompter, process)
    // TODO add warning here if not using "merge" command
    // TODO add error here if unknown command
}
