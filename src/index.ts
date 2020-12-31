import readline from "readline"
import fs from "fs"
import { getOptionsFromRawArguments, Options } from "lib/options"
import { makeStdIoReader } from "lib/std-io-reader"
import { makeCliPrompter } from "lib/cli"
import { analyzeEnvSourceCode, Token } from "lib/env/lexer"
import { parseEnvTokens } from "lib/env/parser"
const stdIoReader = makeStdIoReader(() => readline.createInterface(process.stdin, process.stdout))
const cliPrompter = makeCliPrompter(console, stdIoReader)

type NodeFs = Pick<typeof fs, 'existsSync' | 'readFileSync'>

const ENCODING = 'utf8'

const analyzeDistEnvFile = ({ distFilePath: path }: Options): Token[] => {
    const exists = fs.existsSync(path)
    if (!exists) throw new Error(`Could not locate ${path}`)

    const src = fs.readFileSync(path, { encoding: ENCODING }).toString()
    return analyzeEnvSourceCode(src)
}

const analyzeLocalFile = ({ localFilePath: path }: Options): Token[] => {
    const exists = fs.existsSync(path)
    if (!exists) return []

    const src = fs.readFileSync(path, { encoding: ENCODING }).toString()
    return analyzeEnvSourceCode(src)
}

const main = async () => {
    try {
        const options = getOptionsFromRawArguments(process.argv)
        const distFileTokens = analyzeDistEnvFile(options)
        const parsedEnvDocument = parseEnvTokens(distFileTokens)
        console.log(JSON.stringify(parsedEnvDocument.abstractSyntaxTree))

        // const localFileTokens = analyzeLocalFile(options)
        
        // console.log(distFileTokens)
        // console.log(localFileTokens)

        // const environmentVariable = await cliPrompter.promptUserForEnvironmentVariable({ name: 'DB_USER', value: 'my dude' })
        // console.log({ environmentVariable })
    } catch (e) {
        cliPrompter.printError(e)
    }
}
main()
