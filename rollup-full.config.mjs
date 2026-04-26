import path from 'path';
import { defineConfig } from 'rollup';
import terser from "@rollup/plugin-terser";
import postcssCombineDuplicatedSelectors from 'postcss-combine-duplicated-selectors';
import cssnanoPlugin from 'cssnano';
import postcss from 'postcss';
import eslint from '@rollup/plugin-eslint';
import * as sass from 'sass';
import pkg from './package.json' with { type: "json"};

const srcDir = './src';
const distDir = './dist';
const cssComponentsDir = `${distDir}/css-components`;
const input = `${srcDir}/index.js`;
const productionMode = !process.env.ROLLUP_WATCH;

export const banner = `/*!
* CookieConsent ${pkg.version}
* ${pkg.repository.url}
* Author ${pkg.author}
* Released under the ${pkg.license} License
*/
`;

function scssPlugin(postcssPlugins) {
    const cssMap = new Map();

    return {
        name: 'scss',
        transform(code, id) {
            if (!/\.(scss|sass)$/.test(id)) return null;
            const { css } = sass.compile(id);
            cssMap.set(id, css);
            return { code: 'export default "";', map: { mappings: '' } };
        },
        async generateBundle(outputOptions, bundle) {
            if (!cssMap.size) return;

            const css = [...cssMap.values()].join('\n');
            const processed = await postcss(postcssPlugins.filter(Boolean)).process(css, { from: undefined });

            const outFile = outputOptions.file;
            const fileName = path.basename(outFile);

            for (const key of Object.keys(bundle)) {
                delete bundle[key];
            }

            this.emitFile({ type: 'asset', fileName, source: processed.css });
            cssMap.clear();
        }
    };
}

const cssComponents = [
    [
        'core/_base.scss',
        'base.css'
    ],
    [
        'core/components/_consent-modal.scss',
        'consent-modal.css'
    ],
    [
        'core/components/_preferences-modal.scss',
        'preferences-modal.css'
    ],
    [
        'abstracts/_dark-color-scheme.scss',
        'dark-scheme.css'
    ],
    [
        'abstracts/_light-color-scheme.scss',
        'light-scheme.css'
    ]
];

const postcssPlugins = [
    postcssCombineDuplicatedSelectors(),
    productionMode && cssnanoPlugin({
        preset: ["default", {
            discardComments: {
                removeAll: true,
            }
        }]
    })
];

const cssComponentsRollup = cssComponents.map(component => {
    const src = `${srcDir}/scss/${component[0]}`;
    const dst = `${cssComponentsDir}/${component[1]}`;

    return {
        input: src,
        output: {
            file: dst,
        },
        plugins: scssPlugin(postcssPlugins)
    };
});

export const terserPlugin = terser({
    toplevel: true,
    format: {
        quote_style: 1,
        comments: /^!/
    },
    mangle: {
        properties: {
            regex: /^_/,
            reserved: ['__esModule', '_ccRun'],
            keep_quoted: true
        }
    },
    compress: {
        passes: 3,
        pure_funcs: [ 'debug', 'console.log']
    }
});

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
                productionMode && terserPlugin,
            ]
        },
        {
            input: `${srcDir}/scss/index.scss`,
            output: {
                file: `${distDir}/cookieconsent.css`,
            },
            plugins: scssPlugin(postcssPlugins)
        },
        ...cssComponentsRollup
    ]
);
