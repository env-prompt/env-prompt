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
        nextVersion = await getInputFromUser(rl, 'Next version  > ')
    } while (!isValidSemanticVersion(nextVersion) || !isVersionChanged(currentVersion, nextVersion))

    return nextVersion
}

const shouldProceed = async (rl: ReadLine): Promise<boolean> =>
    (await getInputFromUser(rl, 'Proceed? (Y/n)  > ')).toUpperCase() === 'Y'

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

export const gitStatus = async (cwd: string): Promise<void> => new Promise<void>((resolve) =>
    spawn('git', ['status'], { cwd, stdio: 'inherit' })
        .on('close', () => resolve())
)

export const gitListBranches = async (cwd: string): Promise<void> => new Promise<void>((resolve) =>
    spawn('git', ['branch', '-v'], { cwd, stdio: 'inherit' })
        .on('close', () => resolve())
)

export const gitAdd = (cwd: string, filePath: string) =>
    spawn('git', ['add', filePath], { cwd })

export const gitCommit = (cwd: string, message: string) =>
    spawn('git', ['commit', '-m', `${message}`], { cwd })

export const gitTag = (cwd: string, version: string, message: string) =>
    spawn('git', ['tag', version, ...(message ? ['-m', message] : [])], { cwd })

export const gitPushMaster = (cwd: string) =>
    spawn('git', ['push', 'upstream', 'master'], { cwd })

export const gitPushTags = (cwd: string) =>
    spawn('git', ['push', 'upstream', '--tags'], { cwd })

export const npmPublish = (cwd: string) =>
    spawn('npm', ['publish'], { cwd })

const main = async () => {
    const projectRoot = path.resolve(__dirname, '..')
    const packageJsonFilePath = path.resolve(projectRoot, 'package.json')
    const rl: ReadLine = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    console.log('git status:')
    await gitStatus(projectRoot)
    console.log('')

    console.log('git branches:')
    await gitListBranches(projectRoot)
    console.log('')

    if (!await shouldProceed(rl)) process.exit()
    console.log('')

    const nextVersion = await getNextVersionFromUser(rl, currentVersion)
    console.log('')

    const releaseMessage = await getInputFromUser(rl, 'Release message (optional)  > ')
    console.log('')
    rl.close()

    const packageJson = readPackageJson(packageJsonFilePath)
    const packageJsonWithNextVersion = replacePackageJsonVersion(packageJson, nextVersion)
    writePackageJson(packageJsonFilePath, packageJsonWithNextVersion)

    gitAdd(projectRoot, packageJsonFilePath)
    gitCommit(projectRoot, `Version ${nextVersion}`)
    gitTag(projectRoot, nextVersion, releaseMessage)
    gitPushMaster(projectRoot)
    gitPushTags(projectRoot)
    npmPublish(projectRoot)
    console.log(`Version ${nextVersion} was successfully released!`)
}
main()
