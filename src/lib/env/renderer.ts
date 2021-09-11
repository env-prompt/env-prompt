import {
  DocumentNode,
  StatementNode,
  NodeType,
  VariableDeclarationNode,
  LiteralNode,
  RawLiteralNode,
  QuotedLiteralNode,
  CommentNode,
  QuoteType,
} from "./parser";
import { NewlineType, Options } from "../options";

export type Render = typeof render
export const render = (abstractSyntaxTree: DocumentNode, options: Options): string =>
  abstractSyntaxTree.statements.map(node => renderStatement(node, options)).join("");

const renderStatement = (node: StatementNode, options: Options) => {
  const isVariableDeclaration = node.type === NodeType.variableDeclaration;
  if (isVariableDeclaration)
    return renderVariableDeclaration(node as VariableDeclarationNode);

  const isNewline = node.type === NodeType.newline;
  if (isNewline) return renderNewline(options);

  return renderComment(node as CommentNode);
};

const renderVariableDeclaration = ({
  identifier,
  value,
}: VariableDeclarationNode): string =>
  `${identifier.name}=${renderLiteral(value)}`;

const renderNewline = ({ newlineType }: Options) => newlineType === NewlineType.windows ? '\r\n' : '\n'

const renderLiteral = (literal?: LiteralNode): string => {
  const isEmpty = !literal;
  if (isEmpty) return "";

  const isRawLiteral = literal.type === NodeType.literal;
  if (isRawLiteral) {
    const { value } = (literal as RawLiteralNode)
    const hasEscapeChars = /\\./.test(value)
    if (hasEscapeChars) return renderEscapedRawLiteral(literal as RawLiteralNode)

    return value
  }

  return renderQuotedLiteral(literal as QuotedLiteralNode);
};

const renderEscapedRawLiteral = (escapedRawLiteral: RawLiteralNode): string => {
  const quotedLiteral: QuotedLiteralNode = {
    type: NodeType.quotedLiteral,
    quoteType: QuoteType.double,
    content: escapedRawLiteral as RawLiteralNode
  }
  return renderQuotedLiteral(quotedLiteral as QuotedLiteralNode);
}

const renderQuotedLiteral = ({
  quoteType,
  content,
}: QuotedLiteralNode): string => {
    const isEmpty = !content
    const value = isEmpty ? '' : content.value
    const escapedValue = escapeQuotes(quoteType, value)

    return `${quoteType}${escapedValue}${quoteType}`;
}

const escapeQuotes = (quoteType: QuoteType, content: string): string => {
  const isDoubleQuotes = quoteType === QuoteType.double
  if (isDoubleQuotes) return content.replace(/"/g, '\\"')

  return content.replace(/'/g, "\\'")
}

const renderComment = ({ body }: CommentNode): string =>
  `#${!!body ? body : ""}`;
