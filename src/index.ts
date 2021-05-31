import readline from "readline"
import fs from "fs"
import { getOptionsFromEnvironment } from "lib/options"
import { makeStdIoReader } from "lib/std-io-reader"
import { makeCliPrompter } from "lib/cli"
import { analyzeEnvSourceCode } from "lib/env/lexer"
import { parseEnvTokens } from "lib/env/parser"
import { render } from "lib/env/renderer"
import { makeMerge } from "lib/env/merger"

const stdIoReader = makeStdIoReader(() => readline.createInterface(process.stdin, process.stdout))
const cliPrompter = makeCliPrompter(console, stdIoReader)
const merge = makeMerge(cliPrompter, analyzeEnvSourceCode, parseEnvTokens, render, fs)

const main = async () => {
    try {
        const options = getOptionsFromEnvironment(process)
        await merge(options)
    } catch (e) {
        cliPrompter.printError(e)
    }
}
main()
