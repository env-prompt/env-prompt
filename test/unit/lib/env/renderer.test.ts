import {
  DocumentNode,
  NodeType,
  QuoteType,
} from "../../../../src/lib/env/parser";
import { Options, NewlineType } from "../../../../src/lib/options";
import { render } from "../../../../src/lib/env/renderer";

describe(".env renderer", () => {
  test("that variable declarations without a body can be rendered", () => {
    const abstractSyntaxTree: DocumentNode = {
      type: NodeType.document,
      statements: [
        {
          type: NodeType.variableDeclaration,
          identifier: { type: NodeType.identifier, name: "EMPTY" },
        },
      ],
    };
    const options: Partial<Options> = { newlineType: NewlineType.unix };
    const document = render(abstractSyntaxTree, options as Options);
    expect(document).toEqual("EMPTY=");
  });

  test("that variable declarations with unquoted bodies can be rendered", () => {
    const abstractSyntaxTree: DocumentNode = {
      type: NodeType.document,
      statements: [
        {
          type: NodeType.variableDeclaration,
          identifier: { type: NodeType.identifier, name: "RAW" },
          value: { type: NodeType.literal, value: "value" },
        },
      ],
    };
    const options: Partial<Options> = { newlineType: NewlineType.unix };
    const document = render(abstractSyntaxTree, options as Options);
    expect(document).toEqual("RAW=value");
  });

  test("that variable declarations with double-quoted bodies can be rendered", () => {
    const abstractSyntaxTree: DocumentNode = {
      type: NodeType.document,
      statements: [
        {
          type: NodeType.variableDeclaration,
          identifier: { type: NodeType.identifier, name: "GIMME" },
          value: {
            type: NodeType.quotedLiteral,
            quoteType: QuoteType.double,
            content: { type: NodeType.identifier, value: "double quotes" },
          },
        },
      ],
    };
    const options: Partial<Options> = { newlineType: NewlineType.unix };
    const document = render(abstractSyntaxTree, options as Options);
    expect(document).toEqual('GIMME="double quotes"');
  });

  test("that variable declarations with single-quoted bodies can be rendered", () => {
    const abstractSyntaxTree: DocumentNode = {
      type: NodeType.document,
      statements: [
        {
          type: NodeType.variableDeclaration,
          identifier: { type: NodeType.identifier, name: "theseAre" },
          value: {
            type: NodeType.quotedLiteral,
            quoteType: QuoteType.single,
            content: { type: NodeType.identifier, value: "single quotes" },
          },
        },
      ],
    };
    const options: Partial<Options> = { newlineType: NewlineType.unix };
    const document = render(abstractSyntaxTree, options as Options);
    expect(document).toEqual("theseAre='single quotes'");
  });

  test("that comments with bodies can be rendered", () => {
    const abstractSyntaxTree: DocumentNode = {
      type: NodeType.document,
      statements: [{ type: NodeType.comment, body: " this is a comment" }],
    };
    const options: Partial<Options> = { newlineType: NewlineType.unix };
    const document = render(abstractSyntaxTree, options as Options);
    expect(document).toEqual("# this is a comment");
  });

  test("that comments with no body can be rendered", () => {
    const abstractSyntaxTree: DocumentNode = {
      type: NodeType.document,
      statements: [{ type: NodeType.comment, body: null }],
    };
    const options: Partial<Options> = { newlineType: NewlineType.unix };
    const document = render(abstractSyntaxTree, options as Options);
    expect(document).toEqual("#");
  });

  test("that empty syntax trees render nothing", () => {
    const abstractSyntaxTree: DocumentNode = {
      type: NodeType.document,
      statements: [],
    };
    const options: Partial<Options> = { newlineType: NewlineType.unix };
    const document = render(abstractSyntaxTree, options as Options);
    expect(document).toEqual("");
  });

  test("that newlines can be rendered", () => {
    const abstractSyntaxTree: DocumentNode = {
      type: NodeType.document,
      statements: [{type: NodeType.newline}],
    };
    const options: Partial<Options> = { newlineType: NewlineType.unix };
    const document = render(abstractSyntaxTree, options as Options);
    expect(document).toEqual("\n");
  });

  test("that windows newlines can be rendered", () => {
    const abstractSyntaxTree: DocumentNode = {
      type: NodeType.document,
      statements: [{type: NodeType.newline}],
    };
    const options: Partial<Options> = { newlineType: NewlineType.windows };
    const document = render(abstractSyntaxTree, options as Options);
    expect(document).toEqual("\r\n");
  });

  test("that empty syntax trees render nothing", () => {
    const abstractSyntaxTree: DocumentNode = {
      type: NodeType.document,
      statements: [],
    };
    const options: Partial<Options> = { newlineType: NewlineType.unix };
    const document = render(abstractSyntaxTree, options as Options);
    expect(document).toEqual("");
  });

  test("that escaped double quotes are properly rendered", () => {
    const abstractSyntaxTree: DocumentNode = {
      type: NodeType.document,
      statements: [
        {
          type: NodeType.variableDeclaration,
          identifier: { type: NodeType.identifier, name: "nestedSingle" },
          value: {
            type: NodeType.quotedLiteral,
            quoteType: QuoteType.single,
            content: { type: NodeType.identifier, value: "some 'nested' single quotes" },
          },
        },
        {
          type: NodeType.newline,
        },
        {
          type: NodeType.variableDeclaration,
          identifier: { type: NodeType.identifier, name: "nestedDouble" },
          value: {
            type: NodeType.quotedLiteral,
            quoteType: QuoteType.double,
            content: { type: NodeType.identifier, value: `some "nested" double quotes` },
          },
        },
      ],
    };
    const options: Partial<Options> = { newlineType: NewlineType.unix };
    const document = render(abstractSyntaxTree, options as Options);
    expect(document).toEqual(
`nestedSingle='some \\'nested\\' single quotes'
nestedDouble="some \\"nested\\" double quotes"`);
  });
});
