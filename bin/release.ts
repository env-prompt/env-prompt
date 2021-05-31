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

const shouldProceed = async (rl: ReadLine, message: string = 'Proceed?'): Promise<boolean> =>
    (await getInputFromUser(rl, `${message} (Y/n)  > `)).toUpperCase() === 'Y'

const isValidSemanticVersion = (value: string): boolean => /^\d+.\d+.\d+$/.test(value)

const isVersionChanged = (currentVersion: string, nextVersion: string) => {
    const [currentMajor, currentMinor, currentPatch] = currentVersion.split('.')
    const [nextMajor, nextMinor, nextPatch] = nextVersion.split('.')

    return nextMajor > currentMajor || nextMinor > currentMinor || nextPatch > currentPatch
}

const readPackageJson = (filePath: string): string => fs.readFileSync(filePath).toString()

const writePackageJson = (filePath: string, packageJson: Object) => fs.writeFileSync(filePath, JSON.stringify(packageJson))

const replacePackageJsonVersion = (fileContents: string, version: string): string =>
    fileContents.replace(/"version": ".*"/, `"version": "${version}"`)

export const spawnWithForwardedStdIo = async (command: string, args: string[], options: Object): Promise<void> => {
    console.log(`${command} ${args.join(' ')}`)
    return new Promise<void>((resolve) =>
        spawn(command, args, {stdio: 'inherit', ...options})
            .on('close', () => resolve())
    )
}

const gitStatus = async (cwd: string) =>
    await spawnWithForwardedStdIo('git', ['status'], { cwd })

const buildDist = async (cwd: string) =>
    await spawnWithForwardedStdIo('npm', ['run', 'build-dist'], { cwd })

const npmInstall = async (cwd: string) =>
    await spawnWithForwardedStdIo('npm', ['install'], { cwd })

const rmRf = async (cwd: string, path: string) =>
    await spawnWithForwardedStdIo('rm', ['-rm', path], { cwd })

export const gitListBranches = async (cwd: string) =>
    await spawnWithForwardedStdIo('git', ['branch', '-v'], { cwd })

export const gitAdd = async (cwd: string, filePath: string) =>
    spawnWithForwardedStdIo('git', ['add', filePath], { cwd })

export const gitCommit = async (cwd: string, message: string) =>
    spawnWithForwardedStdIo('git', ['commit', '-m', `${message}`], { cwd })

export const gitTag = async (cwd: string, version: string, message: string) =>
    spawnWithForwardedStdIo('git', ['tag', version, ...(message ? ['-m', message] : [])], { cwd })

export const gitPushMaster = async (cwd: string) =>
    spawnWithForwardedStdIo('git', ['push', 'upstream', 'master'], { cwd })

export const gitPushTags = async (cwd: string) =>
    spawnWithForwardedStdIo('git', ['push', 'upstream', '--tags'], { cwd })

const gitFetch = async (cwd: string, remote: string) =>
    await spawnWithForwardedStdIo('git', ['fetch', remote], cwd)

const gitDeleteBranch = async (cwd: string, branch: string) =>
    await spawnWithForwardedStdIo('git', ['branch', '-D', branch], cwd)

const gitCheckoutNewBranch = async (cwd: string, newBranch: string, sourceBranch: string) =>
    await spawnWithForwardedStdIo('git', ['checkout', '-tb', newBranch, sourceBranch], cwd)

export const npmPublish = async (cwd: string) =>
    await spawnWithForwardedStdIo('npm', ['publish'], { cwd })

const main = async () => {
    const projectRoot = path.resolve(__dirname, '..')
    const distDirectoryPath = path.resolve(projectRoot, 'dist')
    const packageJsonFilePath = path.resolve(projectRoot, 'package.json')
    const packageLockJsonFilePath = path.resolve(projectRoot, 'package-lock.json')
    const rl: ReadLine = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    await gitStatus(projectRoot)
    console.log('')

    await gitListBranches(projectRoot)
    console.log('')

    if (!await shouldProceed(rl, 'Proceed with current git status and branches?')) process.exit()
    console.log('')

    if (!await shouldProceed(rl, 'Delete and re-create local "tmp" branch?')) process.exit()
    await gitFetch(projectRoot, 'upstream')
    await gitDeleteBranch(projectRoot, 'tmp')
    await gitCheckoutNewBranch(projectRoot, 'tmp', 'upstream/master')
    console.log('')

    if (!await shouldProceed(rl, 'Delete and re-create local "master" branch?')) process.exit()
    await gitDeleteBranch(projectRoot, 'master')
    await gitCheckoutNewBranch(projectRoot, 'master', 'upstream/master')
    console.log('')

    const nextVersion = await getNextVersionFromUser(rl, currentVersion)
    console.log('')

    const releaseMessage = await getInputFromUser(rl, 'Release message (optional)  > ')
    console.log('')
    rl.close()

    console.log('Updating package.json version...')
    const packageJson = readPackageJson(packageJsonFilePath)
    const packageJsonWithNextVersion = replacePackageJsonVersion(packageJson, nextVersion)
    writePackageJson(packageJsonFilePath, packageJsonWithNextVersion)

    await npmInstall(projectRoot)
    await rmRf(projectRoot, distDirectoryPath)
    await buildDist(projectRoot)

    await gitAdd(projectRoot, packageJsonFilePath)
    await gitAdd(projectRoot, packageLockJsonFilePath)
    await gitCommit(projectRoot, `Version ${nextVersion}`)
    await gitTag(projectRoot, nextVersion, releaseMessage)
    await gitPushMaster(projectRoot)
    await gitPushTags(projectRoot)
    await npmPublish(projectRoot)
    console.log(`Version ${nextVersion} was successfully released to NPM!`)
    console.log('Draft new GitHub release here: https://github.com/env-prompt/env-prompt/releases/new')
}
main()
