import { DecodedOptions } from '@/EnvPrompt/Option/Model/DecodedOptions';

export class OptionsDecoder {
    private static OPTIONS_EXPRESSION: RegExp = /(?:(?:-{1,2}([A-Za-z]+)(?:[ =]([^\s-]+))?)|(?:(-[A-Za-z]+)))/;

    /**
     * Decodes a raw string of command line options (ex: "--distFile .env.dist -l .env")
     */
    public decode(options: string): DecodedOptions {
        const decodedOptions = {};

        // find all distinct options in the string of input command-line options
        const globalMatches: string[] = options.match(new RegExp(OptionsDecoder.OPTIONS_EXPRESSION, 'g'));

        // If the command is ran without options, globalMatches becomes NULL at runtime.  TypeScript cannot
        //  prevent this since it's type safety is only effective at compile time.
        if (!(globalMatches instanceof Array)) {
            return decodedOptions;
        }

        for (let i = 0; i < globalMatches.length; i++) {
            // extract our three capture groups for each distinct option that was matched
            let captureGroups = globalMatches[i].match(OptionsDecoder.OPTIONS_EXPRESSION);
            let [ option, value, shortOptions ] = captureGroups.slice(1);

            // if only "option" is present, we're dealing with a key/value pair option
            // if only "shortOptions" are present, we're dealing with a list of short options (ex: -lsa)
            if (option) {
                decodedOptions[option] = value || true;
            } else if (shortOptions) {
                for (let a = 1; a < shortOptions.length; a++) {
                    decodedOptions[shortOptions[a]] = true;
                }
            }
        }

        return decodedOptions;
    }
}
