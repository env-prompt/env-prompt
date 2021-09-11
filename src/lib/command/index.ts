import fs from "fs"
import path from "path"
import { CliPrompter } from "lib/cli"
import { Merger } from "lib/env/merger"
import { ProcessDependencies as OptionsProcessDependencies } from "../options"
import help from './help'
import merge from './merge'

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
}

export default async ({ merger, cliPrompter, process }: CliDependencies) => {
    const [,,command] = process.argv

    const isHelpCommand = command === 'help' || command === '--help'
    if (isHelpCommand) return help(console, fs, path)

    const isVersionCommand = command === 'version' || command === '--version' || command === '-v'
    if (isVersionCommand) return // TODO implement this

    await merge(merger, cliPrompter, process)
}
