import { Variable, VariableDictionary } from '@/EnvPrompt/Model/Variable';

/**
 * Service containing all business logic for serializing and deserializing environment variables from .env files
 */
export class SerializationService {
    /**
     * Separates name and value (ie in "PORT=8000", the delimiter is "=")
     */
    public static readonly DELIMITER = '=';

    /**
     * Parse an input file line into an Variable object
     */
    public deserialize(line: string): Variable {
        let pieces: string[] = line.trim().split(SerializationService.DELIMITER);
        let name = pieces.shift();
        let value = pieces.join(SerializationService.DELIMITER);

        return { name, value };
    }

    /**
     * Build the contents of a .env file representing a set of environment variables
     */
    public serialize(variables: VariableDictionary): string {
        let content: string = '';

        for (let name in variables) {
            let variable: Variable = variables[name];
            content += [variable.name, variable.value].join(SerializationService.DELIMITER) + '\n';
        }

        return content;
    }
}
