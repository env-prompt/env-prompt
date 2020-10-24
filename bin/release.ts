import path from 'path'
import readline, { ReadLine } from 'readline'
import { version } from '../package.json'

const getInputFromUser = async (rl: ReadLine, question: string): Promise<string> => new Promise<string>(
    (resolve, reject) =>
        rl.question(question, (input: string) => resolve(input))
)

const getVersionFromUser = async (rl: ReadLine, currentVersion: string): Promise<string> => {
    console.log(`Current version ${currentVersion}`)
    let nextVersion: string
    do {
        nextVersion = await getInputFromUser(rl, 'Next version?  > ')
    } while (!isValidSemanticVersion(nextVersion) || !isVersionChanged(currentVersion, nextVersion))

    return nextVersion
}

const isValidSemanticVersion = (value: string): boolean => /^\d+.\d+.\d+$/.test(value)

const isVersionChanged = (currentVersion: string, nextVersion: string) => {
    const [currentMajor, currentMinor, currentPatch] = currentVersion.split('.')
    const [nextMajor, nextMinor, nextPatch] = nextVersion.split('.')

    return nextMajor > currentMajor || nextMinor > currentMinor || nextPatch > currentPatch
}

const main = async () => {
    const projectRoot = path.resolve(__dirname, '..')
    const rl: ReadLine = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    const nextVersion = await getVersionFromUser(rl, version)
    rl.close()
}
main()
