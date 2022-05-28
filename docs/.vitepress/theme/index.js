// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import CustomBlock from "../../components/CustomBlock.vue";


export default {
    ...DefaultTheme,
    enhanceApp({ app }) {
        app.component('CustomBlock', CustomBlock);
    }
}