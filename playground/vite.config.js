import { defineConfig } from 'vite';
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import { ShikiHighlight } from './plugins/shiki-highlighter';

export default defineConfig({

    plugins: [
        await ShikiHighlight({theme: 'github-dark'}),
        ViteMinifyPlugin({})
    ],
    build: {
        minify: 'terser',
        terserOptions: {
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
                drop_console: true
            }
        }
    },
});