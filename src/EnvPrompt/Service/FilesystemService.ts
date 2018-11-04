import { SerializationService } from '@/EnvPrompt/Service/SerializationService';
import { Variable, VariableDictionary } from '@/EnvPrompt/Model/Variable';
import { NodeFactory } from '@/EnvPrompt/Factory/NodeFactory';
import { NodePackage } from '@/EnvPrompt/Model/NodePackage';
import { ReadLine }  from 'readline';
import path from 'path';
import fs from 'fs';

/**
 * Service containing all business logic pertaining to reading and writing via the filesystem
 */
export class FilesystemService {
    public static readonly PACKAGE_JSON_FILE = 'package.json';

    private serializationService: SerializationService;

    private nodeFactory: NodeFactory;

    public constructor(serializationService: SerializationService, nodeFactory: NodeFactory) {
        this.serializationService = serializationService;
        this.nodeFactory = nodeFactory;
    }

    /**
     * Fetch the absolute path of a file, in relation to the directory the command is being executed from
     */
    public absolutePath(relativePath: string): string {
        return path.resolve(process.cwd(), relativePath);
    }

    /**
     * Loads the contents of package.json
     */
    public loadNodePackage(): NodePackage {
        let filePath: string = this.absolutePath(FilesystemService.PACKAGE_JSON_FILE);
        let rawContent = fs.readFileSync(filePath, 'utf8');

        return JSON.parse(rawContent);
    }

    /**
     * Loads set of environment variables from a given file
     */
    public getVariablesFromFile(filePath: string): Promise<VariableDictionary> {
        filePath = this.absolutePath(filePath);
        return new Promise<VariableDictionary>((resolve: Function) => {
            let variables: VariableDictionary = {};

            // if the file doesn't exist, return the empty dictionary
            // else, parse the environment variables line by line into the dictionary and return it
            if (!fs.existsSync(filePath)) {
                resolve(variables);
            } else {
                let file: ReadLine = this.nodeFactory.buildFileReader(filePath);
                file
                    .on('line', (line) => {
                        let variable: Variable = this.serializationService.deserialize(line);
                        variables[variable.name] = variable;
                    })
                    .on('close', function() {
                        file.close();
                        resolve(variables);
                    })
                ;
            }
        })
    }

    /**
     * Writes set of environment variables to a given file
     */
    public writeVariablesToFile(filePath: string, variables: VariableDictionary) {
        filePath = this.absolutePath(filePath);
        let content = this.serializationService.serialize(variables);
        fs.writeFileSync(filePath, content);
    }

    /**
     * Determine if a given file exists
     */
    public fileExists(filePath): boolean {
        filePath = this.absolutePath(filePath);

        return fs.existsSync(filePath);
    }
}
