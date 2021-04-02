import { analyzeEnvSourceCode, Token } from "../../../../src/lib/env/lexer"

describe('.env lexer', () => {
    describe('comments', () => {
        test('that no tokens are analyzed from empty files', () => {
            const envFile = ''
            const tokens = analyzeEnvSourceCode(envFile)
            expect(tokens).toEqual([])
        })

        test('that comments with no body are analyzed', () => {
            const envFile = '#'
            const tokens = analyzeEnvSourceCode(envFile)
            expect(tokens).toEqual([
                { type: 'comment', position: 0, line: 1, column: 1, length: 1, value: '#' }
            ] as Token[])
        })

        test('that comments with a body are analyzed', () => {
            const envFile = '# hello world'
            const tokens = analyzeEnvSourceCode(envFile)
            expect(tokens).toEqual([
                { type: 'comment', position: 0, line: 1, column: 1, length: 1, value: '#' },
                { type: 'commentBody', position: 1, line: 1, column: 2, length: 12, value: ' hello world' }
            ] as Token[])
        })

        test("that comment bodies don't need to start with a white space", () => {
            const envFile = '#lol'
            const tokens = analyzeEnvSourceCode(envFile)
            expect(tokens).toEqual([
                { type: 'comment', position: 0, line: 1, column: 1, length: 1, value: '#' },
                { type: 'commentBody', position: 1, line: 1, column: 2, length: 3, value: 'lol' }
            ] as Token[])
        })

        test('that comments can come after spaces', () => {
            const envFile = '    #comment after space'
            const tokens = analyzeEnvSourceCode(envFile)
            expect(tokens).toEqual([
                { type: 'whitespace', position: 0, line: 1, column: 1, length: 1, value: ' ' },
                { type: 'whitespace', position: 1, line: 1, column: 2, length: 1, value: ' ' },
                { type: 'whitespace', position: 2, line: 1, column: 3, length: 1, value: ' ' },
                { type: 'whitespace', position: 3, line: 1, column: 4, length: 1, value: ' ' },
                { type: 'comment', position: 4, line: 1, column: 5, length: 1, value: '#' },
                { type: 'commentBody', position: 5, line: 1, column: 6, length: 19, value: 'comment after space' }
            ] as Token[])
        })

        test('that comments only span one line', () => {
            const envFile = 
`# hello world
test`
            const tokens = analyzeEnvSourceCode(envFile)
            expect(tokens).toEqual([
                { type: 'comment', position: 0, line: 1, column: 1, length: 1, value: '#' },
                { type: 'commentBody', position: 1, line: 1, column: 2, length: 12, value: ' hello world' },
                { type: 'newline', position: 13, line: 1, column: 14, length: 1, value: '\n' },
                { type: 'identifier', position: 14, line: 2, column: 1, length: 4, value: 'test' }
            ] as Token[])
        })

        test('that comments can come after other tokens', () => {
            const envFile = 'test # comment that is after'
            const tokens = analyzeEnvSourceCode(envFile)
            expect(tokens).toEqual([
                { type: 'identifier', position: 0, line: 1, column: 1, length: 4, value: 'test' },
                { type: 'whitespace', position: 4, line: 1, column: 5, length: 1, value: ' ' },
                { type: 'comment', position: 5, line: 1, column: 6, length: 1, value: '#' },
                { type: 'commentBody', position: 6, line: 1, column: 7, length: 22, value: ' comment that is after' }
            ] as Token[])
        })
    })

    describe('variable assignment', () => {
        test('identifiers can be assigned to simple literals', () => {
            const envFile = 'foo=bar'
            const tokens = analyzeEnvSourceCode(envFile)
            expect(tokens).toEqual([
                { type: 'identifier', position: 0, line: 1, column: 1, length: 3, value: 'foo' },
                { type: 'operator', position: 3, line: 1, column: 4, length: 1, value: '=' },
                { type: 'literal', position: 4, line: 1, column: 5, length: 3, value: 'bar' }
            ] as Token[])
        })

        test('that values can be single quoted', () => {
            const envFile = `this='has "double quotes" in the value'`
            const tokens = analyzeEnvSourceCode(envFile)
            expect(tokens).toEqual([
                { type: 'identifier', position: 0, line: 1, column: 1, length: 4, value: 'this' },
                { type: 'operator', position: 4, line: 1, column: 5, length: 1, value: '=' },
                { type: 'quote', position: 5, line: 1, column: 6, length: 1, value: "'" },
                { type: 'literal', position: 6, line: 1, column: 7, length: 32, value: 'has "double quotes" in the value' },
                { type: 'quote', position: 38, line: 1, column: 39, length: 1, value: "'" }
            ] as Token[])
        })

        test('that multi-line values can be double quoted', () => {
            const envFile = 
`this="{
    is: {
        a: ['multi-line', 'json', 'string']
    }
}"`
            const tokens = analyzeEnvSourceCode(envFile)
            expect(tokens).toEqual([
                { type: 'identifier', position: 0, line: 1, column: 1, length: 4, value: 'this' },
                { type: 'operator', position: 4, line: 1, column: 5, length: 1, value: '=' },
                { type: 'quote', position: 5, line: 1, column: 6, length: 1, value: '"' },
                { type: 'literal', position: 6, line: 1, column: 7, length: 63, value: `{\n    is: {\n        a: ['multi-line', 'json', 'string']\n    }\n}` },
                { type: 'quote', position: 69, line: 1, column: 70, length: 1, value: '"' }
            ] as Token[])
        })

        test('that comments cannot exist in quoted literals', () => {
            const envFile = 
`valA="#a comment"
valB='# another one'`
            const tokens = analyzeEnvSourceCode(envFile)
            expect(tokens).toEqual([
                { type: 'identifier', position: 0, line: 1, column: 1, length: 4, value: 'valA' },
                { type: 'operator', position: 4, line: 1, column: 5, length: 1, value: '=' },
                { type: 'quote', position: 5, line: 1, column: 6, length: 1, value: '"' },
                { type: 'literal', position: 6, line: 1, column: 7, length: 10, value: '#a comment' },
                { type: 'quote', position: 16, line: 1, column: 17, length: 1, value: '"' },
                { type: 'newline', position: 17, line: 1, column: 18, length: 1, value: '\n' },
                { type: 'identifier', position: 18, line: 2, column: 1, length: 4, value: 'valB' },
                { type: 'operator', position: 22, line: 2, column: 5, length: 1, value: '=' },
                { type: 'quote', position: 23, line: 2, column: 6, length: 1, value: "'" },
                { type: 'literal', position: 24, line: 2, column: 7, length: 13, value: '# another one' },
                { type: 'quote', position: 37, line: 2, column: 20, length: 1, value: "'" }
            ] as Token[])
        })

        test('that comments can exist on the same line as a variable assignment', () => {
            const envFile = 'foo=bar # hello world'
            const tokens = analyzeEnvSourceCode(envFile)
            expect(tokens).toEqual([
                { type: 'identifier', position: 0, line: 1, column: 1, length: 3, value: 'foo' },
                { type: 'operator', position: 3, line: 1, column: 4, length: 1, value: '=' },
                { type: 'literal', position: 4, line: 1, column: 5, length: 3, value: 'bar' },
                { type: 'whitespace', position: 7, line: 1, column: 8, length: 1, value: ' ' },
                { type: 'comment', position: 8, line: 1, column: 9, length: 1, value: '#' },
                { type: 'commentBody', position: 9, line: 1, column: 10, length: 12, value: ' hello world' }
            ] as Token[])
        })

        test('that newlines terminate variable assignment when the literal value is unqouted', () => {
            const envFile =
`foo=test123
bar=test456`
            const tokens = analyzeEnvSourceCode(envFile)
            expect(tokens).toEqual([
                { type: 'identifier', position: 0, line: 1, column: 1, length: 3, value: 'foo' },
                { type: 'operator', position: 3, line: 1, column: 4, length: 1, value: '=' },
                { type: 'literal', position: 4, line: 1, column: 5, length: 7, value: 'test123' },
                { type: 'newline', position: 11, line: 1, column: 12, length: 1, value: '\n' },
                { type: 'identifier', position: 12, line: 2, column: 1, length: 3, value: 'bar' },
                { type: 'operator', position: 15, line: 2, column: 4, length: 1, value: '=' },
                { type: 'literal', position: 16, line: 2, column: 5, length: 7, value: 'test456' }
            ] as Token[])
        })
    })
})
