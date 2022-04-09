import { defineConfig } from 'rollup';
import { terser } from "rollup-plugin-terser";
import { babel } from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import eslint from '@rollup/plugin-eslint';
import fs from "fs";

const srcDir = './src';
const distDir = './dist';
const productionMode = !process.env.ROLLUP_WATCH;
const isIE = process.env.BROWSER === 'IE';

export default defineConfig(
    [
        {
            input: `${srcDir}/index.js`,
            output: {
                name: 'CookieConsent',
                file: `${distDir}/cookieconsent.js`,
                format: 'umd',
            },
            plugins: [
                eslint({
                    fix: true,
                    include: ['./src/**'],
                    exclude: ['./src/scss/**']
                }),
                isIE && babel({
                    exclude:'node_modules/**',
                    babelHelpers: 'bundled',
                    configFile: './babel.config.js'
                }),
                productionMode && terser({
                    toplevel: true,
                    format: {
                        quote_style: 1,
                        comments: false
                    },
                    mangle: {
                        properties: {
                            regex: /^_/,
                            keep_quoted: true
                        }
                    },
                    compress: {
                        drop_console: true,
                        passes: 3,
                        pure_funcs: [ '_log']
                    }
                }),
            ]
        },
        ...processStylesIndividually()
    ]
);

function processStylesIndividually (){
    const scssDir = `${srcDir}/scss`;

    return fs.readdirSync(scssDir)
        .filter(fileName => fileName.match(/.*\.(scss|css)$/))
        .map(fileName => {
            return {
                input: `${scssDir}/${fileName}`,
                output: {
                    file: `${distDir}/${fileName.replace('.scss', '.css')}`,
                },
                plugins: postcss({
                    include: `${scssDir}/${fileName}`,
                    extract: true,
                    plugins: [
                        require('postcss-preset-env')({
                            browsers: [
                                'last 1 version',
                                '> 1%',
                                isIE && 'ie >= 8'
                            ],
                            features: {
                                "custom-properties": isIE
                            }
                        }),
                        require('postcss-combine-duplicated-selectors'),
                        require('autoprefixer'),
                        productionMode && require('cssnano')({
                            preset: ["default", {
                                discardComments: {
                                    removeAll: true,
                                }
                            }]
                        })
                    ]
                }),
                onwarn(warning, warn) {
                    if(warning.code === 'FILE_NAME_CONFLICT') return;
                    warn(warning);
                }
            }
        });
}