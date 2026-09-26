import { h } from 'vue'
import { inBrowser, withBase, type Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import PagefindSearch from './components/PagefindSearch.vue'
import WikiEditor from './components/WikiEditor.vue'
import WikiStatus from './components/WikiStatus.vue'
import NewProduct from './components/NewProduct.vue'
import ProductCards from './components/ProductCards.vue'
import EditThisPage from './components/EditThisPage.vue'
import './custom.css'

declare const __WIKI_PORTAL_PREFIXES__: string[]

// The wiki is several VitePress sites (portal at /, products at /p/<slug>/). The router of
// one site cannot render another site's pages, so any same-origin link that leaves the
// current base (or is marked data-full-nav) becomes a full page load. Links we generate
// also carry target="_self", which the VitePress router never intercepts; this handler
// covers links written by authors in markdown.
function installCrossSiteNavigation() {
  const base = withBase('/')
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as Element | null)?.closest?.('a')
    if (!a || !a.href || (a.target && a.target !== '_self') || a.hasAttribute('download')) return
    const url = new URL(a.href, location.href)
    if (url.origin !== location.origin) return
    const leavesSite = !url.pathname.startsWith(base) || (base === '/' && url.pathname.startsWith('/p/'))
    // "/p/prs/edit?..." or "/p/prs/p/dts/..." = a portal-rooted markdown link that got the base prefix
    const rest = base !== '/' && url.pathname.startsWith(base) ? decodeURI(url.pathname.slice(base.length)) : null
    const portalRooted = rest !== null && __WIKI_PORTAL_PREFIXES__.some((p) => rest === p || rest.startsWith(p.endsWith('/') ? p : `${p}.html`) || (!p.endsWith('/') && rest === `${p}.html`))
    if (!leavesSite && !portalRooted && !a.hasAttribute('data-full-nav')) return
    e.preventDefault()
    e.stopImmediatePropagation()
    const path = portalRooted ? encodeURI(`/${rest}`) : url.pathname
    location.assign(path + url.search + url.hash)
  }, true)
}

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, { 'doc-footer-before': () => h(EditThisPage) }),
  enhanceApp({ app }) {
    app.component('PagefindSearch', PagefindSearch)
    app.component('WikiEditor', WikiEditor)
    app.component('WikiStatus', WikiStatus)
    app.component('NewProduct', NewProduct)
    app.component('ProductCards', ProductCards)
    if (inBrowser) installCrossSiteNavigation()
  },
} satisfies Theme
