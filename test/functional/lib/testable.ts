import child_process, { ChildProcess, SpawnOptions } from "child_process"
import fs from "fs"

export enum StreamType { stdIn, stdOut, stdErr }

interface StreamTransmission {
    type: StreamType
    content: string
}

export const file = (path: string) => {
    const exists = (): boolean => fs.existsSync(path)
    const remove = () => {
        try {
            fs.unlinkSync(path)
        } catch (e) {}
    }
    const content = (): string|void => fs.readFileSync(path).toString()
    const write = (content: string) => fs.writeFileSync(path, content)

    return { exists, remove, content, write }
}

export const directory = (path: string) => {
    const create = () => fs.mkdirSync(path)
    const exists = (): boolean => fs.existsSync(path)
    const remove = () => {
        try {
            fs.rmdirSync(path)
        } catch (e) {}
    }
    const directoryFile = (filePath: string) => file(`${path}/${filePath}`)

    return { create, exists, remove, file: directoryFile }
}

export class Process {
    private command: string
    private args: ReadonlyArray<string>
    private options: SpawnOptions

    private stdInResponseIndex = 0
    private stdInResponsesToStdOutTransmissions: string[] = []
    private stdErrTransmissions: (string|Buffer)[] = []
    public exitCode: Readonly<number>

    private streamTransmissions: StreamTransmission[] = []

    public constructor(command: string, args: ReadonlyArray<string> = [], options?: SpawnOptions) {
        this.command = command
        this.args = args
        this.options = options
    }

    public onNextStdOutRespondWithStdIn (stdIn: string): this {
        this.stdInResponsesToStdOutTransmissions.push(stdIn)
        return this
    }

    public streamTransmissionCount(): number {
        return this.streamTransmissions.length
    }

    public streamTransmissionNumber(streamTransmissionNumber: number): StreamTransmission|undefined {
        const streamTransmissionIndex = streamTransmissionNumber - 1
        const streamTransmissionExists = this.streamTransmissions.length > streamTransmissionIndex
        if (streamTransmissionExists) {
            return this.streamTransmissions[streamTransmissionIndex]
        }
    }

    public dumpCommand(): this {
        const command = `${this.command} ${this.args.join(' ')}`
        console.log(command)

        return this
    }


    public dumpTransmissionContents(): this {
        const transmissionContents = this.streamTransmissions
            .map((streamTransmission: StreamTransmission) => streamTransmission.content)
        console.log(transmissionContents)

        return this
    }

    public async run (): Promise<this> {
        return new Promise<this>((resolve) => {
            const spawnedChildProcess: ChildProcess = child_process.spawn(this.command, this.args, this.options)
            spawnedChildProcess.stdout.on('data', (data) => {
                const hasStdInResponse = this.stdInResponsesToStdOutTransmissions.length > this.stdInResponseIndex
                if (hasStdInResponse) {
                    const stdInResponse = this.stdInResponsesToStdOutTransmissions[this.stdInResponseIndex++]
                    spawnedChildProcess.stdin.write(`${stdInResponse}\n`)
                }
                this.streamTransmissions.push({
                    type: StreamType.stdOut,
                    content: data.toString()
                })
            })
            spawnedChildProcess.stderr.on('data', (data) => this.streamTransmissions.push({
                type: StreamType.stdErr,
                content: data.toString()
            }))
            spawnedChildProcess.on('close', (exitCode: number) => {
                this.exitCode = exitCode
                resolve(this)
            })
        })
    }
}
