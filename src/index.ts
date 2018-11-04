import { SerializationService } from '@/EnvPrompt/Service/SerializationService';
import { NodeFactory } from '@/EnvPrompt/Factory/NodeFactory';
import { FilesystemService } from '@/EnvPrompt/Service/FilesystemService';
import { UserInteractionService } from '@/EnvPrompt/Service/UserInteractionService';
import { NodePackage } from '@/EnvPrompt/Model/NodePackage';
import { PreFlightService } from '@/EnvPrompt/Service/PreFlightService';

let serializationService: SerializationService = new SerializationService();
let nodeFactory: NodeFactory = new NodeFactory();
let filesystemService: FilesystemService = new FilesystemService(serializationService, nodeFactory);
let userInteractionService: UserInteractionService = new UserInteractionService(filesystemService, nodeFactory);
let preFlightService: PreFlightService = new PreFlightService(filesystemService);

/**
 * Runs the application
 */
function main() {
    // Load contents of package.json.
    let nodePackage: NodePackage = filesystemService.loadNodePackage();

    // Run pre-flight check to validate the node package.
    nodePackage = preFlightService.validateNodePackage(nodePackage);

    // Kick it off.
    userInteractionService.mergeFiles(nodePackage.config.envPrompt.distFile, nodePackage.config.envPrompt.file);
}

/**
 * Error handling
 */
function error(e: Error) {
    userInteractionService.printError(e);
    process.exit(1);
}

try {
    main();
} catch (e) {
    error(e);
}
