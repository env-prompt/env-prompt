import { analyzeEnvSourceCode, Token, TokenType } from "../../../../src/lib/env/lexer"

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

    test('that quoted values can be empty', () => {
      const envFile = `emptyUnquoted=
emptySingleQuoted=''
emptyDoubleQuoted=""
fullUnquoted=hello
fullSingleQuoted='some stuff'
fullDoubleQuoted="some other stuff"
`
      const tokens = analyzeEnvSourceCode(envFile)
      expect(tokens).toEqual([
        {
          type: TokenType.identifier,
          position: 0,
          line: 1,
          column: 1,
          length: 13,
          value: "emptyUnquoted",
        },
        {
          type: TokenType.operator,
          position: 13,
          line: 1,
          column: 14,
          length: 1,
          value: "=",
        },
        {
          type: TokenType.newline,
          position: 14,
          line: 1,
          column: 15,
          length: 1,
          value: "\n",
        },
        {
          type: TokenType.identifier,
          position: 15,
          line: 2,
          column: 1,
          length: 17,
          value: "emptySingleQuoted",
        },
        {
          type: TokenType.operator,
          position: 32,
          line: 2,
          column: 18,
          length: 1,
          value: "=",
        },
        {
          type: TokenType.quote,
          position: 33,
          line: 2,
          column: 19,
          length: 1,
          value: "'",
        },
        {
          type: TokenType.quote,
          position: 34,
          line: 2,
          column: 20,
          length: 1,
          value: "'",
        },
        {
          type: TokenType.newline,
          position: 35,
          line: 2,
          column: 21,
          length: 1,
          value: "\n",
        },
        {
          type: TokenType.identifier,
          position: 36,
          line: 3,
          column: 1,
          length: 17,
          value: "emptyDoubleQuoted",
        },
        {
          type: TokenType.operator,
          position: 53,
          line: 3,
          column: 18,
          length: 1,
          value: "=",
        },
        {
          type: TokenType.quote,
          position: 54,
          line: 3,
          column: 19,
          length: 1,
          value: "\"",
        },
        {
          type: TokenType.quote,
          position: 55,
          line: 3,
          column: 20,
          length: 1,
          value: "\"",
        },
        {
          type: TokenType.newline,
          position: 56,
          line: 3,
          column: 21,
          length: 1,
          value: "\n",
        },
        {
          type: TokenType.identifier,
          position: 57,
          line: 4,
          column: 1,
          length: 12,
          value: "fullUnquoted",
        },
        {
          type: TokenType.operator,
          position: 69,
          line: 4,
          column: 13,
          length: 1,
          value: "=",
        },
        {
          type: TokenType.literal,
          position: 70,
          line: 4,
          column: 14,
          length: 5,
          value: "hello",
        },
        {
          type: TokenType.newline,
          position: 75,
          line: 4,
          column: 19,
          length: 1,
          value: "\n",
        },
        {
          type: TokenType.identifier,
          position: 76,
          line: 5,
          column: 1,
          length: 16,
          value: "fullSingleQuoted",
        },
        {
          type: TokenType.operator,
          position: 92,
          line: 5,
          column: 17,
          length: 1,
          value: "=",
        },
        {
          type: TokenType.quote,
          position: 93,
          line: 5,
          column: 18,
          length: 1,
          value: "'",
        },
        {
          type: TokenType.literal,
          position: 94,
          line: 5,
          column: 19,
          length: 10,
          value: "some stuff",
        },
        {
          type: TokenType.quote,
          position: 104,
          line: 5,
          column: 29,
          length: 1,
          value: "'",
        },
        {
          type: TokenType.newline,
          position: 105,
          line: 5,
          column: 30,
          length: 1,
          value: "\n",
        },
        {
          type: TokenType.identifier,
          position: 106,
          line: 6,
          column: 1,
          length: 16,
          value: "fullDoubleQuoted",
        },
        {
          type: TokenType.operator,
          position: 122,
          line: 6,
          column: 17,
          length: 1,
          value: "=",
        },
        {
          type: TokenType.quote,
          position: 123,
          line: 6,
          column: 18,
          length: 1,
          value: "\"",
        },
        {
          type: TokenType.literal,
          position: 124,
          line: 6,
          column: 19,
          length: 16,
          value: "some other stuff",
        },
        {
          type: TokenType.quote,
          position: 140,
          line: 6,
          column: 35,
          length: 1,
          value: "\"",
        },
        {
          type: TokenType.newline,
          position: 141,
          line: 6,
          column: 36,
          length: 1,
          value: "\n",
        },
      ] as Token[])
    })
  })

  test('that quotes in literals can be escaped', () => {
    const envFile = `escapedDouble="this has \\"escaped\\" dobule quotes"
escapedSingle='this has \\'escaped\\' single quotes'`
    const tokens = analyzeEnvSourceCode(envFile)
    expect(tokens).toEqual([
      {
        type: TokenType.identifier,
        position: 0,
        line: 1,
        column: 1,
        length: 13,
        value: "escapedDouble",
      },
      {
        type: TokenType.operator,
        position: 13,
        line: 1,
        column: 14,
        length: 1,
        value: "=",
      },
      {
        type: TokenType.quote,
        position: 14,
        line: 1,
        column: 15,
        length: 1,
        value: "\"",
      },
      {
        type: TokenType.literal,
        position: 15,
        line: 1,
        column: 16,
        length: 34,
        value: `this has \\"escaped\\" dobule quotes`,
      },
      {
        type: TokenType.quote,
        position: 49,
        line: 1,
        column: 50,
        length: 1,
        value: "\"",
      },
      {
        type: TokenType.newline,
        position: 50,
        line: 1,
        column: 51,
        length: 1,
        value: "\n",
      },
      {
        type: TokenType.identifier,
        position: 51,
        line: 2,
        column: 1,
        length: 13,
        value: "escapedSingle",
      },
      {
        type: TokenType.operator,
        position: 64,
        line: 2,
        column: 14,
        length: 1,
        value: "=",
      },
      {
        type: TokenType.quote,
        position: 65,
        line: 2,
        column: 15,
        length: 1,
        value: "'",
      },
      {
        type: TokenType.literal,
        position: 66,
        line: 2,
        column: 16,
        length: 34,
        value: "this has \\'escaped\\' single quotes",
      },
      {
        type: TokenType.quote,
        position: 100,
        line: 2,
        column: 50,
        length: 1,
        value: "'",
      },
    ] as Token[])
  })

  test('that windows CRLF newlines can be used', () => {
    const envFile = '# some comment\r\n'
      + 'some=value\r\n'
    const tokens = analyzeEnvSourceCode(envFile)
    expect(tokens).toEqual([
      {
        type: TokenType.comment,
        position: 0,
        line: 1,
        column: 1,
        length: 1,
        value: "#",
      },
      {
        type: TokenType.commentBody,
        position: 1,
        line: 1,
        column: 2,
        length: 13,
        value: " some comment",
      },
      {
        type: TokenType.newline,
        position: 14,
        line: 1,
        column: 15,
        length: 2,
        value: "\r\n",
      },
      {
        type: TokenType.identifier,
        position: 16,
        line: 2,
        column: 1,
        length: 4,
        value: "some",
      },
      {
        type: TokenType.operator,
        position: 20,
        line: 2,
        column: 5,
        length: 1,
        value: "=",
      },
      {
        type: TokenType.literal,
        position: 21,
        line: 2,
        column: 6,
        length: 5,
        value: "value",
      },
      {
        type: TokenType.newline,
        position: 26,
        line: 2,
        column: 11,
        length: 2,
        value: "\r\n",
      },
    ] as Token[])
  })

  test('that CR newlines can be used', () => {
    const envFile = '# some comment\r'
      + 'some=value\r'
    const tokens = analyzeEnvSourceCode(envFile)
    expect(tokens).toEqual([
      {
        type: TokenType.comment,
        position: 0,
        line: 1,
        column: 1,
        length: 1,
        value: "#",
      },
      {
        type: TokenType.commentBody,
        position: 1,
        line: 1,
        column: 2,
        length: 13,
        value: " some comment",
      },
      {
        type: TokenType.newline,
        position: 14,
        line: 1,
        column: 15,
        length: 1,
        value: "\r",
      },
      {
        type: TokenType.identifier,
        position: 15,
        line: 2,
        column: 1,
        length: 4,
        value: "some",
      },
      {
        type: TokenType.operator,
        position: 19,
        line: 2,
        column: 5,
        length: 1,
        value: "=",
      },
      {
        type: TokenType.literal,
        position: 20,
        line: 2,
        column: 6,
        length: 5,
        value: "value",
      },
      {
        type: TokenType.newline,
        position: 25,
        line: 2,
        column: 11,
        length: 1,
        value: "\r",
      },
    ] as Token[])
  })
})
