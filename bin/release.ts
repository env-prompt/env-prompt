import path from 'path'
import readline, { ReadLine } from 'readline'
import fs from 'fs'
import { spawn } from 'child_process'
import { version as currentVersion } from '../package.json'

const getInputFromUser = async (rl: ReadLine, question: string): Promise<string> => new Promise<string>(
    (resolve, reject) =>
        rl.question(question, (input: string) => resolve(input))
)

const getNextVersionFromUser = async (rl: ReadLine, currentVersion: string): Promise<string> => {
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

const readPackageJson = (filePath: string): string => fs.readFileSync(filePath).toString()

const writePackageJson = (filePath: string, packageJson: Object) => fs.writeFileSync(filePath, packageJson)

const replacePackageJsonVersion = (fileContents: string, version: string): string =>
    fileContents.replace(/"version": ".*"/, `"version": "${version}"`)

export const gitAdd = (cwd: string, filePath: string) =>
    spawn('git', ['add', filePath], { cwd })

export const gitCommit = (cwd: string, message: string) =>
    spawn('git', ['commit', '-m', `${message}`], { cwd })

const main = async () => {
    const projectRoot = path.resolve(__dirname, '..')
    const packageJsonFilePath = path.resolve(projectRoot, 'package.json')
    const rl: ReadLine = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    const nextVersion = await getNextVersionFromUser(rl, currentVersion)
    rl.close()

    const packageJson = readPackageJson(packageJsonFilePath)
    const packageJsonWithNextVersion = replacePackageJsonVersion(packageJson, nextVersion)
    writePackageJson(packageJsonFilePath, packageJsonWithNextVersion)

    gitAdd(projectRoot, packageJsonFilePath)
    gitCommit(projectRoot, `Version ${nextVersion}`)
}
main()
