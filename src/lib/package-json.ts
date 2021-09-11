import fs from 'fs'
import path from 'path'

interface PackageJson {
    version: string
}

type NodeFs = Pick<typeof fs, "existsSync" | "readFileSync" | "writeFileSync">;
type NodePath = Pick<typeof path, "resolve">

export class PackageJsonReader {
    public constructor(private fs: NodeFs, private path: NodePath) {}

    public getVersion(): string {
        return this.readPackageJson().version
    }

    private readPackageJson(): PackageJson {
        const versionPath = this.path.resolve(__dirname, '../../package.json')
        return JSON.parse(this.fs.readFileSync(versionPath, { encoding: 'utf8' }))
    }
}
