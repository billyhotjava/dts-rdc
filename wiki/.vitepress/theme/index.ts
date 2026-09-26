import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import PagefindSearch from './components/PagefindSearch.vue'
import WikiEditor from './components/WikiEditor.vue'
import WikiStatus from './components/WikiStatus.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PagefindSearch', PagefindSearch)
    app.component('WikiEditor', WikiEditor)
    app.component('WikiStatus', WikiStatus)
  },
} satisfies Theme
