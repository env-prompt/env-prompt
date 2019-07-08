/**
 * Assorted utility functions that format command-line text
 */
export class TextFormatter {
    /**
     * Make text background color cyan
     */
    public bgCyan(message: string): string {
        return `\x1b[46m${message}\x1b[0m`;
    }

    /**
     * Make text color red
     */
    public fgRed(message: string): string {
        return `\x1b[31m${message}\x1b[0m`;
    }

    /**
     * Make text color yellow
     */
    public fgYellow(message: string): string {
        return `\x1b[33m${message}\x1b[0m`;
    }

    /**
     * Make text color green
     */
    public fgGreen(message: string): string {
        return `\x1b[32m${message}\x1b[0m`;
    }

    /**
     * Make text bold
     */
    public bold(message: string): string {
        return `\x1b[1m${message}\x1b[0m`;
    }

    /**
     * Builds question text to prompt user with
     */
    public buildQuestion(name: string, defaultValue: string): string {
        if (defaultValue.trim().length > 0) {
            defaultValue = ` (${this.fgYellow(defaultValue)})`;
        }

        return `${this.bgCyan(name)}${defaultValue}: `;
    }
}
