import {
  DocumentNode,
  NodeType,
  QuoteType,
} from "../../../../src/lib/env/parser";
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
    const document = render(abstractSyntaxTree);
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
    const document = render(abstractSyntaxTree);
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
    const document = render(abstractSyntaxTree);
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
    const document = render(abstractSyntaxTree);
    expect(document).toEqual("theseAre='single quotes'");
  });

  test("that comments with bodies can be rendered", () => {
    const abstractSyntaxTree: DocumentNode = {
      type: NodeType.document,
      statements: [{ type: NodeType.comment, body: " this is a comment" }],
    };
    const document = render(abstractSyntaxTree);
    expect(document).toEqual("# this is a comment");
  });

  test("that comments with no body can be rendered", () => {
    const abstractSyntaxTree: DocumentNode = {
      type: NodeType.document,
      statements: [{ type: NodeType.comment, body: null }],
    };
    const document = render(abstractSyntaxTree);
    expect(document).toEqual("#");
  });

  test("that empty syntax trees render nothing", () => {
    const abstractSyntaxTree: DocumentNode = {
      type: NodeType.document,
      statements: [],
    };
    const document = render(abstractSyntaxTree);
    expect(document).toEqual("");
  });

  test("that newlines can be rendered", () => {
    const abstractSyntaxTree: DocumentNode = {
      type: NodeType.document,
      statements: [{type: NodeType.newline}],
    };
    const document = render(abstractSyntaxTree);
    expect(document).toEqual("\n");
  });

  test("that empty syntax trees render nothing", () => {
    const abstractSyntaxTree: DocumentNode = {
      type: NodeType.document,
      statements: [],
    };
    const document = render(abstractSyntaxTree);
    expect(document).toEqual("");
  });
});