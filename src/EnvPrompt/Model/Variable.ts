/**
 * Dictionary representing a key/value pair of variables
 */
export interface VariableDictionary {
    [name: string]: Variable;
}

/**
 * Represents an environment variable
 */
export interface Variable {
    name: string;

    value: string;
}
