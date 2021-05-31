import { CliPrompter } from "../../../../src/lib/cli";
import {
  Token,
  TokenType,
} from "../../../../src/lib/env/lexer";
import {
  DocumentNode,
  NodeType,
  ParsedEnvDocument,
  QuoteType,
} from "../../../../src/lib/env/parser";
import { NewlineType, Options } from "../../../../src/lib/options";
import { Merge, NodeFs, makeMerge } from "../../../../src/lib/env/merger";

type MockedObject<T> = Partial<Record<keyof T, jest.Mock>>;

describe(".env merger", () => {
  let cliPrompter: MockedObject<CliPrompter>;
  let analyzeEnvSourceCode: jest.Mock;
  let parseEnvTokens: jest.Mock;
  let render: jest.Mock;
  let fs: MockedObject<NodeFs>;
  let merge: Merge;
  beforeEach(() => {
    cliPrompter = {
      promptUserAboutNewVariables: jest.fn(),
      promptUserForEnvironmentVariable: jest.fn(),
      printError: jest.fn(),
      printWarning: jest.fn(),
    };
    analyzeEnvSourceCode = jest.fn();
    parseEnvTokens = jest.fn();
    render = jest.fn();
    fs = {
      existsSync: jest.fn(),
      readFileSync: jest.fn(),
      writeFileSync: jest.fn(),
    };
    merge = makeMerge(
      cliPrompter as CliPrompter,
      analyzeEnvSourceCode,
      parseEnvTokens,
      render,
      fs as NodeFs
    );
  });

  test("that merging fails when the dist file does not exist", async () => {
    fs.existsSync.mockReturnValueOnce(false);
    const options: Options = {
      distFilePath: ".env.dist",
      localFilePath: ".env",
      prompts: true,
      newlineType: NewlineType.unix,
    };
    const execution = async () => await merge(options);
    await expect(execution).rejects.toThrow("Could not locate .env.dist");

    expect(fs.existsSync.mock.calls).toEqual([[".env.dist"]]);
  });

  test("that variables only present in .env.dist are added to .env", async () => {
    fs.existsSync.mockReturnValueOnce(true);
    fs.readFileSync.mockReturnValueOnce("foo=bar");
    const distTokens: Token[] = [
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
      {
        type: TokenType.literal,
        position: 4,
        line: 1,
        column: 5,
        length: 3,
        value: "bar",
      },
    ];
    analyzeEnvSourceCode.mockReturnValueOnce(distTokens);
    const distDocument: ParsedEnvDocument = {
      variablesByName: {
        foo: {
          type: NodeType.variableDeclaration,
          identifier: {
            type: NodeType.identifier,
            name: "foo",
          },
          value: {
            type: NodeType.literal,
            value: "bar",
          },
        },
      },
      abstractSyntaxTree: {
        type: NodeType.document,
        statements: [
          {
            type: NodeType.variableDeclaration,
            identifier: {
              type: NodeType.identifier,
              name: "foo",
            },
            value: {
              type: NodeType.literal,
              value: "bar",
            },
          },
        ],
      },
    };
    parseEnvTokens.mockReturnValueOnce(distDocument);
    fs.existsSync.mockReturnValueOnce(false);
    const localDocument: ParsedEnvDocument = {
      variablesByName: {},
      abstractSyntaxTree: {
        type: NodeType.document,
        statements: [],
      },
    };
    parseEnvTokens.mockReturnValueOnce(localDocument);
    cliPrompter.promptUserForEnvironmentVariable.mockResolvedValueOnce({
      value: "user input value",
    });
    render.mockReturnValueOnce("foo=user input value\n");

    const options: Options = {
      distFilePath: ".env.dist",
      localFilePath: ".env",
      prompts: true,
      newlineType: NewlineType.unix,
    };
    await merge(options);

    expect(fs.existsSync.mock.calls).toEqual([[".env.dist"], [".env"]]);
    expect(fs.readFileSync.mock.calls).toEqual([
      [".env.dist", { encoding: "utf8" }],
    ]);
    expect(cliPrompter.promptUserAboutNewVariables.mock.calls).toEqual([[]]);
    expect(cliPrompter.promptUserForEnvironmentVariable.mock.calls).toEqual([
      [{ name: "foo", value: "bar" }],
    ]);
    const abstractSyntaxTree: DocumentNode = {
      type: NodeType.document,
      statements: [
        {
          type: NodeType.variableDeclaration,
          identifier: {
            type: NodeType.identifier,
            name: "foo",
          },
          value: {
            type: NodeType.literal,
            value: "user input value",
          },
        },
        {
          type: NodeType.newline,
        },
      ],
    };
    expect(render.mock.calls).toEqual([[abstractSyntaxTree, options]]);
    expect(fs.writeFileSync.mock.calls).toEqual([
      [".env", "foo=user input value\n", { encoding: "utf8" }],
    ]);
  });

  test("that distributed variables with no value can be prompted", async () => {
    fs.existsSync.mockReturnValueOnce(true);
    fs.readFileSync.mockReturnValueOnce("foo=");
    const distTokens: Token[] = [
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
    analyzeEnvSourceCode.mockReturnValueOnce(distTokens);
    const distDocument: ParsedEnvDocument = {
      variablesByName: {
        foo: {
          type: NodeType.variableDeclaration,
          identifier: {
            type: NodeType.identifier,
            name: "foo",
          },
          value: undefined
        },
      },
      abstractSyntaxTree: {
        type: NodeType.document,
        statements: [
          {
            type: NodeType.variableDeclaration,
            identifier: {
              type: NodeType.identifier,
              name: "foo",
            },
            value: undefined
          },
        ],
      },
    };
    parseEnvTokens.mockReturnValueOnce(distDocument);
    fs.existsSync.mockReturnValueOnce(false);
    const localDocument: ParsedEnvDocument = {
      variablesByName: {},
      abstractSyntaxTree: {
        type: NodeType.document,
        statements: [],
      },
    };
    parseEnvTokens.mockReturnValueOnce(localDocument);
    cliPrompter.promptUserForEnvironmentVariable.mockResolvedValueOnce({
      value: "user input value",
    });
    render.mockReturnValueOnce("foo=user input value\n");

    const options: Options = {
      distFilePath: ".env.dist",
      localFilePath: ".env",
      prompts: true,
      newlineType: NewlineType.unix,
    };
    await merge(options);

    expect(fs.existsSync.mock.calls).toEqual([[".env.dist"], [".env"]]);
    expect(fs.readFileSync.mock.calls).toEqual([
      [".env.dist", { encoding: "utf8" }],
    ]);
    expect(cliPrompter.promptUserAboutNewVariables.mock.calls).toEqual([[]]);
    expect(cliPrompter.promptUserForEnvironmentVariable.mock.calls).toEqual([
      [{ name: "foo", value: "" }],
    ]);
    const abstractSyntaxTree: DocumentNode = {
      type: NodeType.document,
      statements: [
        {
          type: NodeType.variableDeclaration,
          identifier: {
            type: NodeType.identifier,
            name: "foo",
          },
          value: {
            type: NodeType.literal,
            value: "user input value",
          },
        },
        {
          type: NodeType.newline,
        },
      ],
    };
    expect(render.mock.calls).toEqual([[abstractSyntaxTree, options]]);
    expect(fs.writeFileSync.mock.calls).toEqual([
      [".env", "foo=user input value\n", { encoding: "utf8" }],
    ]);
  });

  test("that the user isn't prompted for variables they already have in .env", async () => {
    fs.existsSync.mockReturnValueOnce(true);
    fs.readFileSync.mockReturnValueOnce("foo=bar");
    const distTokens: Token[] = [
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
      {
        type: TokenType.literal,
        position: 4,
        line: 1,
        column: 5,
        length: 3,
        value: "bar",
      },
    ];
    analyzeEnvSourceCode.mockReturnValueOnce(distTokens);
    const distDocument: ParsedEnvDocument = {
      variablesByName: {
        foo: {
          type: NodeType.variableDeclaration,
          identifier: {
            type: NodeType.identifier,
            name: "foo",
          },
          value: {
            type: NodeType.literal,
            value: "bar",
          },
        },
      },
      abstractSyntaxTree: {
        type: NodeType.document,
        statements: [
          {
            type: NodeType.variableDeclaration,
            identifier: {
              type: NodeType.identifier,
              name: "foo",
            },
            value: {
              type: NodeType.literal,
              value: "bar",
            },
          },
        ],
      },
    };
    parseEnvTokens.mockReturnValueOnce(distDocument);

    fs.existsSync.mockReturnValueOnce(true);
    fs.readFileSync.mockReturnValueOnce("foo=already exists");
    const localTokens: Token[] = [
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
      {
        type: TokenType.literal,
        position: 4,
        line: 1,
        column: 5,
        length: 14,
        value: "already exists",
      },
    ]
    analyzeEnvSourceCode.mockReturnValueOnce(localTokens);
    const localDocument: ParsedEnvDocument = {
      variablesByName: {
        foo: {
          type: NodeType.variableDeclaration,
          identifier: {
            type: NodeType.identifier,
            name: "foo",
          },
          value: {
            type: NodeType.literal,
            value: "already exists",
          },
        },
      },
      abstractSyntaxTree: {
        type: NodeType.document,
        statements: [
          {
            type: NodeType.variableDeclaration,
            identifier: {
              type: NodeType.identifier,
              name: "foo",
            },
            value: {
              type: NodeType.literal,
              value: "already exists",
            },
          },
        ],
      },
    };
    parseEnvTokens.mockReturnValueOnce(localDocument);
    render.mockReturnValueOnce("foo=already exists");

    const options: Options = {
      distFilePath: ".env.dist",
      localFilePath: ".env",
      prompts: true,
      newlineType: NewlineType.unix,
    };
    await merge(options);

    expect(fs.existsSync.mock.calls).toEqual([[".env.dist"], [".env"]]);
    expect(fs.readFileSync.mock.calls).toEqual([
      [".env.dist", { encoding: "utf8" }],
      [".env", { encoding: "utf8" }],
    ]);
    const abstractSyntaxTree: DocumentNode = {
      type: NodeType.document,
      statements: [
        {
          type: NodeType.variableDeclaration,
          identifier: {
            type: NodeType.identifier,
            name: "foo",
          },
          value: {
            type: NodeType.literal,
            value: "already exists",
          },
        },
      ],
    };
    expect(render.mock.calls).toEqual([[abstractSyntaxTree, options]]);
    expect(fs.writeFileSync.mock.calls).toEqual([
      [".env", "foo=already exists", { encoding: "utf8" }],
    ]);
  });

  test('that empty quoted values from .env.dist are added to .env', async () => {
    fs.existsSync.mockReturnValueOnce(true);
    fs.readFileSync.mockReturnValueOnce(`lorem=""`);
    const distTokens: Token[] = [
      {
        type: TokenType.identifier,
        position: 0,
        line: 1,
        column: 1,
        length: 5,
        value: "lorem",
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
        type: TokenType.quote,
        position: 6,
        line: 1,
        column: 7,
        length: 1,
        value: "\"",
      },
      {
        type: TokenType.quote,
        position: 7,
        line: 1,
        column: 8,
        length: 1,
        value: "\"",
      },
    ];
    analyzeEnvSourceCode.mockReturnValueOnce(distTokens);
    const distDocument: ParsedEnvDocument = {
      variablesByName: {
        lorem: {
          type: NodeType.variableDeclaration,
          identifier: {
            type: NodeType.identifier,
            name: "lorem",
          },
          value: {
            type: NodeType.quotedLiteral,
            quoteType: QuoteType.double,
            content: null,
          },
        },
      },
      abstractSyntaxTree: {
        type: NodeType.document,
        statements: [
          {
            type: NodeType.variableDeclaration,
            identifier: {
              type: NodeType.identifier,
              name: "lorem",
            },
            value: {
              type: NodeType.quotedLiteral,
              quoteType: QuoteType.double,
              content: null,
            },
          },
        ],
      },
    }
    parseEnvTokens.mockReturnValueOnce(distDocument);
    fs.existsSync.mockReturnValueOnce(false);
    const localDocument: ParsedEnvDocument = {
      variablesByName: {},
      abstractSyntaxTree: {
        type: NodeType.document,
        statements: [],
      },
    };
    parseEnvTokens.mockReturnValueOnce(localDocument);
    render.mockReturnValueOnce('lorem=\n')

    const options: Options = {
      distFilePath: ".env.dist",
      localFilePath: ".env",
      prompts: false,
      newlineType: NewlineType.unix,
    };
    await merge(options)

    expect(fs.existsSync.mock.calls).toEqual([[".env.dist"], [".env"]]);
    expect(fs.readFileSync.mock.calls).toEqual([
      [".env.dist", { encoding: "utf8" }],
    ]);
    expect(analyzeEnvSourceCode.mock.calls).toEqual([[`lorem=""`]])
    const localTokens: Token[] = []
    expect(parseEnvTokens.mock.calls).toEqual([[distTokens], [localTokens]])
    const mergedAst: DocumentNode = {
      type: NodeType.document,
      statements: [
        {
          type: NodeType.variableDeclaration,
          identifier: {
            type: NodeType.identifier,
            name: "lorem",
          },
        },
        {
          type: NodeType.newline,
        },
      ],
    }
    expect(render.mock.calls).toEqual([[mergedAst, options]])
    expect(fs.writeFileSync.mock.calls).toEqual([['.env', 'lorem=\n', { encoding: 'utf8' }]])
  })

  test('that empty quoted values from .env.dist are added to .env', async () => {
    fs.existsSync.mockReturnValueOnce(true);
    const distEnvCode = `singleOnly="some 'single' quotes"
doubleOnly='some "double" quotes'
both="some 'single' and \\"double \\" quotes"`
    fs.readFileSync.mockReturnValueOnce(distEnvCode);
    const distTokens: Token[] = [
      {
        type: TokenType.identifier,
        position: 0,
        line: 1,
        column: 1,
        length: 10,
        value: "singleOnly",
      },
      {
        type: TokenType.operator,
        position: 10,
        line: 1,
        column: 11,
        length: 1,
        value: "=",
      },
      {
        type: TokenType.quote,
        position: 11,
        line: 1,
        column: 12,
        length: 1,
        value: "\"",
      },
      {
        type: TokenType.literal,
        position: 12,
        line: 1,
        column: 13,
        length: 20,
        value: "some 'single' quotes",
      },
      {
        type: TokenType.quote,
        position: 32,
        line: 1,
        column: 33,
        length: 1,
        value: "\"",
      },
      {
        type: TokenType.newline,
        position: 33,
        line: 1,
        column: 34,
        length: 1,
        value: "\n",
      },
      {
        type: TokenType.identifier,
        position: 34,
        line: 2,
        column: 1,
        length: 10,
        value: "doubleOnly",
      },
      {
        type: TokenType.operator,
        position: 44,
        line: 2,
        column: 11,
        length: 1,
        value: "=",
      },
      {
        type: TokenType.quote,
        position: 45,
        line: 2,
        column: 12,
        length: 1,
        value: "'",
      },
      {
        type: TokenType.literal,
        position: 46,
        line: 2,
        column: 13,
        length: 20,
        value: "some \"double\" quotes",
      },
      {
        type: TokenType.quote,
        position: 66,
        line: 2,
        column: 33,
        length: 1,
        value: "'",
      },
      {
        type: TokenType.newline,
        position: 67,
        line: 2,
        column: 34,
        length: 1,
        value: "\n",
      },
      {
        type: TokenType.identifier,
        position: 68,
        line: 3,
        column: 1,
        length: 4,
        value: "both",
      },
      {
        type: TokenType.operator,
        position: 72,
        line: 3,
        column: 5,
        length: 1,
        value: "=",
      },
      {
        type: TokenType.quote,
        position: 73,
        line: 3,
        column: 6,
        length: 1,
        value: "\"",
      },
      {
        type: TokenType.literal,
        position: 74,
        line: 3,
        column: 7,
        length: 36,
        value: "some 'single' and \\\"double \\\" quotes",
      },
      {
        type: TokenType.quote,
        position: 110,
        line: 3,
        column: 43,
        length: 1,
        value: "\"",
      },
    ];
    analyzeEnvSourceCode.mockReturnValueOnce(distTokens);
    const distDocument: ParsedEnvDocument = {
      variablesByName: {
        singleOnly: {
          type: NodeType.variableDeclaration,
          identifier: {
            type: NodeType.identifier,
            name: "singleOnly",
          },
          value: {
            type: NodeType.quotedLiteral,
            quoteType: QuoteType.double,
            content: {
              type: NodeType.literal,
              value: "some 'single' quotes",
            },
          },
        },
        doubleOnly: {
          type: NodeType.variableDeclaration,
          identifier: {
            type: NodeType.identifier,
            name: "doubleOnly",
          },
          value: {
            type: NodeType.quotedLiteral,
            quoteType: QuoteType.single,
            content: {
              type: NodeType.literal,
              value: "some \"double\" quotes",
            },
          },
        },
        both: {
          type: NodeType.variableDeclaration,
          identifier: {
            type: NodeType.identifier,
            name: "both",
          },
          value: {
            type: NodeType.quotedLiteral,
            quoteType: QuoteType.double,
            content: {
              type: NodeType.literal,
              value: "some 'single' and \\\"double \\\" quotes",
            },
          },
        },
      },
      abstractSyntaxTree: {
        type: NodeType.document,
        statements: [
          {
            type: NodeType.variableDeclaration,
            identifier: {
              type: NodeType.identifier,
              name: "singleOnly",
            },
            value: {
              type: NodeType.quotedLiteral,
              quoteType: QuoteType.double,
              content: {
                type: NodeType.literal,
                value: "some 'single' quotes",
              },
            },
          },
          {
            type: NodeType.newline,
          },
          {
            type: NodeType.variableDeclaration,
            identifier: {
              type: NodeType.identifier,
              name: "doubleOnly",
            },
            value: {
              type: NodeType.quotedLiteral,
              quoteType: QuoteType.single,
              content: {
                type: NodeType.literal,
                value: "some \"double\" quotes",
              },
            },
          },
          {
            type: NodeType.newline,
          },
          {
            type: NodeType.variableDeclaration,
            identifier: {
              type: NodeType.identifier,
              name: "both",
            },
            value: {
              type: NodeType.quotedLiteral,
              quoteType: QuoteType.double,
              content: {
                type: NodeType.literal,
                value: "some 'single' and \\\"double \\\" quotes",
              },
            },
          },
        ],
      },
    }
    parseEnvTokens.mockReturnValueOnce(distDocument);
    fs.existsSync.mockReturnValueOnce(false);
    const localDocument: ParsedEnvDocument = {
      variablesByName: {},
      abstractSyntaxTree: {
        type: NodeType.document,
        statements: [],
      },
    };
    parseEnvTokens.mockReturnValueOnce(localDocument);
    const mergedEnvCode = `singleOnly="some 'single' quotes"
doubleOnly="some \"double\" quotes"
both="some 'single' and \\"double \\" quotes"
`
    render.mockReturnValueOnce(mergedEnvCode)

    const options: Options = {
      distFilePath: ".env.dist",
      localFilePath: ".env",
      prompts: false,
      newlineType: NewlineType.unix,
    };
    await merge(options)

    expect(fs.existsSync.mock.calls).toEqual([[".env.dist"], [".env"]]);
    expect(fs.readFileSync.mock.calls).toEqual([
      [".env.dist", { encoding: "utf8" }],
    ]);
    expect(analyzeEnvSourceCode.mock.calls).toEqual([[ distEnvCode ]])
    const localTokens: Token[] = []
    expect(parseEnvTokens.mock.calls).toEqual([[distTokens], [localTokens]])
    const mergedAst: DocumentNode = {
      type: NodeType.document,
      statements: [
        {
          type: NodeType.variableDeclaration,
          identifier: {
            type: NodeType.identifier,
            name: "singleOnly",
          },
          value: {
            type: NodeType.quotedLiteral,
            quoteType: QuoteType.double,
            content: {
              type: NodeType.literal,
              value: "some 'single' quotes",
            },
          },
        },
        {
          type: NodeType.newline,
        },
        {
          type: NodeType.variableDeclaration,
          identifier: {
            type: NodeType.identifier,
            name: "doubleOnly",
          },
          value: {
            type: NodeType.quotedLiteral,
            quoteType: QuoteType.single,

            content: {
              type: NodeType.literal,
              value: "some \"double\" quotes",
            },
          },
        },
        {
          type: NodeType.newline,
        },
        {
          type: NodeType.variableDeclaration,
          identifier: {
            type: NodeType.identifier,
            name: "both",
          },
          value: {
            type: NodeType.quotedLiteral,
            quoteType: QuoteType.double,
            content: {
              type: NodeType.literal,
              value: "some 'single' and \\\\\"double \\\\\" quotes",
            },
          },
        },
        {
          type: NodeType.newline,
        },
      ],
    }
    expect(render.mock.calls).toEqual([[ mergedAst, options ]])
    expect(fs.writeFileSync.mock.calls).toEqual([['.env', mergedEnvCode, { encoding: 'utf8' }]])
  })
});
