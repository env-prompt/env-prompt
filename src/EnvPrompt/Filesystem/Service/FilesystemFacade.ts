import path from 'path';
import fs from 'fs';

export class FilesystemFacade {
    public static readonly ENCODING = 'utf8';

    /**
     * Fetch the absolute path of a file, in relation to the directory the command is being executed from
     */
    public absolutePath(relativePath: string): string {
        return path.resolve(process.cwd(), relativePath);
    }

    /**
     * Determine if a given file exists
     */
    public fileExists(filePath: string): boolean {
        filePath = this.absolutePath(filePath);

        return fs.existsSync(filePath);
    }

    public readFile(filePath: string): string {
        filePath = this.absolutePath(filePath);

        return fs.readFileSync(filePath, FilesystemFacade.ENCODING);
    }

    public writeFile(filePath: string, content: string): void {
        filePath = this.absolutePath(filePath);

        fs.writeFileSync(filePath, content);
    }
}
