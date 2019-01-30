import { EnvironmentVariable } from '@/EnvPrompt/Environment/Model/EnvironmentVariable';
import { EnvironmentVariableDictionary } from '@/EnvPrompt/Environment/Model/EnvironmentVariableDictionary';
import { EnvironmentVariableSerializer } from '@/EnvPrompt/Environment/Service/EnvironmentVariableSerializer';

/**
 * Service containing all business logic for serializing and deserializing environment variables from .env files
 */
export class DotEnvSerializer implements EnvironmentVariableSerializer {
    public static readonly DELIMITER = '=';

    public static readonly DOT_ENV_LINE_EXPRESSION = /^[A-Za-z](?:\w)*=(?:[^\s])+/;

    /**
     * Parse input .env file content and return a dictionary of environment variables
     */
    public deserialize(content: string): EnvironmentVariableDictionary {
        const environmentVariableDictionary: EnvironmentVariableDictionary = {};
        let lines: string[] = content.trim().split('\n');

        // TODO figure out why:
        //      "".split('\n')
        //  evaluates to:
        //      [""]
        //  instead of:
        //      []
        if (lines.length === 1 && lines[0] === '') {
            lines = [];
        }

        for (let i: number = 0; i < lines.length; i++) {
            const line: string = lines[i];

            if (!this.isValidSyntax(line)) {
                throw new Error(`Invalid environment variable: ${line}`);
            }

            const environmentVariable: EnvironmentVariable = this.deserializeLine(line);
            environmentVariableDictionary[environmentVariable.name] = environmentVariable;
        }

        return environmentVariableDictionary;
    }

    /**
     * Build .env file contents representing the given set of environment variables
     */
    public serialize(environmentVariables: EnvironmentVariableDictionary): string {
        let content: string = '';

        for (let name in environmentVariables) {
            let variable: EnvironmentVariable = environmentVariables[name];
            content += [variable.name, variable.value].join(DotEnvSerializer.DELIMITER) + '\n';
        }

        return content;
    }

    /**
     * Parse input .env line into an EnvironmentVariable object
     */
    private deserializeLine(line: string): EnvironmentVariable {
        let pieces: string[] = line.trim().split(DotEnvSerializer.DELIMITER);
        let name = pieces.shift();
        let value = pieces.join(DotEnvSerializer.DELIMITER);

        return { name, value };
    }

    /**
     * Determine if the given .env line is syntactically valid
     */
    private isValidSyntax(content: string): boolean {
        return DotEnvSerializer.DOT_ENV_LINE_EXPRESSION.test(content);
    }
}
