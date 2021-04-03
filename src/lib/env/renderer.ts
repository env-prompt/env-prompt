import {
  DocumentNode,
  StatementNode,
  NodeType,
  VariableDeclarationNode,
  IdentifierNode,
  LiteralNode,
  RawLiteralNode,
  QuotedLiteralNode,
  CommentNode,
} from "lib/env/parser";

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
  `${renderIdentifier(identifier)}=${renderLiteral(value)}`;

const renderIdentifier = ({ name }: IdentifierNode): string => name;

const renderLiteral = (literal?: LiteralNode): string => {
  const isEmpty = !literal;
  if (isEmpty) return "";

  const isRawLiteral = literal.type === NodeType.literal;
  if (isRawLiteral) return renderRawLiteral(literal as RawLiteralNode);

  return renderQuotedLiteral(literal as QuotedLiteralNode);
};

const renderRawLiteral = ({ value }: RawLiteralNode): string => value;

const renderQuotedLiteral = ({
  quoteType,
  content,
}: QuotedLiteralNode): string =>
  `${quoteType}${renderRawLiteral(content)}${quoteType}`;

const renderComment = ({ body }: CommentNode): string =>
  `#${!!body ? body : ""}`;
