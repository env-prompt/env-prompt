export enum TokenType {
    identifier = 'identifier',
    operator = 'operator',
    literal = 'literal',
    quote = 'quote',
    newline = 'newline',
    whitespace = 'whitespace',
    comment = 'comment',
    commentBody = 'commentBody'
}

export interface Token {
    type: TokenType
    position: number
    line: number
    column: number
    length: number
    value: string
}

const QUOTE_EXPRESSION = /^["']$/
const OPERATOR_EXPRESSION = /^=$/
const COMMENT_EXPRESSION = /^#$/
const IDENTIFIER_START_EXPRESSION = /^[a-zA-Z]$/
const IDENTIFIER_END_EXPRESSION = /^[^a-zA-Z0-9_-]$/

export const analyzeEnvSourceCode = (src: string): Token[] => {
    const tokens: Token[] = []
    for (let i = 0; i < src.length;) {
        const token = getTokenAtPosition(src, i, tokens)
        tokens.push(token)
        i += token.length
    }
    return tokens
}

const getTokenAtPosition = (src: string, position: number, tokens: Token[]): Token => {
    const firstChar = src[position]

    const isQuotedLiteral = isLastTokenOpeningQuote(tokens)
    const isDoubleQuotedLiteral = isQuotedLiteral && tokens[tokens.length - 1].value === '"'

    if (!isDoubleQuotedLiteral) {
        const isNewline = firstChar === '\n'
        if (isNewline) return makeNewlineToken(position, src, tokens)
    }

    if (!isQuotedLiteral) {
        const isComment = COMMENT_EXPRESSION.test(firstChar)
        if (isComment) return makeCommentToken(position, src, tokens)

        const isCommentBody = isLastTokenComment(tokens)
        if (isCommentBody) return makeCommentBodyToken(position, src, tokens)

        const isWhiteSpace = /^\s$/.test(firstChar)
        if (isWhiteSpace) return makeWhiteSpaceToken(position, src, tokens)

        const isQuote = QUOTE_EXPRESSION.test(firstChar)
        if (isQuote) return makeQuoteToken(position, src, tokens)

        const isOperator = OPERATOR_EXPRESSION.test(firstChar)
        if (isOperator) return makeOperatorToken(position, src, tokens)
    }

    const isLiteral = hasAssignmentOperatorOnCurrentLine(tokens)
    if (isLiteral) return makeLiteralToken(position, src, tokens)

    const isIdentifier = IDENTIFIER_START_EXPRESSION.test(firstChar)
    if (isIdentifier) return makeIdentifierToken(position, src, tokens)

    throw new Error('Unrecognized token.')
}

export const getLine = (tokens: Token[]): number => {
    const isFirstToken = tokens.length === 0
    if (isFirstToken) return 1

    const { type, line } = tokens[tokens.length - 1]
    const isNewLine = type === TokenType.newline
    if (isNewLine) return line + 1
    else return line
}

export const getColumn = (tokens: Token[]): number => {
    const isFirstToken = tokens.length === 0
    if (isFirstToken) return 1

    const { type, column, length } = tokens[tokens.length - 1]
    const isNewLine = type === TokenType.newline
    if (isNewLine) return 1
    else return column + length
}

const makeNewlineToken = (position: number, src: string, tokens: Token[]): Token => ({
    type: TokenType.newline,
    position,
    line: getLine(tokens),
    column: getColumn(tokens),
    length: 1,
    value: src[position]
})

const makeCommentToken = (position: number, src: string, tokens: Token[]): Token => ({
    type: TokenType.comment,
    position,
    line: getLine(tokens),
    column: getColumn(tokens),
    length: 1,
    value: src[position]
})

const makeCommentBodyToken = (position: number, src: string, tokens: Token[]): Token => {
    let i = position
    let value = src[i++]
    for (; i < src.length; i++) {
        const char = src[i]
        const isNewline = char === '\n'
        if (isNewline) {
            break
        }

        value = `${value}${char}`
    }
    return {
        type: TokenType.commentBody,
        position,
        line: getLine(tokens),
        column: getColumn(tokens),
        length: value.length,
        value
    }
}

const makeWhiteSpaceToken = (position: number, src: string, tokens: Token[]): Token => ({
    type: TokenType.whitespace,
    position,
    line: getLine(tokens),
    column: getColumn(tokens),
    length: 1,
    value: src[position]
})

const makeQuoteToken = (position: number, src: string, tokens: Token[]): Token => ({
    type: TokenType.quote,
    position,
    line: getLine(tokens),
    column: getColumn(tokens),
    length: 1,
    value: src[position]
})

const makeOperatorToken = (position: number, src: string, tokens: Token[]): Token => ({
    type: TokenType.operator,
    position,
    line: getLine(tokens),
    column: getColumn(tokens),
    length: 1,
    value: src[position]
})

const makeLiteralToken = (position: number, src: string, tokens: Token[]): Token => {
    let i = position
    let value = src[i++]
    const previousToken = getLastNonWhiteSpaceToken(tokens)
    const isQuotedValue = previousToken.type === TokenType.quote
    for (; i < src.length; i++) {
        const char = src[i]
        const isClosingQuote = char === previousToken.value
        const isNewline = char === '\n'
        const isComment = char === '#'

        if (isQuotedValue && isClosingQuote) break
        if (isNewline && !isQuotedValue) break
        if (isComment && !isQuotedValue) break

        value = `${value}${char}`
    }

    const [ trailingWhitespace ] = /(\s*)$/.exec(value)
    const length = isQuotedValue ? value.length : value.length - trailingWhitespace.length
    
    if (!isQuotedValue) {
        value = value.substr(0, length)
    }

    return {
        type: TokenType.literal,
        position,
        line: getLine(tokens),
        column: getColumn(tokens),
        length,
        value
    }
}

const makeIdentifierToken = (position: number, src: string, tokens: Token[]): Token => {
    let i = position
    let value = src[i++]
    for (; i < src.length; i++) {
        const char = src[i]
        const isEndOfIdentifier = IDENTIFIER_END_EXPRESSION.test(char)
        if (isEndOfIdentifier) {
            break
        }

        value = `${value}${char}`
    }

    return {
        type: TokenType.identifier,
        position,
        line: getLine(tokens),
        column: getColumn(tokens),
        length: value.length,
        value
    }
}

const getLastNonWhiteSpaceToken = (previousTokens: Token[]): Token | null => {
    for (let i = previousTokens.length - 1; i >= 0; i--) {
        const token = previousTokens[i]
        const isWhiteSpace = token.type === TokenType.whitespace
        if (!isWhiteSpace) {
            return token
        }
    }
    return null
}

const hasAssignmentOperatorOnCurrentLine = (previousTokens: Token[]): boolean => {
    for (let i = previousTokens.length - 1; i >= 0; i--) {
        const { type, value } = previousTokens[i]

        const isAssignmentOperator = type === TokenType.operator && value === '='
        if (isAssignmentOperator) {
            return true
        }

        const isNewline = type === TokenType.newline
        if (isNewline) {
            return false
        }
    }

    return false
}

const isLastTokenComment = (previousTokens: Token[]): boolean =>
    previousTokens.length > 0 && previousTokens[previousTokens.length - 1].type === TokenType.comment

const isLastTokenOpeningQuote = (previousTokens: Token[]): boolean => {
    const isLastTokenQuote =
        previousTokens.length > 0 && previousTokens[previousTokens.length - 1].type === TokenType.quote
    const isSecondToLastTokenLiteral =
        previousTokens.length > 1 && previousTokens[previousTokens.length - 2].type === TokenType.literal
    return isLastTokenQuote && !isSecondToLastTokenLiteral
}
