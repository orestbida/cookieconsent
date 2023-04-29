import { defineConfig } from 'vite'
import { ViteMinifyPlugin } from 'vite-plugin-minify'
import { ShikiHighlight } from './plugins/shiki-highlighter'

export default defineConfig({
    plugins: [
        await ShikiHighlight({theme: 'github-dark'}),
        ViteMinifyPlugin({})
    ]
})