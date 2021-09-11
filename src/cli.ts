import readline from "readline"
import fs from "fs"
import path from "path"
import { StdIoReader } from "./lib/std-io-reader"
import { CliPrompter } from "./lib/cli"
import { analyzeEnvSourceCode } from "./lib/env/lexer"
import { parseEnvTokens } from "./lib/env/parser"
import { render } from "./lib/env/renderer"
import { Merger } from "./lib/env/merger"
import cli from "./lib/command"
import { PackageJsonReader } from "./lib/package-json"

const readLineFactory = () => readline.createInterface(process.stdin, process.stdout)
const stdIoReader = new StdIoReader(readLineFactory)
const cliPrompter = new CliPrompter(console, stdIoReader)
const packageJsonReader = new PackageJsonReader(fs, path)
const merger = new Merger()
    .setCliPrompter(cliPrompter)
    .setAnalyzeEnvSourceCode(analyzeEnvSourceCode)
    .setParseEnvTokens(parseEnvTokens)
    .setRender(render)
    .setFs(fs)
    .setPath(path)

cli({
    console,
    fs,
    path,
    merger,
    cliPrompter,
    process,
    packageJsonReader
})
