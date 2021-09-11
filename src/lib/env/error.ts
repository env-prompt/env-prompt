import { Token } from "./lexer";
import { NewlineType } from "../options";

export interface FileCoordinates {
    line: number
    column: number
    position: number // TODO get rid of?
}

// Ts-jest doesn't support extending Error, so instead we have to implement it.
// Otherwise, we get this error thrown in our tests when trying to call
//  setters on subclasses of Error: "(intermediate value).setToken is not a function"
//
// This is only an issue with ts-jest, but works fine in the code compiled by esbuild.
export abstract class FileError implements Error {
    public readonly name: string = ''
    
    public readonly message: string = ''

    protected filePath: string

    public setFilePath(filePath: string): this {
        this.filePath = filePath
        return this
    }

    public getFilePath(): string {
        return this.filePath
    }
}

export class FileNotFoundError extends FileError {}

export class LexicalError extends FileError {
    protected char: string

    protected coordinates: FileCoordinates

    public setChar(char: string): this {
        this.char = char
        return this
    }

    public getChar(): string {
        return this.char
    }

    public setCoordinates(coordinates: FileCoordinates): this {
        this.coordinates = coordinates
        return this
    }

    public getCoordinates(): FileCoordinates {
        return this.coordinates
    }
}

export abstract class ParseError extends FileError {
    protected token: Token

    public setToken(token: Token): this {
        this.token = token
        return this
    }

    public getToken(): Token {
        return this.token
    }
}
export class InvalidTokenAfterCommentError extends ParseError {}
export class ExpectedAssignmentAfterIdentifierError extends ParseError {}
export class UnexpectedTokenError extends ParseError {}
export class InvalidTokenAfterIdentifierError extends ParseError {}
export class DuplicateVariableError extends ParseError {}

export class InvalidArgumentError implements Error {
    public readonly name: string = ''

    public readonly message: string = ''

    protected argumentName: string

    public setArgumentName(argumentName: string): this {
        this.argumentName = argumentName
        return this
    }

    public getArgumentName(): string {
        return this.argumentName
    }
}
export class InvalidNewlineTypeError extends InvalidArgumentError {}

export const getMessageForError = (error: Error): string => {
    const fileNotFound = error instanceof FileNotFoundError
    if (fileNotFound) return getMessageForFileNotFoundError(error as FileNotFoundError)

    const isLexicalError = error instanceof LexicalError
    if (isLexicalError) return getMessageForLexicalError(error as LexicalError)

    const isParseError = error instanceof ParseError
    if (isParseError) return getMessageForParseError(error as ParseError)
    
    const isInvalidArgumentError = error instanceof InvalidArgumentError
    if (isInvalidArgumentError) return getMessageForInvalidArgumentError(error as InvalidArgumentError)

    return `ERROR: ${(error).message}`
}

const getMessageForFileNotFoundError = (error: FileNotFoundError): string => {
    const filePath = error.getFilePath()
    return `Could not locate ${filePath}`
}

const getMessageForLexicalError = (error: LexicalError): string => {
    const filePath = error.getFilePath()
    const coordinates = error.getCoordinates()
    const positionDescription = getPositionDescription(filePath, coordinates)
    return `Unrecognized token ${positionDescription}`
}

const getMessageForParseError = (error: ParseError): string => {
    const token = error.getToken()
    const filePath = error.getFilePath()
    const positionDescription = getPositionDescription(filePath, token)

    const invalidTokenAfterComment = error instanceof InvalidTokenAfterCommentError
    if (invalidTokenAfterComment) return `Expected newline or end of document after comment ${positionDescription}`

    const expectedAssignmentAfterIdentifier = error instanceof ExpectedAssignmentAfterIdentifierError
    if (expectedAssignmentAfterIdentifier) return `Expected = after variable "${token.value}" ${positionDescription}`

    const unexpectedToken = error instanceof UnexpectedTokenError
    if (unexpectedToken) return `Unexpected ${token.value} ${positionDescription}`

    const invalidTokenAfterIdentifier = error instanceof InvalidTokenAfterIdentifierError
    if (invalidTokenAfterIdentifier) return `Expected line break or comment after variable declaration ${positionDescription}`

    const duplicateVariable = error instanceof DuplicateVariableError
    if (duplicateVariable) {
        // TODO put this var in other IFs?
        const positionDescription = getPositionDescription(filePath, token)
        return `Duplicate variable declaration "${token.value}" ${positionDescription}`
    }

    return `Unknown parse error ${positionDescription}`
}

const getMessageForInvalidArgumentError = (error: InvalidArgumentError) => {
    const isInvalidNewlineTypeError = error instanceof InvalidNewlineTypeError
    if (isInvalidNewlineTypeError) {
        const validTypes = Object.values(NewlineType)
        return `Invalid newline type. Valid types: "${validTypes.join('", "')}"`
    }
    
    const name = error.getArgumentName()
    return `Invalid argument ${name}`
}

const getPositionDescription = (filePath: string, { line, column }: FileCoordinates): string =>
    `at ${filePath}:${line}:${column}`

