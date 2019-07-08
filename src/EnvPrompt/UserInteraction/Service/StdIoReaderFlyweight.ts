import readline, { ReadLine }  from 'readline';

/**
 * Provides shared state access to the "readline" Node.js module, for use with the stdin and stdout streams.
 */
export class StdIoReaderFlyweight {
    private _readLine: ReadLine;

    /**
     * Prompt user with a question and return their input
     */
    public async promptUser(question: string): Promise<string> {
        return new Promise<string>((resolve) => {
            this.readLine.question(question, (input: string) => {
                resolve(input);
            });
        })
    }

    /**
     * Disable user input
     */
    public pause(): void {
        this.readLine.pause();
    }

    /**
     * Create "readline" interface only when it is requested, since it takes control over the cursor
     *  on instantiation.
     */
    private get readLine(): ReadLine {
        if (!this._readLine) {
            this._readLine = readline.createInterface(process.stdin, process.stdout);
        }

        return this._readLine;
    }
}
