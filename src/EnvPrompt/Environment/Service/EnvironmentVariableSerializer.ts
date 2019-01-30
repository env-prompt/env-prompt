import { EnvironmentVariableDictionary } from '@/EnvPrompt/Environment/Model/EnvironmentVariableDictionary';

/**
 * Format-agnostic interface for environment variable serializers
 */
export interface EnvironmentVariableSerializer {
    deserialize(content: string): EnvironmentVariableDictionary;

    serialize(environmentVariables: EnvironmentVariableDictionary): string
}
