import { NodePackage } from '@/EnvPrompt/Model/NodePackage';
import { FilesystemService } from '@/EnvPrompt/Service/FilesystemService';

/**
 * Service containing all business logic for pre-flight checks that run before the core application
 *  business logic.
 */
export class PreFlightService {
    public static readonly DEFAULT_DIST_FILE_SUFFIX = '.dist';

    public static readonly DEFAULT_FILE_PATH = '.env';

    private filesystemService: FilesystemService;

    public constructor(filesystemService: FilesystemService) {
        this.filesystemService = filesystemService;
    }

    /**
     * Validate their package.json and return a normalized NodePackage object that we can reliably work with
     */
    public validateNodePackage(nodePackage: NodePackage): NodePackage {
        let file: string = this.getFile(nodePackage);
        let distFile: string = this.getDistFile(nodePackage, file);

        return this.buildNormalizedNodePackage(file, distFile);
    }

    /**
     * Get their .env file
     */
    private getFile(nodePackage: NodePackage): string {
        // By default, use ".env" in their project root as the file.
        let file: string = PreFlightService.DEFAULT_FILE_PATH;

        // If they've set their own "file" in package.json, defer to that.
        if (nodePackage && nodePackage.config && nodePackage.config.envPrompt && nodePackage.config.envPrompt.file) {
            file = nodePackage.config.envPrompt.file;
        }

        return file;
    }

    /**
     * Get their .env.dist file
     */
    private getDistFile(nodePackage: NodePackage, file: string): string {
        // By default, prepend ".dist" to whatever they've set their "file" to in package.json.  In most cases
        //  this will be ".env.dist".
        let distFile: string = file + PreFlightService.DEFAULT_DIST_FILE_SUFFIX;

        // If they've set their own "distFile" in package.json, defer to that.
        if (nodePackage && nodePackage.config && nodePackage.config.envPrompt && nodePackage.config.envPrompt.distFile) {
            distFile = nodePackage.config.envPrompt.distFile;
        }

        // If the .env.dist file does not exist, throw an error.
        if (!this.filesystemService.fileExists(distFile)) {
            throw new Error(
                `Could not locate ${distFile}. Please create the file, or specify a`
                + ' different dist file in your package.json.'
            );
        }

        return distFile;
    }

    /**
     * Builds a normalized NodePackage object, meant to closely mirror what the user has specified
     *  in their package.json
     */
    private buildNormalizedNodePackage(file: string, distFile: string): NodePackage {
        return {
            config: {
                envPrompt: {
                    file,
                    distFile
                }
            }
        };
    }
}
