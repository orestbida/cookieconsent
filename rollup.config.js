import { defineConfig } from 'rollup';
import { terser } from "rollup-plugin-terser";
import { babel } from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import eslint from '@rollup/plugin-eslint';
import pkg from './package.json';

const srcDir = './src';
const distDir = './dist';
const input = `${srcDir}/index.js`;
const productionMode = !process.env.ROLLUP_WATCH;
const isIE = process.env.BROWSER === 'IE';

const banner = `/*!
* CookieConsent ${pkg.version}
* ${pkg.repository.url}
* Author ${pkg.author}
* Released under the ${pkg.license} License
*/
`;

export default defineConfig(
    [
        {
            input: input,
            output: [
                {
                    file: pkg.main,
                    format: 'umd',
                    name: 'CookieConsent',
                    banner: banner
                },
                {
                    file: pkg.module,
                    format: "esm",
                    exports: "named",
                    banner: banner
                }
            ],
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
                        comments: /^!/
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
        {
            input: `${srcDir}/scss/index.scss`,
            output: {
                file: `${distDir}/cookieconsent.css`,
            },
            plugins: postcss({
                extract: true,
                plugins: [
                    require('postcss-preset-env')({
                        browsers: [
                            'last 1 version',
                            '> 1%',
                            isIE && 'ie >= 10'
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
    ]
);