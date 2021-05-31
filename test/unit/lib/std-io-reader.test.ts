import { makeStdIoReader } from "../../../src/lib/std-io-reader";
import { ReadLine } from "readline"

type Mocked<T> = Partial<Record<keyof T, jest.Mock>>;

describe("stdio reader", () => {
    test('that stdio reader prompts users with questions and returns their response', async () => {
        const mockedReadLine: Mocked<ReadLine> = {
            pause: jest.fn(),
            question: jest.fn()
        }

        mockedReadLine.question.mockImplementationOnce((_, callback) => void callback('two'))
        const mockedReadLineFactory = () => mockedReadLine as any as ReadLine
        const stdIoReader = makeStdIoReader(mockedReadLineFactory)

        const response = await stdIoReader.promptUser('what is 1 + 1?')
        stdIoReader.pause()

        expect(mockedReadLine.question.mock.calls.length).toEqual(1)
        expect(mockedReadLine.question.mock.calls[0][0]).toEqual('what is 1 + 1?')
        expect(mockedReadLine.question.mock.calls[0][1]).toBeInstanceOf(Function)

        expect(mockedReadLine.pause.mock.calls.length).toEqual(1)
        expect(mockedReadLine.pause.mock.calls[0].length).toEqual(0)

        expect(response).toEqual('two')
    })
});
