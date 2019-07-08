/**
 * Represents a decoded (yet unfiltered) set of command-line options, ie: { "distFile": ".env.dist", "l": ".env" }
 */
export interface DecodedOptions {
    [key: string]: string;
}
