import path from 'path'
import fs from 'fs'
import * as esbuild from 'esbuild'
import * as ts from 'typescript'
import * as chokidar from 'chokidar'
import tsconfig from '../tsconfig.json'
import { TextEncoder } from 'util'

const isProduction = process.argv.includes('--env=production')
const entryPoint = path.resolve(__dirname, '../src/index.ts')
const outDir = path.resolve(__dirname, '../dist')
const outfile = path.resolve(outDir, 'index.js')
const externalDependencies = ['readline', 'fs', 'path']

const cleanup = () => {
    try {
        console.log(`    > Cleaning up...`)
        fs.unlinkSync(outfile)
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
    const options: ts.CompilerOptions = {
        ...(tsconfig.compilerOptions as any as ts.CompilerOptions),
        noEmit: true,
        noImplicitAny: true,
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

const bundle = () => {
    console.log('    > Running esbuild...')
    try {
        const environmentOptions: esbuild.BuildOptions = isProduction ? { minify: true } : { sourcemap: 'inline' }
        const result = esbuild.buildSync({
            entryPoints: [entryPoint],
            bundle: true,
            write: false,
            outfile,
            target: 'node10.4',
            external: externalDependencies,
            ...environmentOptions,
        })
        const [ output ] = result.outputFiles
        writeBin(output)
    } catch (e) {
        console.log('        * esbuild finished with errors')
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

const mergeBytes = (a: Uint8Array, b: Uint8Array): Uint8Array => {
    const merged = new Uint8Array(a.length + b.length)
    merged.set(a),
    merged.set(b, a.length)
    return merged
}

const build = () => {
    try {
        console.log('** BUILDING **')
        cleanup()
        createDistDir()
        bundle()
        typeCheck()
        console.log('    ✅ build successful')
    } catch (e) {
        console.log('    🔴 build failed')
    }
}

const watch = () => {
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
            cleanup()
            bundle()
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
        let rebuildTimeout
        chokidar.watch(watchDir, { ignoreInitial: true }).on('all', (event, path) => {
            printSpacesIfNotDebounding()
            console.log(`    > File changed (${event}): ${path}`)
            clearTimeout(rebuildTimeout)
            rebuildTimeout = setTimeout(onChange, 250)
        })
    }

    try {
        build()
    } catch (e) {}
    startWatching()
}

const main = () => {
    const isBuild = process.argv.includes('--build')
    if (isBuild) {
        try {
            build()
        } catch (e) {}
        return
    }
    
    const isWatch = process.argv.includes('--watch')
    if (isWatch) return watch()

    console.log('No task specified. Use --build or --watch.')
}

main()
