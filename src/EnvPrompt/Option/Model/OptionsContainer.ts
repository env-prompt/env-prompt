import { Option } from '@/EnvPrompt/Option/Model/Option';

/**
 * A container of defined command-line options that are accepted by the application
 */
export class OptionsContainer {
    public distFile: Option;

    public localFile: Option;

    public nonInteractive: Option;

    public constructor() {
        this.distFile = new Option('distFile', 'd', '.env.dist');
        this.localFile = new Option('localFile', 'l', '.env');
        this.nonInteractive = new Option('nonInteractive', 'n', false);
    }
}
