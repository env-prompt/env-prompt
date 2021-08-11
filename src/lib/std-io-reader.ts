import { ReadLine } from "readline"

export type ReadLineFactory = () => ReadLine
export interface StdIoReaderInterface {
    pause: () => void
    promptUser: (question: string) => Promise<string>
}

export class StdIoReader implements StdIoReaderInterface {
    private readLine: ReadLine

    public constructor(private readLineFactory: ReadLineFactory) {}

    public pause() {
        this.getReadLine().pause()
    }

    public promptUser(question: string): Promise<string> {
        return new Promise(
            (resolve) => this.getReadLine().question(question, (input: string) => resolve(input))
        )
    }

    private getReadLine(): ReadLine {
        if (!this.readLine) this.readLine = this.readLineFactory()
        return this.readLine
    }
}
