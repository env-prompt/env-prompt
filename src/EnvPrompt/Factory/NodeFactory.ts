import readline, { ReadLine }  from 'readline';
import fs from 'fs';

/**
 * Contains instantiation logic for native NodeJS objects
 */
export class NodeFactory {
    /**
     * Build a ReadLine object for reading from files
     */
    public buildFileReader(filePath: string): ReadLine {
        return readline.createInterface(fs.createReadStream(filePath))
    }

    /**
     * Build a ReadLine object for interacting with the user via stdin and stdout
     */
    public buildStdIoReader(): ReadLine {
        return readline.createInterface(process.stdin, process.stdout);
    }
}
