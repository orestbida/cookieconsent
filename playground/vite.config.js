import { defineConfig } from 'vite'
import { ViteMinifyPlugin } from 'vite-plugin-minify'
import removeConsole from 'vite-plugin-remove-console';

export default defineConfig({
    plugins: [
        ViteMinifyPlugin({}),
        removeConsole()
    ]
})