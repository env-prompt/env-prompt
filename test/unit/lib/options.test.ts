import { getOptionsFromRawArguments } from "../../../src/lib/options";

describe("options", () => {
    test('that a default set of options is retrieved when no CLI arguments are provided', () => {
        const argv = [
            '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
            '/home/bkotos/Projects/env-prompt/dist/index.js'
        ]
        const options = getOptionsFromRawArguments(argv)
        expect(options).toEqual({distFilePath: '.env.dist', localFilePath: '.env'})
    });

    test('that the localFilePath option can be overridden with -l', () => {
        const argv = [
            '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
            '/home/bkotos/Projects/env-prompt/dist/index.js',
            '-l',
            'prod.env'
        ]
        const options = getOptionsFromRawArguments(argv)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: 'prod.env' })
    });

    test('that the localFilePath option can be overridden with --localFile', () => {
        const argv = [
            '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
            '/home/bkotos/Projects/env-prompt/dist/index.js',
            '--localFile',
            'dev.env'
        ]
        const options = getOptionsFromRawArguments(argv)
        expect(options).toEqual({ distFilePath: '.env.dist', localFilePath: 'dev.env' })
    });

    test('that the distFilePath option can be overridden with --distFile', () => {
        const argv = [
            '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
            '/home/bkotos/Projects/env-prompt/dist/index.js',
            '-d',
            'common.env'
        ]
        const options = getOptionsFromRawArguments(argv)
        expect(options).toEqual({ distFilePath: 'common.env', localFilePath: '.env' })
    });

    test('that the distFilePath option can be overridden with --distFile', () => {
        const argv = [
            '/home/bkotos/.nvm/versions/node/v12.18.0/bin/node',
            '/home/bkotos/Projects/env-prompt/dist/index.js',
            '--distFile',
            'shared.env'
        ]
        const options = getOptionsFromRawArguments(argv)
        expect(options).toEqual({ distFilePath: 'shared.env', localFilePath: '.env' })
    });
});
