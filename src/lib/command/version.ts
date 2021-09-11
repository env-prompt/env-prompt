import { PackageJsonReader } from '../package-json'

export default (console: Console, packageJsonReader: PackageJsonReader) => {
    const version = packageJsonReader.getVersion()
    console.log(version)
}
