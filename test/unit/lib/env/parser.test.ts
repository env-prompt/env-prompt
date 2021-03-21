import { parseEnvTokens, ParsedEnvDocument } from "../../../../src/lib/env/parser"
import { Token, analyzeEnvSourceCode, TokenType } from "../../../../src/lib/env/lexer"

describe('.env parser', () => {
    test('that an empty document is parsed when there are no tokens', () => {
        const tokens: Token[] = []
        const document = parseEnvTokens(tokens)
        expect(document).toEqual({
            variablesByName: {},
            abstractSyntaxTree: { type: 'document', statements: [] }
        })
    })

    test('that an empty document is parsed when there is only a whitespace token', () => {
        const tokens: Token[] = [
            {
                type: TokenType.whitespace,
                position: 0,
                line: 1,
                column: 1,
                length: 1,
                value: ' '
            }
        ]
        const document = parseEnvTokens(tokens)
        expect(document).toEqual({
            variablesByName: {},
            abstractSyntaxTree: { type: 'document', statements: [] }
        })
    })

    test('that a newline statement is parsed when there is a newline token', () => {
        const tokens: Token[] = [
          {
            type: TokenType.newline,
            position: 0,
            line: 1,
            column: 1,
            length: 1,
            value: '\n'
          }
        ]
        const document = parseEnvTokens(tokens)
        expect(document).toEqual(
            {
                "variablesByName":{},"abstractSyntaxTree":{"type":"document","statements":[{"type":"newline"}]}
            } as ParsedEnvDocument
        )
    })

    test('that a null-bodied comment statement is parsed from a lone comment token', () => {
        const tokens: Token[] = [
            {
                type: TokenType.comment,
                position: 0,
                line: 1,
                column: 1,
                length: 1,
                value: '#'
            }
        ]
        const document = parseEnvTokens(tokens)
        expect(document).toEqual(
            {
                "variablesByName":{},"abstractSyntaxTree":{"type":"document","statements":[{"type":"comment","body":null}]}
            } as ParsedEnvDocument
        )
    })

    test('that a comment statement with a body is parsed from a comment and commentBody token', () => {
        const tokens: Token[] = [
            {
                type: TokenType.comment,
                position: 0,
                line: 1,
                column: 1,
                length: 1,
                value: '#'
            },
            {
                type: TokenType.commentBody,
                position: 1,
                line: 1,
                column: 2,
                length: 5,
                value: 'hello'
            }
        ]
        const document = parseEnvTokens(tokens)
        expect(document).toEqual(
            {
                "variablesByName":{},"abstractSyntaxTree":{"type":"document","statements":[{"type":"comment","body":"hello"}]}
            } as ParsedEnvDocument
        )
    })

    test('that a comment must be terminated by a newline or end of document', () => {
        const tokens: Token[] = [
            {
                type: TokenType.comment,
                position: 0,
                line: 1,
                column: 1,
                length: 1,
                value: '#'
            },
            {
                type: TokenType.comment,
                position: 1,
                line: 1,
                column: 2,
                length: 1,
                value: '#'
            }
        ]
        expect(() => parseEnvTokens(tokens)).toThrow('Expected newline or end of document after comment at line 1 column 2.')
    })
})

// const foo = analyzeEnvSourceCode('#hello')
// console.log({ foo })
