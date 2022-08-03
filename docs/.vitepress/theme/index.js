// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import './custom.css'


export default {
    ...DefaultTheme,
    enhanceApp({ app }) {
        //app.component('CustomBlock', CustomBlock);
    }
}