import { ReadLine } from "readline"

export type ReadLineFactory = () => ReadLine
export interface StdIoReader {
    pause: () => void
    promptUser: (question: string) => Promise<string>
}
export const makeStdIoReader = (readLineFactory: ReadLineFactory): StdIoReader => {
    let readLine: ReadLine
    const getReadLine = () => {
        if (!readLine) readLine = readLineFactory()
        return readLine
    }

    return {
        pause: () => getReadLine().pause(),

        promptUser: (question) => new Promise(
            (resolve) => getReadLine().question(question, (input: string) => resolve(input))
        )
    }
}
