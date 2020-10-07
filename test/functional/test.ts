import * as Testable from './lib/testable'
import { StreamType } from './lib/testable'

describe('non-working scenarios', () => {
    test(
        'that env-prompt does not work when CLI arguments are not provided and the default distributed file is missing',
        async () => {
            const envPromptScript = `${process.cwd()}/dist/index.js`
            const cwd = '/tmp/env-prompt-no-args-no-dist-file'
            const defaultDistributedFilePath = '.env.dist'

            Testable.directory(cwd).create()
            Testable.directory(cwd).file(defaultDistributedFilePath).remove()
            expect(Testable.directory(cwd).exists()).toBe(true)
            expect(Testable.directory(cwd).file(defaultDistributedFilePath).exists()).toBe(false)

            const testableProcess = await (new Testable.Process(
                'node',
                [envPromptScript],
                { cwd }
            )).run()

            expect(testableProcess.exitCode).toBe(1)
            expect(testableProcess.streamTransmissionCount()).toBe(1)
            expect(testableProcess.streamTransmissionNumber(1).type).toBe(StreamType.stdErr)
            expect(testableProcess.streamTransmissionNumber(1).content).toBe(
                `\u001b[31m${'ERROR: Could not locate .env.dist'}\u001b[0m\n`
            )

            expect(Testable.directory(cwd).file(defaultDistributedFilePath).exists()).toBe(false)
            expect(Testable.directory(cwd).exists()).toBe(true)
        }
    )

    test(
        'that env-prompt does not work when specified distributed file is missing',
        async () => {
            const envPromptScript = `${process.cwd()}/dist/index.js`
            const cwd = '/tmp/env-prompt-missing-dist-file'
            const distributedFilePath = 'My_CuSt0MF1ll33'

            Testable.directory(cwd).create()
            Testable.directory(cwd).file(distributedFilePath).remove()
            expect(Testable.directory(cwd).exists()).toBe(true)
            expect(Testable.directory(cwd).file(distributedFilePath).exists()).toBe(false)

            const testableProcess = await (new Testable.Process(
                'node',
                [envPromptScript, '--distFile', distributedFilePath],
                { cwd }
            )).run()

            expect(testableProcess.exitCode).toBe(1)
            expect(testableProcess.streamTransmissionCount()).toBe(1)
            expect(testableProcess.streamTransmissionNumber(1).type).toBe(StreamType.stdErr)
            expect(testableProcess.streamTransmissionNumber(1).content).toBe(
                `\u001b[31m${'ERROR: Could not locate My_CuSt0MF1ll33'}\u001b[0m\n`
            )

            expect(Testable.directory(cwd).file(distributedFilePath).exists()).toBe(false)
            expect(Testable.directory(cwd).exists()).toBe(true)
        }
    )
})

