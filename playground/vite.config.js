import { defineConfig } from 'vite'
import { ViteMinifyPlugin } from 'vite-plugin-minify'

export default defineConfig({
    plugins: [
        ViteMinifyPlugin({})
    ]
})