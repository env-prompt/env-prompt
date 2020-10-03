import { OptionsContainer } from '@/EnvPrompt/Option/Model/OptionsContainer';
import { OptionsDecoder } from '@/EnvPrompt/Option/Service/OptionsDecoder';
import { OptionsDenormalizer } from '@/EnvPrompt/Option/Service/OptionsDenormalizer';
import { OptionsDeserializer } from '@/EnvPrompt/Option/Service/OptionsDeserializer';
import { FilesystemFacade } from '@/EnvPrompt/Filesystem/Service/FilesystemFacade';
import { StdIoReaderFlyweight } from '@/EnvPrompt/UserInteraction/Service/StdIoReaderFlyweight';
import { CommandLinePrompter } from '@/EnvPrompt/UserInteraction/Service/CommandLinePrompter';
import { TextFormatter } from '@/EnvPrompt/UserInteraction/Service/TextFormatter';
import { DotEnvSerializer } from '@/EnvPrompt/Environment/Service/DotEnvSerializer';
import { EnvironmentVariableMerger } from '@/EnvPrompt/Environment/Service/EnvironmentVariableMerger';

// instantiate necessary services
const optionsDeserializer = new OptionsDeserializer(new OptionsDecoder(), new OptionsDenormalizer());
const filesystemFacade: FilesystemFacade = new FilesystemFacade();
const dotEnvSerializer: DotEnvSerializer = new DotEnvSerializer();
const commandLinePrompter: CommandLinePrompter = new CommandLinePrompter(
    new StdIoReaderFlyweight(),
    new TextFormatter()
);
const environmentVariableMerger: EnvironmentVariableMerger = new EnvironmentVariableMerger(
    filesystemFacade,
    dotEnvSerializer,
    commandLinePrompter
);

/**
 * Handle exceptions and promise rejections
 */
function errorHandler (e: Error) {
    commandLinePrompter.printError(e);
    process.exit(1);
}

process
    .on('unhandledRejection', errorHandler)
    .on('uncaughtException', errorHandler);

// parse command-line options
const optionsContainer: OptionsContainer = optionsDeserializer.deserialize(process.argv);

// merge "dist" and "local" environment variable files
environmentVariableMerger.merge(<string>optionsContainer.distFile.value, <string>optionsContainer.localFile.value);
