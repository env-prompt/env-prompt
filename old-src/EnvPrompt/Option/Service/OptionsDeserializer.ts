import { OptionsDecoder } from '@/EnvPrompt/Option/Service/OptionsDecoder';
import { OptionsContainer } from '@/EnvPrompt/Option/Model/OptionsContainer';
import { DecodedOptions } from '@/EnvPrompt/Option/Model/DecodedOptions';
import { OptionsDenormalizer } from '@/EnvPrompt/Option/Service/OptionsDenormalizer';

export class OptionsDeserializer {
    private optionDecoder: OptionsDecoder;

    private optionDenormalizer: OptionsDenormalizer;

    public constructor(optionDecoder: OptionsDecoder, optionDenormalizer: OptionsDenormalizer) {
        this.optionDecoder = optionDecoder;
        this.optionDenormalizer = optionDenormalizer;
    }

    /**
     * Translate the unaltered "argv" array provided by Node.js into an "OptionsContainer" representing the
     *  options that are accepted by the application.
     */
    public deserialize(argv: string[]): OptionsContainer {
        const rawOptions = process.argv.slice(2).join(' ');
        const decodedOptions: DecodedOptions = this.optionDecoder.decode(rawOptions);

        return this.optionDenormalizer.denormalize(decodedOptions);
    }
}