describe('working scenarios', () => {
    test('that env-prompt works with no arguments when the default distributed file exists', async () => {
        // test data
        const envPromptScript = `${process.cwd()}/dist/index.js`
        const cwd = '/tmp/env-prompt-with-no-cli-args-and-default-dist-file'
        const distFilePath = '.env.dist'
        const localFilePath = '.env'
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
            [envPromptScript],
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

    test('that env-prompt works when using the -d and -l CLI arguments', async () => {
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

    test('that env-prompt works when using the --distFile and --localFile CLI arguments', async () => {
        // test data
        const envPromptScript = `${process.cwd()}/dist/index.js`
        const cwd = '/tmp/env-prompt-with-cli-args-distFile-and-localFile'
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
            [envPromptScript, '--distFile', distFilePath, '--localFile', localFilePath],
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

    test('that env-prompt executes silently when the environment variable CI=true', async () => {
        // test data
        const envPromptScript = `${process.cwd()}/dist/index.js`
        const cwd = '/tmp/env-prompt-with-ci'
        const env = { ...process.env, CI: 'true' }
        const distFilePath = '.env.dist'
        const localFilePath = '.env'
        const distFileContent =
            'FIRST_NAME=JOHN\n' +
            'LAST_NAME=doe\n'

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
            [envPromptScript],
            { cwd, env }
        ))
            .onNextStdOutRespondWithStdIn('foo')
            .onNextStdOutRespondWithStdIn('bar')
            .run()

        // test stdout/stderr transmissions
        expect(testableProcess.exitCode).toBe(0)
        expect(testableProcess.streamTransmissionCount()).toBe(0)

        // test the end-state file/directory structure
        expect(Testable.directory(cwd).file(distFilePath).exists()).toBe(true)
        expect(Testable.directory(cwd).file(distFilePath).content()).toBe(distFileContent)
        expect(Testable.directory(cwd).file(localFilePath).exists()).toBe(true)
        expect(Testable.directory(cwd).file(localFilePath).content()).toBe(distFileContent)
    })

    test('that env-prompt only prompts users for new variables', async () => {
        // test data
        const envPromptScript = `${process.cwd()}/dist/index.js`
        const cwd = '/tmp/env-prompt-with-no-cli-args-and-default-dist-file'
        const distFilePath = '.env.dist'
        const localFilePath = '.env'
        const distFileContent =
            'FIRST_NAME=JOHN\n' +
            'LAST_NAME=doe\n'
        const preRunLocalFileContent =
            'FIRST_NAME=foo\n'
        const postRunLocalFileContent =
            'FIRST_NAME=foo\n' +
            'LAST_NAME=NEW VALUE\n'

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
        Testable.directory(cwd).file(localFilePath).write(preRunLocalFileContent)
        expect(Testable.directory(cwd).exists()).toBe(true)
        expect(Testable.directory(cwd).file(distFilePath).exists()).toBe(true)
        expect(Testable.directory(cwd).file(distFilePath).content()).toBe(distFileContent)

        // run env-prompt
        const testableProcess = await (new Testable.Process(
            'node',
            [envPromptScript],
            { cwd }
        ))
            .onNextStdOutRespondWithStdIn('NEW VALUE')
            .run()

        // test stdout/stderr transmissions
        expect(testableProcess.exitCode).toBe(0)
        expect(testableProcess.streamTransmissionCount()).toBe(2)
        expect(testableProcess.streamTransmissionNumber(1).type).toBe(StreamType.stdErr)
        expect(testableProcess.streamTransmissionNumber(1).content).toBe(
            `\u001b[33m${'New environment variables were found. When prompted, please enter their values.'}\u001b[0m\n`
        )
        expect(testableProcess.streamTransmissionNumber(2).type).toBe(StreamType.stdOut)
        expect(testableProcess.streamTransmissionNumber(2).content).toBe(
            `\u001b[46m${'LAST_NAME'}\u001b[0m (\u001b[33m${'doe'}\u001b[0m): `
        )

        // test the end-state file/directory structure
        expect(Testable.directory(cwd).file(distFilePath).exists()).toBe(true)
        expect(Testable.directory(cwd).file(distFilePath).content()).toBe(distFileContent)
        expect(Testable.directory(cwd).file(localFilePath).exists()).toBe(true)
        expect(Testable.directory(cwd).file(localFilePath).content()).toBe(postRunLocalFileContent)
    })

    test('that env-prompt does not remove deleted variables', async () => {
        // test data
        const envPromptScript = `${process.cwd()}/dist/index.js`
        const cwd = '/tmp/env-prompt-with-no-cli-args-and-default-dist-file'
        const distFilePath = '.env.dist'
        const localFilePath = '.env'
        const distFileContent =
            'FIRST_NAME=JOHN\n'
        const localFileContent =
            'FIRST_NAME=foo\n' +
            'LAST_NAME=NEW VALUE\n'

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
        Testable.directory(cwd).file(localFilePath).write(localFileContent)
        expect(Testable.directory(cwd).exists()).toBe(true)
        expect(Testable.directory(cwd).file(distFilePath).exists()).toBe(true)
        expect(Testable.directory(cwd).file(distFilePath).content()).toBe(distFileContent)

        // run env-prompt
        const testableProcess = await (new Testable.Process(
            'node',
            [envPromptScript],
            { cwd }
        ))
            .onNextStdOutRespondWithStdIn('NEW VALUE')
            .run()

        // test stdout/stderr transmissions
        expect(testableProcess.exitCode).toBe(0)
        expect(testableProcess.streamTransmissionCount()).toBe(0)

        // test the end-state file/directory structure
        expect(Testable.directory(cwd).file(distFilePath).exists()).toBe(true)
        expect(Testable.directory(cwd).file(distFilePath).content()).toBe(distFileContent)
        expect(Testable.directory(cwd).file(localFilePath).exists()).toBe(true)
        expect(Testable.directory(cwd).file(localFilePath).content()).toBe(localFileContent)
    })
})
