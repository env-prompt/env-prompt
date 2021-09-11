import { NodeFs, NodePath } from "."
import { bold, underline, italic } from "../cli"

const getHeadingContent = (version: string): string => {
    const formattedContent = `${bold('env-prompt')} v${version}`
    const rawContentLength = `env-prompt v${version}`.length
    return getCenteredContent(formattedContent, rawContentLength, process.stdout.columns)
}

const getMergeContent = (): string =>
`${bold('SYNOPSIS')}
        ${underline('npx')} ${underline('env-prompt')} ${underline('merge')} [-d | --distFile <path>] [-l | --localFile <path>] 
                             [-p | --prompts <true|false>] [-n | --newlineType <unix|windows>]
                             [-a | --allowDuplicates]

${bold('DESCRIPTION')}

${bold('ARGUMENTS')}
        ${bold('-d <path>')}, ${bold('--distFile <path>')}
        ${italic(`Default: ${underline('.env.dist')}`)}
        This is the .env file that env-prompt will scan for new environment variables. It is
        recommended that you commit this file to version control.

        ${bold('-l <path>')}, ${bold('--distFile <localFile>')}
        ${italic(`Default: ${underline('.env')}`)}
        This is the .env file for your local environment. When prompted for new variables, the
        input values will be written here. It is recommended that you add this file to the .gitignore
        of your project.

        ${bold('-n <unix|windows>')}, ${bold('--newlineType <unix|windows>')}
        ${italic(`Default (on non-windows systems): ${underline('unix')}`)}
        ${italic(`Default (on windows): ${underline('windows')}`)}
        Determines how newlines will be written to disk. For unix, \\n will be used. For windows, \\r\\n
        will be used. This argument only impacts how newlines are written to disk. Regardless of this
        value, \\n, \\r\\n, and \\r are all read from disk as newlines.

        ${bold('-a')}, ${bold('--allowDuplicates')}
        By default, an error is raised when duplicate variable declarations are found. The presence
        of this flag supresses this error.

${bold('VARIABLES')}
        ${bold('CI=<true|false>')}
        ${italic(`Default: ${underline('false')}`)}
        Indicates whether or not env-prompt is being run by continous integration. Setting CI=true is
        equivalent to --prompts false.
`

interface PackageJson {
    version: string
}
const getVersion = (fs: NodeFs, path: NodePath): string => {
    const versionPath = path.resolve(__dirname, '../../../package.json')
    const { version } = JSON.parse(fs.readFileSync(versionPath, { encoding: 'utf8' })) as PackageJson
    return version
}

const getCenteredContent = (formattedContent: string, rawContentLength: number, cols: number): string => {
    const halfContentLength = Math.floor(rawContentLength / 2)
    const halfScreenLength = Math.floor(cols / 2)
    const prependedWhitespaceLength = halfScreenLength - halfContentLength
    const prependedWhitespace = new Array(prependedWhitespaceLength).fill(' ').join('')
    return `${prependedWhitespace}${formattedContent}`
}

const getHorizontalRule = (cols: number): string => new Array(cols).fill('─').join('')

export default (console: Console, fs: NodeFs, path: NodePath) => {
    const hr = getHorizontalRule(process.stdout.columns)

    console.log(hr)
    const version = getVersion(fs, path)
    console.log(getHeadingContent(version))
    console.log('')
    console.log(getMergeContent())
    console.log(hr)
}
