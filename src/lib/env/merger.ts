import { CliPrompterInterface } from "lib/cli";
import { Token, AnalyzeEnvSourceCode } from "lib/env/lexer";
import {
  ParsedEnvDocument,
  ParseEnvTokens,
  VariableDeclarationNode,
  RawLiteralNode,
  QuotedLiteralNode,
  NodeType,
  IdentifierNode,
  QuoteType,
  NewlineNode,
} from "lib/env/parser";
import { Render } from "lib/env/renderer";
import fs from "fs";
import path from "path";
import { Options } from "lib/options";
import { FileError, FileNotFoundError, LexicalError } from "./error";

export type NodeFs = Pick<typeof fs, "existsSync" | "readFileSync" | "writeFileSync">;
export type NodePath = Pick<typeof path, "resolve">

const ENCODING = "utf8";

export interface MergerInterface {
  merge: (options: Options) => void
}

export class Merger implements MergerInterface {
  private cliPrompter: CliPrompterInterface

  private analyzeEnvSourceCode: AnalyzeEnvSourceCode

  private parseEnvTokens: ParseEnvTokens

  private render: Render

  private fs: NodeFs

  private path: NodePath

  public setCliPrompter(cliPrompter: CliPrompterInterface): this {
    this.cliPrompter = cliPrompter
    return this
  }

  public setAnalyzeEnvSourceCode(analyzeEnvSourceCode: AnalyzeEnvSourceCode): this {
    this.analyzeEnvSourceCode = analyzeEnvSourceCode
    return this
  }

  public setParseEnvTokens(parseEnvTokens: ParseEnvTokens): this {
    this.parseEnvTokens = parseEnvTokens
    return this
  }

  public setRender(render: Render): this {
    this.render = render
    return this
  }

  public setFs(fs: NodeFs): this {
    this.fs = fs
    return this
  }

  public setPath(path: NodePath): this {
    this.path = path
    return this
  }
  
  public async merge (options: Options) {
    const distDocument = this.parseDistDocument(options);
    const localDocument = this.parseLocalDocument(options);
    const mergedDocument = await this.mergeDocuments(distDocument, localDocument, options);

    this.writeLocalEnvFile(options, mergedDocument);
  }

  private analyzeDistEnvFile (path: string): Token[] {
    const exists = this.fs.existsSync(path);
    if (!exists) throw new FileNotFoundError().setFilePath(path);

    const src = this.fs.readFileSync(path, { encoding: ENCODING }).toString();
    return this.analyzeEnvSourceCode(path, src);
  }

  private analyzeLocalEnvFile (path: string): Token[] {
    const exists = this.fs.existsSync(path);
    if (!exists) return [];

    const src = this.fs.readFileSync(path, { encoding: ENCODING }).toString();
    return this.analyzeEnvSourceCode(path, src);
  }

  private writeLocalEnvFile (
    options: Options,
    document: ParsedEnvDocument
  ) {
    const fileContent = this.render(document.abstractSyntaxTree, options);
    // TODO use resolved absolute path here
    this.fs.writeFileSync(options.localFilePath, fileContent, { encoding: ENCODING });
  }

  private async mergeDocuments (
    distributedDocument: ParsedEnvDocument,
    localDocument: ParsedEnvDocument,
    options: Options
  ): Promise<ParsedEnvDocument> {
    const newLocalDocument: ParsedEnvDocument = { ...localDocument };

    let hasBeenPrompted = false;

    const variableNames = Object.keys(distributedDocument.variablesByName);
    for (const name of variableNames) {
      const existsLocally = name in localDocument.variablesByName;
      if (existsLocally) continue;

      if (!hasBeenPrompted && options.prompts) {
        this.cliPrompter.promptUserAboutNewVariables();
        hasBeenPrompted = true;
      }

      const distributedVariable = distributedDocument.variablesByName[name];
      const defaultValue = getValueFromVariable(distributedVariable);

      let value = defaultValue
      if (options.prompts) {
        const userInputEnvironmentVariable = await this.cliPrompter.promptUserForEnvironmentVariable({
          name,
          value: defaultValue,
        });
        value = userInputEnvironmentVariable.value
      }
      
      const variable = createVariableDeclaration(name, value);
      addVariableToDocument(variable, newLocalDocument);
    }

    return newLocalDocument;
  }

  private parseDistDocument (options: Options): ParsedEnvDocument {
    const path = this.path.resolve(options.distFilePath)
    const tokens = this.analyzeDistEnvFile(path);
    return this.parseEnvTokens(path, tokens, options);
  }

  private parseLocalDocument (options: Options): ParsedEnvDocument {
    const path = this.path.resolve(options.localFilePath)
    const tokens = this.analyzeLocalEnvFile(path);
    return this.parseEnvTokens(path, tokens, options);
  }
}

const addVariableToDocument = (
  variable: VariableDeclarationNode,
  document: ParsedEnvDocument
) => {
  document.abstractSyntaxTree.statements.push(variable);

  const newline: NewlineNode = { type: NodeType.newline };
  document.abstractSyntaxTree.statements.push(newline);

  const { name } = variable.identifier;
  document.variablesByName[name] = variable;
};

const getValueFromVariable = (variable: VariableDeclarationNode): string => {
  const hasValue = !!variable.value;
  if (!hasValue) return "";

  const hasRawLiteral = variable.value.type === NodeType.literal;
  if (hasRawLiteral) {
    const rawLiteral = variable.value as RawLiteralNode;
    return rawLiteral.value;
  }

  const quotedLiteral = variable.value as QuotedLiteralNode;
  const hasContent = !!quotedLiteral.content;
  if (!hasContent) return "";

  return quotedLiteral.content.value;
};

const createVariableDeclaration = (
  name: string,
  value: string
): VariableDeclarationNode => {
  const identifier: IdentifierNode = { type: NodeType.identifier, name };
  const isEmpty = !value;
  if (isEmpty) return { type: NodeType.variableDeclaration, identifier };

  const hasSingleQuotes = value.indexOf("'") > -1;
  const hasDoubleQuotes = value.indexOf('"') > -1;
  const isQuoted = hasSingleQuotes || hasDoubleQuotes;
  if (isQuoted) {
    const hasSingleAndDoubleQuotes = hasSingleQuotes && hasDoubleQuotes;
    const quoteType =
      hasSingleAndDoubleQuotes || hasSingleQuotes
        ? QuoteType.double
        : QuoteType.single;
    const valueWithEscapedDoubleQuotes = value.replace(/"/g, '\\"');

    const rawLiteral: RawLiteralNode = {
      type: NodeType.literal,
      value: hasSingleAndDoubleQuotes ? valueWithEscapedDoubleQuotes : value,
    };

    const quotedLiteral: QuotedLiteralNode = {
      type: NodeType.quotedLiteral,
      quoteType,
      content: rawLiteral,
    };
    return {
      type: NodeType.variableDeclaration,
      identifier,
      value: quotedLiteral,
    };
  }

  const rawLiteral: RawLiteralNode = { type: NodeType.literal, value };
  return { type: NodeType.variableDeclaration, identifier, value: rawLiteral };
};
