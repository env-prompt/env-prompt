import * as cli from "../../../src/lib/cli";
import { CliPrompter, EnvironmentVariable } from "../../../src/lib/cli";
import { StdIoReader } from "../../../src/lib/std-io-reader";

type Mocked<T> = Partial<Record<keyof T, jest.Mock>>;

describe(".env parser", () => {
  let mockedConsole: Mocked<Console>;
  let mockedStdIoReader: Mocked<StdIoReader>;
  beforeEach(() => {
    mockedConsole = { warn: jest.fn(), error: jest.fn() };
    mockedStdIoReader = {
      pause: jest.fn(),
      promptUser: jest.fn(),
    };
  });

  const makeCliPrompter = (): CliPrompter =>
    cli.makeCliPrompter(
      mockedConsole as Console,
      mockedStdIoReader as StdIoReader
    );

  test("that the new variable prompt works", () => {
    const cliPrompter = makeCliPrompter();
    cliPrompter.promptUserAboutNewVariables();

    expect(mockedConsole.warn.mock.calls.length).toEqual(1);
    expect(mockedConsole.warn.mock.calls[0][0]).toEqual(
      `\x1b[33m${"New environment variables were found. When prompted, please enter their values."}\x1b[0m`
    );
  });

  test("that users are prompted correctly for variables with pre-existing values", async () => {
    const cliPrompter = makeCliPrompter();
    mockedStdIoReader.promptUser.mockResolvedValueOnce("8080");

    const existingVariable: EnvironmentVariable = {
      name: "port",
      value: "3306",
    };
    const userInputVariable = await cliPrompter.promptUserForEnvironmentVariable(
      existingVariable
    );

    expect(mockedStdIoReader.promptUser.mock.calls.length).toEqual(1);
    expect(mockedStdIoReader.promptUser.mock.calls[0][0]).toEqual(
      `\x1b[46m${"port"}\x1b[0m (\x1b[33m${"3306"}\x1b[0m): `
    );
    expect(mockedStdIoReader.pause.mock.calls.length).toEqual(1);
    expect(userInputVariable).toEqual({
      name: "port",
      value: "8080",
    } as EnvironmentVariable);
  });

  test("that users are prompted correctly for variables", async () => {
    const cliPrompter = makeCliPrompter();
    mockedStdIoReader.promptUser.mockResolvedValueOnce("Grace Hopper");

    const existingVariable: EnvironmentVariable = { name: "name", value: "" };
    const userInputVariable = await cliPrompter.promptUserForEnvironmentVariable(
      existingVariable
    );

    expect(mockedStdIoReader.promptUser.mock.calls.length).toEqual(1);
    expect(mockedStdIoReader.promptUser.mock.calls[0][0]).toEqual(
      `\x1b[46m${"name"}\x1b[0m: `
    );
    expect(mockedStdIoReader.pause.mock.calls.length).toEqual(1);
    expect(userInputVariable).toEqual({
      name: "name",
      value: "Grace Hopper",
    } as EnvironmentVariable);
  });

  test("that a variable's default value is used when the user doesn't provide a value", async () => {
    const cliPrompter = makeCliPrompter();
    mockedStdIoReader.promptUser.mockResolvedValueOnce("");

    const existingVariable: EnvironmentVariable = {
      name: "When in Rome",
      value: "do as the Romans do",
    };
    const userInputVariable = await cliPrompter.promptUserForEnvironmentVariable(
      existingVariable
    );

    expect(mockedStdIoReader.promptUser.mock.calls.length).toEqual(1);
    expect(mockedStdIoReader.promptUser.mock.calls[0][0]).toEqual(
      `\x1b[46m${"When in Rome"}\x1b[0m (\x1b[33m${"do as the Romans do"}\x1b[0m): `
    );
    expect(mockedStdIoReader.pause.mock.calls.length).toEqual(1);
    expect(userInputVariable).toEqual({
      name: "When in Rome",
      value: "do as the Romans do",
    } as EnvironmentVariable);
  });

  test("that errors are printed to stderr in red text", () => {
    const cliPrompter = makeCliPrompter();
    cliPrompter.printError(new Error("kernel panic!"));

    expect(mockedConsole.error.mock.calls.length).toEqual(1);
    expect(mockedConsole.error.mock.calls[0][0]).toEqual(
      `\x1b[31m${"ERROR: kernel panic!"}\x1b[0m`
    );
  });

  test("that warnings are printed to stderr in yellow text", () => {
    const cliPrompter = makeCliPrompter();
    cliPrompter.printWarning(
      "So don't fear us, cheer us If you ever get near us, don't jeer us, we're the fearless MIB's, freezin' up all the flack"
    );

    expect(mockedConsole.error.mock.calls.length).toEqual(1);
    expect(mockedConsole.error.mock.calls[0][0]).toEqual(
      `\x1b[33m${"So don't fear us, cheer us If you ever get near us, don't jeer us, we're the fearless MIB's, freezin' up all the flack"}\x1b[0m`
    );
  });
});
