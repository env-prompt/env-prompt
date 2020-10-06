import * as Testable from './lib/testable'
const { StreamType } = Testable

test(
    'that env-prompt does not work CLI arguments are not provided and the default distributed file does not exist',
    async () => {
        const envPromptScript = `${process.cwd()}/dist/index.js`
        const cwd = '/tmp/env-prompt-no-args-no-dist-file'
        const defaultDistributedFilePath = '.env.dist'

        Testable.directory(cwd).remove()
        expect(Testable.directory(cwd).file(defaultDistributedFilePath).exists()).toBe(false)
        expect(Testable.directory(cwd).exists()).toBe(false)

        console.log('before')
        const testableProcess = (new Testable.Process(
            'ls',
            [envPromptScript],
            { cwd }
        ))
        console.log('after')
        testableProcess.dumpCommand()
        // await testableProcess.run()

        console.log('yay')
        expect(1).toBe(1)

        // expect(testableProcess.streamTransmissionCount()).toBe(1)
        // expect(testableProcess.streamTransmissionNumber(1).type).toBe(StreamType.stdErr)
        // // expect(testableProcess.streamTransmissionNumber(1).content).toBe('yoyoyo')
        //
        // expect(Testable.directory(cwd).file(defaultDistributedFilePath).exists()).toBe(false)
        // expect(Testable.directory(cwd).exists()).toBe(false)
    }
)

test.skip('that env-prompt works when using the -d and -l CLI arguments', async () => {
    // test data
    const envPromptScript = `${process.cwd()}/dist/index.js`
    const cwd = '/tmp/env-prompt-with-cli-args-d-and-l'
    const distFilePath = 'some.test.dist.env'
    const localFilePath = 'some.test.env'
    const distFileContent =
        'FIRST_NAME=JOHN\n' +
        'LAST_NAME=doe\n'
    const localFileContent =
        'FIRST_NAME=foo\n' +
        'LAST_NAME=bar\n'

    // clean any previously existing state to ensure we're starting from a clean slate
    Testable.directory(cwd).file(distFilePath).remove()
    Testable.directory(cwd).file(localFilePath).remove()
    Testable.directory(cwd).remove()
    expect(Testable.directory(cwd).file(distFilePath).exists()).toBe(false)
    expect(Testable.directory(cwd).file(localFilePath).exists()).toBe(false)
    expect(Testable.directory(cwd).exists()).toBe(false)

    // create and test the initial-state file/directory structure
    Testable.directory(cwd).create()
    Testable.directory(cwd).file(distFilePath).write(distFileContent)
    expect(Testable.directory(cwd).exists()).toBe(true)
    expect(Testable.directory(cwd).file(distFilePath).exists()).toBe(true)
    expect(Testable.directory(cwd).file(distFilePath).content()).toBe(distFileContent)

    // run env-prompt
    const testableProcess = await (new Testable.Process(
        'node',
        [envPromptScript, '-d', distFilePath, '-l', localFilePath],
        { cwd }
    ))
        .onNextStdOutRespondWithStdIn('foo')
        .onNextStdOutRespondWithStdIn('bar')
        .run()

    // test stdout/stderr transmissions
    expect(testableProcess.exitCode).toBe(0)
    expect(testableProcess.streamTransmissionCount()).toBe(3)
    expect(testableProcess.streamTransmissionNumber(1).type).toBe(StreamType.stdErr)
    expect(testableProcess.streamTransmissionNumber(1).content).toBe(
        `\u001b[33m${'New environment variables were found. When prompted, please enter their values.'}\u001b[0m\n`
    )
    expect(testableProcess.streamTransmissionNumber(2).type).toBe(StreamType.stdOut)
    expect(testableProcess.streamTransmissionNumber(2).content).toBe(
        `\u001b[46m${'FIRST_NAME'}\u001b[0m (\u001b[33m${'JOHN'}\u001b[0m): `
    )
    expect(testableProcess.streamTransmissionNumber(3).type).toBe(StreamType.stdOut)
    expect(testableProcess.streamTransmissionNumber(3).content).toBe(
        `\u001b[46m${'LAST_NAME'}\u001b[0m (\u001b[33m${'doe'}\u001b[0m): `
    )

    // test the end-state file/directory structure
    expect(Testable.directory(cwd).file(distFilePath).exists()).toBe(true)
    expect(Testable.directory(cwd).file(distFilePath).content()).toBe(distFileContent)
    expect(Testable.directory(cwd).file(localFilePath).exists()).toBe(true)
    expect(Testable.directory(cwd).file(localFilePath).content()).toBe(localFileContent)
})
