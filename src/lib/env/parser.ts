import { Token, TokenType } from "lib/env/lexer"

enum NodeType {
    literal = 'literal',
    quotedLiteral = 'quotedLiteral',
    identifier = 'identifier',
    variableDeclaration = 'variableDeclaration',
    comment = 'comment',
    newline = 'newline',
    document = 'document'
}

enum QuoteType {
    single = '\'',
    double = '"'
}

interface Node {
    type: NodeType
}

interface RawLiteralNode extends Node {
    value: string
}

interface QuotedLiteralNode extends Node {
    quoteType: QuoteType
    content: RawLiteralNode|null
}

type LiteralNode = RawLiteralNode | QuotedLiteralNode

interface IdentifierNode extends Node {
    name: string
}

interface VariableDeclarationNode extends Node {
    identifier: IdentifierNode
    values: LiteralNode[]
}

interface CommentNode extends Node {
    body: string|null
}

interface NewlineNode extends Node {}

type StatementNode = NewlineNode | CommentNode | VariableDeclarationNode

interface DocumentNode extends Node {
    statements: StatementNode[]
}

type VariablesByName = Record<IdentifierNode['name'], VariableDeclarationNode>

interface ParsedEnvDocument {
    variablesByName: VariablesByName
    abstractSyntaxTree: DocumentNode
}

export const parseEnvTokens = (tokens: Token[]): ParsedEnvDocument => {
    const document: DocumentNode = {
        type: NodeType.document,
        statements: []
    }
    const variablesByName: VariablesByName = {}

    for (let i = 0; i < tokens.length;) {
        const firstToken = tokens[i++]

        const isWhiteSpace = firstToken.type === TokenType.whitespace
        if (isWhiteSpace) continue

        const isNewline = firstToken.type === TokenType.newline
        if (isNewline) {
            const newline: NewlineNode = {
                type: NodeType.newline
            }
            document.statements.push(newline)
            continue
        }

        const isComment = firstToken.type === TokenType.comment
        if (isComment) {
            const secondToken = tokens[i++]
            const isLastToken = i === tokens.length - 1
            const isNewline = secondToken.type === TokenType.newline

            const isCommentWithoutBody = isLastToken || isNewline
            if (isCommentWithoutBody) {
                if (isNewline) i--

                const comment: CommentNode = {
                    type: NodeType.comment,
                    body: null
                }
                document.statements.push(comment)
                continue
            }

            const isCommentWithBody = secondToken.type === TokenType.commentBody
            if (isCommentWithBody) {
                const comment: CommentNode = {
                    type: NodeType.comment,
                    body: secondToken.value
                }
                document.statements.push(comment)

                const thirdToken = tokens[i]
                const isCorrectlyTerminated = thirdToken && thirdToken.type === TokenType.newline
                if (isCorrectlyTerminated) continue
            }
            
            throw new Error('Expected newline or end of document after comment.')
        }

        const isVariableDeclaration = firstToken.type === TokenType.identifier
        if (isVariableDeclaration) {
            const variableName = firstToken.value

            const secondToken = tokens[i++]
            const hasAssignmentOperator = secondToken && secondToken.type === TokenType.operator && secondToken.value === '='
            if (!hasAssignmentOperator) throw new Error(`Expected = after variable "${variableName}".`)

            const values: LiteralNode[] = []
            for (; i < tokens.length;) {
                const token = tokens[i++]

                const isFirstValue = values.length === 0
                const isWhitespace = token.type === TokenType.whitespace
                const isLiteral = token.type === TokenType.literal
                const isQuote = token.type === TokenType.quote
                const isNewline = token.type === TokenType.newline
                const isComment = token.type === TokenType.comment

                if (isFirstValue && isWhitespace) continue

                if (isQuote) {
                    const previousValue = values[values.length - 1]
                    const isOpeningQuote = isFirstValue || previousValue.type !== NodeType.quotedLiteral
                    const isClosingQuote = !isFirstValue && previousValue.type === NodeType.quotedLiteral
                    
                    if (isOpeningQuote) {
                        const quotedLiteral: QuotedLiteralNode = {
                            type: NodeType.quotedLiteral,
                            quoteType: token.value === '"' ? QuoteType.double : QuoteType.single,
                            content: null
                        }
                        values.push(quotedLiteral)
                        continue
                    }

                    if (isClosingQuote) continue

                    // TODO add line and column
                    throw new Error(`Unexpected ${token.value} at position ${token.position}.`)
                }

                if (isLiteral) {
                    const literal: LiteralNode = {
                        type: NodeType.literal,
                        value: token.value
                    }

                    const previousValue = values[values.length - 1]
                    const isQuotedLiteral = !isFirstValue && previousValue.type === NodeType.quotedLiteral
                    if (isQuotedLiteral) (previousValue as QuotedLiteralNode).content = literal
                    else values.push(literal)
                    continue
                }

                if (isNewline || isComment) {
                    i--
                    break
                }

                throw new Error('Expected line break or comment after variable declaration.')
            }

            const variableDeclaration: VariableDeclarationNode = {
                type: NodeType.variableDeclaration,
                identifier: {
                    type: NodeType.identifier,
                    name: variableName
                },
                values
            }
            // TODO throw error if variable already declared... also add option for it
            variablesByName[variableDeclaration.identifier.name] = variableDeclaration
            document.statements.push(variableDeclaration)
            continue
        }
    }

    return {
        variablesByName,
        abstractSyntaxTree: document
    }
}
