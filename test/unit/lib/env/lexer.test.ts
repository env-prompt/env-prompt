// import { analyzeEnvSourceCode } from "../../../../src/lib/env/lexer"
import { analyzeEnvSourceCode } from "lib/env/lexer"

describe('.env lexer', () => {
    test('that 1 === 1', () => {
        expect(1).toBe(1)
        const foo = analyzeEnvSourceCode(`
        OK=mydude
        # lol
        `)
        console.log(foo)
    })
})
