import {
  DocumentNode,
  StatementNode,
  NodeType,
  VariableDeclarationNode,
  LiteralNode,
  RawLiteralNode,
  QuotedLiteralNode,
  CommentNode,
} from "lib/env/parser";

export type Render = typeof render
export const render = (abstractSyntaxTree: DocumentNode): string =>
  abstractSyntaxTree.statements.map(renderStatement).join("");

const renderStatement = (node?: StatementNode) => {
  const isVariableDeclaration = node.type === NodeType.variableDeclaration;
  if (isVariableDeclaration)
    return renderVariableDeclaration(node as VariableDeclarationNode);

  const isNewline = node.type === NodeType.newline;
  if (isNewline) return "\n";

  return renderComment(node as CommentNode);
};

const renderVariableDeclaration = ({
  identifier,
  value,
}: VariableDeclarationNode): string =>
  `${identifier.name}=${renderLiteral(value)}`;

const renderLiteral = (literal?: LiteralNode): string => {
  const isEmpty = !literal;
  if (isEmpty) return "";

  const isRawLiteral = literal.type === NodeType.literal;
  if (isRawLiteral) return (literal as RawLiteralNode).value

  return renderQuotedLiteral(literal as QuotedLiteralNode);
};

const renderQuotedLiteral = ({
  quoteType,
  content,
}: QuotedLiteralNode): string => {
    const isEmpty = !content
    const value = isEmpty ? '' : content.value

    return `${quoteType}${value}${quoteType}`;
}

const renderComment = ({ body }: CommentNode): string =>
  `#${!!body ? body : ""}`;