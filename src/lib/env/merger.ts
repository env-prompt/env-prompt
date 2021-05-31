import { CliPrompter } from "lib/cli";
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
import { Options } from "lib/options";

export type NodeFs = Pick<typeof fs, "existsSync" | "readFileSync" | "writeFileSync">;

export type Merge = ReturnType<typeof makeMerge>;
export const makeMerge = (
  cliPrompter: CliPrompter,
  analyzeEnvSourceCode: AnalyzeEnvSourceCode,
  parseEnvTokens: ParseEnvTokens,
  render: Render,
  fs: NodeFs
) => {
  const ENCODING = "utf8";

  const merge = async (options: Options) => {
    const distDocument = parseDistDocument(options);
    const localDocument = parseLocalDocument(options);
    const mergedDocument = await mergeDocuments(distDocument, localDocument, options);

    writeLocalEnvFile(options, mergedDocument);
  };

  const analyzeDistEnvFile = ({ distFilePath: path }: Options): Token[] => {
    const exists = fs.existsSync(path);
    if (!exists) throw new Error(`Could not locate ${path}`);

    const src = fs.readFileSync(path, { encoding: ENCODING }).toString();
    return analyzeEnvSourceCode(src);
  };

  const analyzeLocalEnvFile = ({ localFilePath: path }: Options): Token[] => {
    const exists = fs.existsSync(path);
    if (!exists) return [];

    const src = fs.readFileSync(path, { encoding: ENCODING }).toString();
    return analyzeEnvSourceCode(src);
  };

  const writeLocalEnvFile = (
    options: Options,
    document: ParsedEnvDocument
  ) => {
    const fileContent = render(document.abstractSyntaxTree, options);
    fs.writeFileSync(options.localFilePath, fileContent, { encoding: ENCODING });
  };

  const mergeDocuments = async (
    distributedDocument: ParsedEnvDocument,
    localDocument: ParsedEnvDocument,
    options: Options
  ): Promise<ParsedEnvDocument> => {
    const newLocalDocument: ParsedEnvDocument = { ...localDocument };

    let hasBeenPrompted = false;

    const variableNames = Object.keys(distributedDocument.variablesByName);
    for (const name of variableNames) {
      const existsLocally = name in localDocument.variablesByName;
      if (existsLocally) continue;

      if (!hasBeenPrompted && options.prompts) {
        cliPrompter.promptUserAboutNewVariables();
        hasBeenPrompted = true;
      }

      const distributedVariable = distributedDocument.variablesByName[name];
      const defaultValue = getValueFromVariable(distributedVariable);

      let value = defaultValue
      if (options.prompts) {
        const userInputEnvironmentVariable = await cliPrompter.promptUserForEnvironmentVariable({
          name,
          value: defaultValue,
        });
        value = userInputEnvironmentVariable.value
      }
      
      const variable = createVariableDeclaration(name, value);
      addVariableToDocument(variable, newLocalDocument);
    }

    return newLocalDocument;
  };

  const parseDistDocument = (options: Options): ParsedEnvDocument => {
    const tokens = analyzeDistEnvFile(options);
    return parseEnvTokens(tokens);
  };

  const parseLocalDocument = (options: Options): ParsedEnvDocument => {
    const tokens = analyzeLocalEnvFile(options);
    return parseEnvTokens(tokens);
  };

  return merge;
};

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
