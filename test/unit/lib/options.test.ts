import { getOptionsFromEnvironment, ProcessDependencies, Options, NewlineType } from "../../../src/lib/options";

describe("options", () => {
    test('that a default set of options is retrieved when no CLI arguments are provided', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js'
            ],
            env: {},
            platform: 'linux'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: '.env', prompts: true, newlineType: NewlineType.unix } as Options)
    });

    test('that the localFilePath option can be overridden with -l', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js',
                '-l',
                'prod.env'
            ],
            env: {},
            platform: 'linux'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: 'prod.env', prompts: true, newlineType: NewlineType.unix } as Options)
    });

    test('that the localFilePath option can be overridden with --localFile', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js',
                '--localFile',
                'dev.env'
            ],
            env: {},
            platform: 'linux'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: 'dev.env', prompts: true, newlineType: NewlineType.unix } as Options)
    });

    test('that the distFilePath option can be overridden with --distFile', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js',
                '-d',
                'common.env'
            ],
            env: {},
            platform: 'linux'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: 'common.env', localFilePath: '.env', prompts: true, newlineType: NewlineType.unix } as Options)
    });

    test('that the distFilePath option can be overridden with --distFile', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js',
                '--distFile',
                'shared.env'
            ],
            env: {},
            platform: 'linux'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: 'shared.env', localFilePath: '.env', prompts: true, newlineType: NewlineType.unix } as Options)
    });

    test('that --prompts sets the prompts option to true', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js',
                '--prompts'
            ],
            env: {},
            platform: 'linux'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: '.env', prompts: true, newlineType: NewlineType.unix } as Options)
    });

    test('that --prompts=true sets the prompts option to true', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js',
                '--prompts=true'
            ],
            env: {},
            platform: 'linux'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: '.env', prompts: true, newlineType: NewlineType.unix } as Options)
    });

    test('that --prompts=false sets the prompts option to false', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js',
                '--prompts=false'
            ],
            env: {},
            platform: 'linux'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: '.env', prompts: false, newlineType: NewlineType.unix } as Options)
    });

    test('that -p sets the prompts option to true', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js',
                '-p'
            ],
            env: {},
            platform: 'linux'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: '.env', prompts: true, newlineType: NewlineType.unix } as Options)
    });

    test('that -p=true sets the prompts option to true', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js',
                '-p=true'
            ],
            env: {},
            platform: 'linux'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: '.env', prompts: true, newlineType: NewlineType.unix } as Options)
    });

    test('that -p=false sets the prompts option to false', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js',
                '-p=false'
            ],
            env: {},
            platform: 'linux'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: '.env', prompts: false, newlineType: NewlineType.unix } as Options)
    });

    test('that CI=false in process.env sets the prompts option to true', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js'
            ],
            env: { CI: 'false' },
            platform: 'linux'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: '.env', prompts: true, newlineType: NewlineType.unix } as Options)
    });

    test('that CI=true in process.env sets the prompts option to false', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js'
            ],
            env: { CI: 'true' },
            platform: 'linux'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: '.env', prompts: false, newlineType: NewlineType.unix } as Options)
    });

    test('that CI=true in process.env and --prompts sets the prompts option to true', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js',
                '--prompts'
            ],
            env: { CI: 'true' },
            platform: 'linux'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: '.env', prompts: true, newlineType: NewlineType.unix } as Options)
    });

    test('that newline type is set to "windows" when running on a windows operating system', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js'
            ],
            env: {},
            platform: 'win32'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: '.env', prompts: true, newlineType: NewlineType.windows } as Options)
    });

    test('that newline type is set to "unix" when running on any non-windows operating system', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js'
            ],
            env: {},
            platform: 'darwin'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: '.env', prompts: true, newlineType: NewlineType.unix } as Options)
    });

    test('that newline type is set to "windows" when the -n=windows argument is passed, regardless of operating system', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js',
                '-n=windows'
            ],
            env: {},
            platform: 'linux'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: '.env', prompts: true, newlineType: NewlineType.windows } as Options)
    });

    test('that newline type is set to "windows" when the --newlineType=windows argument is passed, regardless of operating system', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js',
                '--newlineType=windows'
            ],
            env: {},
            platform: 'linux'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: '.env', prompts: true, newlineType: NewlineType.windows } as Options)
    });

    test('that newline type is set to "unix" when the -n=unix argument is passed, regardless of operating system', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js',
                '-n=unix'
            ],
            env: {},
            platform: 'win32'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: '.env', prompts: true, newlineType: NewlineType.unix } as Options)
    });

    test('that newline type is set to "unix" when the --newlineType=unix argument is passed, regardless of operating system', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js',
                '--newlineType=unix'
            ],
            env: {},
            platform: 'win32'
        }
        const options = getOptionsFromEnvironment(process)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: '.env', prompts: true, newlineType: NewlineType.unix } as Options)
    });

    test('that --newlineType can only be set to "windows" or "unix"', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js',
                '--newlineType=linux'
            ],
            env: {},
            platform: 'win32'
        }
        expect(() => getOptionsFromEnvironment(process)).toThrow('Invalid newline type. Valid types: "unix", "windows"');
    });

    test('that -n can only be set to "windows" or "unix"', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js',
                '-n=linux'
            ],
            env: {},
            platform: 'win32'
        }
        expect(() => getOptionsFromEnvironment(process)).toThrow('Invalid newline type. Valid types: "unix", "windows"');
    });

    test('that only documented CLI arguments are allowed', () => {
        const process: ProcessDependencies = {
            argv: [
                '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
                '/home/bkotos/Projects/env-prompt/dist/index.js',
                '--someUnacceptedArgument'
            ],
            env: {},
            platform: 'win32'
        }
        expect(() => getOptionsFromEnvironment(process)).toThrow('Invalid argument --someUnacceptedArgument');
    });
});
