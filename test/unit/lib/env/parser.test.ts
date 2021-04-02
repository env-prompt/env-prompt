import {
  parseEnvTokens,
  ParsedEnvDocument,
} from "../../../../src/lib/env/parser";
import { Token, TokenType } from "../../../../src/lib/env/lexer";

describe(".env parser", () => {
  test("that an empty document is parsed when there are no tokens", () => {
    const tokens: Token[] = [];
    const document = parseEnvTokens(tokens);
    expect(document).toEqual({
      variablesByName: {},
      abstractSyntaxTree: { type: "document", statements: [] },
    });
  });

  test("that an empty document is parsed when there is only a whitespace token", () => {
    const tokens: Token[] = [
      {
        type: TokenType.whitespace,
        position: 0,
        line: 1,
        column: 1,
        length: 1,
        value: " ",
      },
    ];
    const document = parseEnvTokens(tokens);
    expect(document).toEqual({
      variablesByName: {},
      abstractSyntaxTree: { type: "document", statements: [] },
    });
  });

  test("that a newline statement is parsed when there is a newline token", () => {
    const tokens: Token[] = [
      {
        type: TokenType.newline,
        position: 0,
        line: 1,
        column: 1,
        length: 1,
        value: "\n",
      },
    ];
    const document = parseEnvTokens(tokens);
    expect(document).toEqual({
      variablesByName: {},
      abstractSyntaxTree: {
        type: "document",
        statements: [{ type: "newline" }],
      },
    } as ParsedEnvDocument);
  });

  test("that a null-bodied comment statement is parsed from a lone comment token", () => {
    const tokens: Token[] = [
      {
        type: TokenType.comment,
        position: 0,
        line: 1,
        column: 1,
        length: 1,
        value: "#",
      },
    ];
    const document = parseEnvTokens(tokens);
    expect(document).toEqual({
      variablesByName: {},
      abstractSyntaxTree: {
        type: "document",
        statements: [{ type: "comment", body: null }],
      },
    } as ParsedEnvDocument);
  });

  test("that a comment statement with a body is parsed from a comment and commentBody token", () => {
    const tokens: Token[] = [
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
        length: 5,
        value: "hello",
      },
    ];
    const document = parseEnvTokens(tokens);
    expect(document).toEqual({
      variablesByName: {},
      abstractSyntaxTree: {
        type: "document",
        statements: [{ type: "comment", body: "hello" }],
      },
    } as ParsedEnvDocument);
  });

  test("that a comment must be terminated by a newline or end of document", () => {
    const tokens: Token[] = [
      {
        type: TokenType.comment,
        position: 0,
        line: 1,
        column: 1,
        length: 1,
        value: "#",
      },
      {
        type: TokenType.comment,
        position: 1,
        line: 1,
        column: 2,
        length: 1,
        value: "#",
      },
    ];
    expect(() => parseEnvTokens(tokens)).toThrow(
      "Expected newline or end of document after comment at line 1 column 2."
    );
  });

  describe("variable declaration", () => {
    test("that lone identifiers are not valid", () => {
      const tokens: Token[] = [
        {
          type: TokenType.identifier,
          position: 0,
          line: 1,
          column: 1,
          length: 3,
          value: "foo",
        },
      ];
      expect(() => parseEnvTokens(tokens)).toThrow(
        'Expected = after variable "foo" at line 1 column 4.'
      );
    });

    test("that identifiers can only be followed by assignment operators", () => {
      const tokens: Token[] = [
        {
          type: TokenType.identifier,
          position: 0,
          line: 1,
          column: 1,
          length: 3,
          value: "foo",
        },
        {
          type: TokenType.quote,
          position: 3,
          line: 1,
          column: 4,
          length: 1,
          value: '"',
        },
      ];
      expect(() => parseEnvTokens(tokens)).toThrow(
        'Expected = after variable "foo" at line 1 column 4.'
      );
    });

    test("that variables can be declared without a value", () => {
      const tokens: Token[] = [
        {
          type: TokenType.identifier,
          position: 0,
          line: 1,
          column: 1,
          length: 3,
          value: "foo",
        },
        {
          type: TokenType.operator,
          position: 3,
          line: 1,
          column: 4,
          length: 1,
          value: "=",
        },
      ];
      const document = parseEnvTokens(tokens);

      expect(document).toEqual({
        variablesByName: {
          foo: {
            type: "variableDeclaration",
            identifier: { type: "identifier", name: "foo" },
          },
        },
        abstractSyntaxTree: {
          type: "document",
          statements: [
            {
              type: "variableDeclaration",
              identifier: { type: "identifier", name: "foo" },
            },
          ],
        },
      });
    });

    test("that variables can be declared with a value", () => {
      const tokens: Token[] = [
        {
          type: TokenType.identifier,
          position: 0,
          line: 1,
          column: 1,
          length: 4,
          value: "name",
        },
        {
          type: TokenType.operator,
          position: 4,
          line: 1,
          column: 5,
          length: 1,
          value: "=",
        },
        {
          type: TokenType.literal,
          position: 5,
          line: 1,
          column: 6,
          length: 4,
          value: "john",
        },
      ];
      const document = parseEnvTokens(tokens);
      expect(document).toEqual({
        variablesByName: {
          name: {
            type: "variableDeclaration",
            identifier: { type: "identifier", name: "name" },
            value: { type: "literal", value: "john" },
          },
        },
        abstractSyntaxTree: {
          type: "document",
          statements: [
            {
              type: "variableDeclaration",
              identifier: { type: "identifier", name: "name" },
              value: { type: "literal", value: "john" },
            },
          ],
        },
      });
    });

    test("that assignment operators can be padded with spaces", () => {
      const tokens: Token[] = [
        {
          type: TokenType.identifier,
          position: 0,
          line: 1,
          column: 1,
          length: 4,
          value: "name",
        },
        {
          type: TokenType.whitespace,
          position: 4,
          line: 1,
          column: 5,
          length: 1,
          value: " ",
        },
        {
          type: TokenType.operator,
          position: 5,
          line: 1,
          column: 6,
          length: 1,
          value: "=",
        },
        {
          type: TokenType.whitespace,
          position: 6,
          line: 1,
          column: 7,
          length: 1,
          value: " ",
        },
      ];
      const document = parseEnvTokens(tokens);
      expect(document).toEqual({
        variablesByName: {
          name: {
            type: "variableDeclaration",
            identifier: { type: "identifier", name: "name" },
          },
        },
        abstractSyntaxTree: {
          type: "document",
          statements: [
            {
              type: "variableDeclaration",
              identifier: { type: "identifier", name: "name" },
            },
          ],
        },
      });
    });

    test("that literals can be double quoted", () => {
      const tokens: Token[] = [
        {
          type: TokenType.identifier,
          position: 0,
          line: 1,
          column: 1,
          length: 4,
          value: "some",
        },
        {
          type: TokenType.operator,
          position: 4,
          line: 1,
          column: 5,
          length: 1,
          value: "=",
        },
        {
          type: TokenType.quote,
          position: 5,
          line: 1,
          column: 6,
          length: 1,
          value: '"',
        },
        {
          type: TokenType.literal,
          position: 6,
          line: 1,
          column: 7,
          length: 19,
          value: "{'json': 'content'}",
        },
        {
          type: TokenType.quote,
          position: 25,
          line: 1,
          column: 26,
          length: 1,
          value: '"',
        },
      ];
      const document = parseEnvTokens(tokens);

      expect(document).toEqual({
        variablesByName: {
          some: {
            type: "variableDeclaration",
            identifier: { type: "identifier", name: "some" },
            value: {
              type: "quotedLiteral",
              quoteType: '"',
              content: { type: "literal", value: "{'json': 'content'}" },
            },
          },
        },
        abstractSyntaxTree: {
          type: "document",
          statements: [
            {
              type: "variableDeclaration",
              identifier: { type: "identifier", name: "some" },
              value: {
                type: "quotedLiteral",
                quoteType: '"',
                content: { type: "literal", value: "{'json': 'content'}" },
              },
            },
          ],
        },
      });
    });

    test("that literals can be single quoted", () => {
      const tokens: Token[] = [
        {
          type: TokenType.identifier,
          position: 0,
          line: 1,
          column: 1,
          length: 3,
          value: "iam",
        },
        {
          type: TokenType.operator,
          position: 3,
          line: 1,
          column: 4,
          length: 1,
          value: "=",
        },
        {
          type: TokenType.quote,
          position: 4,
          line: 1,
          column: 5,
          length: 1,
          value: "'",
        },
        {
          type: TokenType.literal,
          position: 5,
          line: 1,
          column: 6,
          length: 19,
          value: "a single quoted var",
        },
        {
          type: TokenType.quote,
          position: 24,
          line: 1,
          column: 25,
          length: 1,
          value: "'",
        },
      ];
      const document = parseEnvTokens(tokens);

      expect(document).toEqual({
        variablesByName: {
          iam: {
            type: "variableDeclaration",
            identifier: { type: "identifier", name: "iam" },
            value: {
              type: "quotedLiteral",
              quoteType: "'",
              content: { type: "literal", value: "a single quoted var" },
            },
          },
        },
        abstractSyntaxTree: {
          type: "document",
          statements: [
            {
              type: "variableDeclaration",
              identifier: { type: "identifier", name: "iam" },
              value: {
                type: "quotedLiteral",
                quoteType: "'",
                content: { type: "literal", value: "a single quoted var" },
              },
            },
          ],
        },
      });
    });

    test("that comments can exist with no body", () => {
      const tokens: Token[] = [
        {
          type: TokenType.identifier,
          position: 0,
          line: 1,
          column: 1,
          length: 5,
          value: "hello",
        },
        {
          type: TokenType.operator,
          position: 5,
          line: 1,
          column: 6,
          length: 1,
          value: "=",
        },
        {
          type: TokenType.literal,
          position: 6,
          line: 1,
          column: 7,
          length: 5,
          value: "world",
        },
        {
          type: TokenType.comment,
          position: 11,
          line: 1,
          column: 12,
          length: 1,
          value: "#",
        },
        {
          type: TokenType.newline,
          position: 12,
          line: 1,
          column: 13,
          length: 1,
          value: "\n",
        },
      ];
      const document = parseEnvTokens(tokens);

      expect(document).toEqual({
        variablesByName: {
          hello: {
            type: "variableDeclaration",
            identifier: { type: "identifier", name: "hello" },
            value: { type: "literal", value: "world" },
          },
        },
        abstractSyntaxTree: {
          type: "document",
          statements: [
            {
              type: "variableDeclaration",
              identifier: { type: "identifier", name: "hello" },
              value: { type: "literal", value: "world" },
            },
            { type: "comment", body: null },
            { type: "newline" },
          ],
        },
      });
    });

    test("that comments with a body can be terminated with a newline", () => {
      const tokens: Token[] = [
        {
          type: TokenType.identifier,
          position: 0,
          line: 1,
          column: 1,
          length: 4,
          value: "test",
        },
        {
          type: TokenType.operator,
          position: 4,
          line: 1,
          column: 5,
          length: 1,
          value: "=",
        },
        {
          type: TokenType.comment,
          position: 5,
          line: 1,
          column: 6,
          length: 1,
          value: "#",
        },
        {
          type: TokenType.commentBody,
          position: 6,
          line: 1,
          column: 7,
          length: 12,
          value: "comment body",
        },
        {
          type: TokenType.newline,
          position: 18,
          line: 1,
          column: 19,
          length: 1,
          value: "\n",
        },
      ];
      const document = parseEnvTokens(tokens);

      expect(document).toEqual({
        variablesByName: {
          test: {
            type: "variableDeclaration",
            identifier: { type: "identifier", name: "test" },
          },
        },
        abstractSyntaxTree: {
          type: "document",
          statements: [
            {
              type: "variableDeclaration",
              identifier: { type: "identifier", name: "test" },
            },
            { type: "comment", body: "comment body" },
            { type: "newline" },
          ],
        },
      });
    });
  });
});
