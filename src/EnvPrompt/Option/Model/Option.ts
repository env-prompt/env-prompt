/**
 * Represents a defined command-line option that is accepted by the application
 */
export class Option {
    public longName: string;

    public shortName: string;

    public value: string|boolean;

    public constructor(longName: string, shortName: string, value: string|boolean) {
        this.longName = longName;
        this.shortName = shortName;
        this.value = value;
    }
}
