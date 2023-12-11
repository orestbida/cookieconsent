import { promises as fs } from 'fs'
import path from 'path'
import { defineConfig } from 'rollup';
import { banner, terserPlugin } from './rollup-full.config.mjs'

const replacePattern = /\/\/{{START: GUI}}[\s\S]*?\/\/{{END: GUI}}/g;

/**
 * @param {string} srcFilePath
 * @param {string} dstFilePath
 */
const copyCleanedFile = async (srcFilePath, dstFilePath) => {
    if(path.extname(srcFilePath) === '.js'){
        const content = await fs.readFile(srcFilePath, 'utf8');
        const strippedFileContent = content.replaceAll(replacePattern, '');
        fs.writeFile(dstFilePath, strippedFileContent, 'utf8');
    } else {
        fs.copyFile(srcFilePath, dstFilePath);
    }
}

/**
 * https://stackoverflow.com/a/68552726
 * @param {string} src
 * @param {string} dest
 */
const copyDirectory = async (src, dest) => {
    const [entries] = await Promise.all([
        fs.readdir(src, { withFileTypes: true }),
        fs.mkdir(dest, { recursive: true }),
    ])

    await Promise.all(
        entries.map((entry) => {
            const srcPath = path.join(src, entry.name)
            const destPath = path.join(dest, entry.name)
            return entry.isDirectory()
                ? copyDirectory(srcPath, destPath)
                : copyCleanedFile(srcPath, destPath)
        })
    )
}

await copyDirectory('./src', './src_tmp');

const distDir = './dist/core'
const fileName = 'cookieconsent-core';

export default defineConfig(
    [
        {
            input: './src_tmp/index.js',
            output: [
                {
                    file: `${distDir}/${fileName}.umd.js`,
                    format: 'umd',
                    name: 'CookieConsent',
                    banner: banner
                },
                {
                    file: `${distDir}/${fileName}.esm.js`,
                    format: 'esm',
                    exports: 'named',
                    banner: banner
                }
            ],
            plugins: [
                terserPlugin
            ]
        },
    ]
);