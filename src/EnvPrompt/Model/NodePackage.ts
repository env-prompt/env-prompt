/**
 * Represents config values specific to env-prompt
 */
export interface EnvPromptConfig {
    file?: string;
    distFile?: string;
}

/**
 * Represents the "config" object inside package.json
 */
export interface NodeConfig {
    envPrompt?: EnvPromptConfig;
}

/**
 * Represents top level package.json
 */
export interface NodePackage {
    config?: NodeConfig;
}
