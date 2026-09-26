import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import PagefindSearch from './components/PagefindSearch.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PagefindSearch', PagefindSearch)
  },
} satisfies Theme
