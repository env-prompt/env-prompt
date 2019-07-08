import { DecodedOptions } from '@/EnvPrompt/Option/Model/DecodedOptions';
import { OptionsContainer } from '@/EnvPrompt/Option/Model/OptionsContainer';
import { Option } from '@/EnvPrompt/Option/Model/Option';

export class OptionsDenormalizer {
    /**
     * Translate decoded options into a new "OptionsContainer", merging the user-specified options with the
     *  options that are accepted by the application.
     */
    public denormalize(decodedOptions: DecodedOptions): OptionsContainer {
        const optionsContainer = new OptionsContainer();

        for (let i in optionsContainer) {
            const option: Option = optionsContainer[i];

            if (decodedOptions[option.longName]) {
                option.value = decodedOptions[option.longName];
            } else if (decodedOptions[option.shortName]) {
                option.value = decodedOptions[option.shortName];
            }
        }

        return optionsContainer;
    }
}
