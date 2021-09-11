import path from 'path'
import fs from 'fs'
import * as esbuild from 'esbuild'
import * as ts from 'typescript'
import * as chokidar from 'chokidar'
import tsconfig from '../tsconfig.json'
import { TextEncoder } from 'util'

const isProduction = process.argv.includes('--env=production')
const projectRoot = path.resolve(__dirname, '..')
const outDir = path.resolve(projectRoot, 'dist')
const srcDir = path.resolve(projectRoot, 'src')
const entryPoint = path.resolve(srcDir, 'cli.ts')

const getRelativePath = (fullPath: string): string => fullPath.replace(`${projectRoot}/`, '')

const getCompileSubjectsInDir = (dir: string): CompileSubject[] => {
    const nodes = fs.readdirSync(dir)
    return nodes.map((f): CompileSubject|CompileSubject[] => {
        const fullPath = path.resolve(dir, f)
        const outPath = fullPath.replace(srcDir, outDir)

        const isDir = fs.lstatSync(fullPath).isDirectory()
        if (isDir) {
            fs.mkdirSync(outPath)
            return getCompileSubjectsInDir(fullPath)
        }

        const outfile = outPath.replace('.ts', '.js')
        return {
            entryPoint: fullPath,
            outfile
        }
    }).flat()
}
const getCompileSubjects = (): CompileSubject[] => getCompileSubjectsInDir(srcDir)
let compileSubjects: CompileSubject[]

interface CompileSubject {
    entryPoint: string
    outfile: string
}

const cleanup = () => {
    try {
        console.log(`    > Cleaning up...`)
        fs.rmdirSync(outDir, { recursive: true })
    } catch (e) {}
}

const createDistDir = () => {
    console.log(`    > creating dist directory...`)
    try {
        fs.mkdirSync(outDir)
    } catch (e) {}
}

const typeCheck = () => {
    console.log('    > Running typescript compiler...')
    const { compilerOptions } = tsconfig
    delete compilerOptions.lib
    const options: ts.CompilerOptions = {
        ...(compilerOptions as any as ts.CompilerOptions),
        target: ts.ScriptTarget.ES5
    }
    const program = ts.createProgram([entryPoint], options)
    let emitResult = program.emit();

    const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics)
    const hasErrors = allDiagnostics.length > 0
    if (hasErrors) {
        console.log ('        * typescript compiler finished with errors')
        allDiagnostics.forEach(diagnostic => {
            if (diagnostic.file) {
                let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
                let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
                console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            } else {
                console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
            }
        });
        throw new Error()
    }

      console.log ('        * typescript compiler finished with no errors')
}

const printSpaces = () => console.log('\n\n\n\n')

const typeCheckAsync = () => new Promise<void>((resolve, reject) => setTimeout(() => {
    try {
        typeCheck()
    } catch (e) {
        reject()
        return
    }
    resolve()
}, 0))

const bundle = async (subjects: CompileSubject[]) => {
    console.log('    > Running esbuild...')
    try {
        const environmentOptions: esbuild.BuildOptions = isProduction ? { minify: true } : { sourcemap: 'inline' }
        for (const { entryPoint, outfile } of subjects) {
            const relativeEntryPath = getRelativePath(entryPoint)
            const relativeOutPath = getRelativePath(outfile)
            console.log(`        - ${relativeEntryPath} -> ${relativeOutPath}`)
            const result = await esbuild.build({
                entryPoints: [entryPoint],
                bundle: false,
                write: false,
                outfile,
                target: 'node10.4',
                format: 'cjs',
                ...environmentOptions,
            })
            const [ output ] = result.outputFiles
            const isBin = relativeOutPath === 'dist/cli.js'
            if (isBin) {
                console.log(`        * chmod +x ${relativeOutPath}`)
                writeBin(output)
            } else writeFile(output)
        }
    } catch (e) {
        console.log('        * esbuild finished with errors', e)
        throw e
    }
    console.log('        * esbuild finished with no errors')
}

const getShebang = (): Uint8Array => new TextEncoder().encode('#!/usr/bin/env node\n')

const makeExecutable = (path: string) => fs.chmodSync(path, "755")

const writeBin = ({ path, contents }: esbuild.OutputFile) => {
    const shebang = getShebang()
    const binContents = mergeBytes(shebang, contents)
    fs.writeFileSync(path, binContents)
    makeExecutable(path)
}

const writeFile = ({ path, contents }: esbuild.OutputFile) => fs.writeFileSync(path, contents)

const mergeBytes = (a: Uint8Array, b: Uint8Array): Uint8Array => {
    const merged = new Uint8Array(a.length + b.length)
    merged.set(a),
    merged.set(b, a.length)
    return merged
}

const build = async () => {
    try {
        console.log('** BUILDING **')
        cleanup()
        createDistDir()
        compileSubjects = getCompileSubjects()
        await bundle(compileSubjects)
        typeCheck()
        console.log('    ✅ build successful')
    } catch (e) {
        console.log('    🔴 build failed')
    }
}

const watch = async () => {
    let isDebouncing = false
    const printSpacesIfNotDebounding = () => {
        if (!isDebouncing) {
            printSpaces()
            isDebouncing = true
        }
    }

    const onChange = async () => {
        isDebouncing = false
        try {
            await bundle(compileSubjects)
            await typeCheckAsync()
            console.log('    ✅ rebuild successful')
        } catch (e) {
            console.log('    🔴 rebuild failed')
        }
    }

    const startWatching = () => {
        printSpacesIfNotDebounding()
        console.log('** WATCHING**')
        const watchDir = path.resolve('src')
        let rebuildTimeout: NodeJS.Timeout
        chokidar.watch(watchDir, { ignoreInitial: true }).on('all', (event, path) => {
            printSpacesIfNotDebounding()
            console.log(`    > File changed (${event}): ${path}`)
            clearTimeout(rebuildTimeout)
            rebuildTimeout = setTimeout(onChange, 250)
        })
    }

    try {
        await build()
    } catch (e) {}
    startWatching()
}

const main = async () => {
    const isBuild = process.argv.includes('--build')
    if (isBuild) {
        try {
            await build()
        } catch (e) {}
        return
    }
    
    const isWatch = process.argv.includes('--watch')
    if (isWatch) return await watch()

    console.log('No task specified. Use --build or --watch.')
}

main()
