import readline from "readline"
import { getOptionsFromRawArguments } from "@/lib/options";
import { makeStdIoReader } from "@/lib/std-io-reader";
import { makeCliPrompter } from "@/lib/cli";
import { analyzeEnvSourceCode } from "./lib/env/lexer";

const options = getOptionsFromRawArguments(process.argv)
const stdIoReader = makeStdIoReader(() => readline.createInterface(process.stdin, process.stdout))
const cliPrompter = makeCliPrompter(console, stdIoReader)

const main = async () => {
    console.log({ options })
    const src = 
    `HELLO=WORLD
    # yeet
    WHATS="GOING ON"`
    const tokens = analyzeEnvSourceCode(src)
    console.log({ tokens })

    const environmentVariable = await cliPrompter.promptUserForEnvironmentVariable({ name: 'DB_USER', value: 'my dude' })
    console.log({ environmentVariable })
}
main()
