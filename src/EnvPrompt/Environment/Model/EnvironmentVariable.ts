export interface EnvironmentVariable {
    name: string;

    value: string;
}

export interface EnvironmentVariableDictionary {
    [name: string]: EnvironmentVariable;
}
