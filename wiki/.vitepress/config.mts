// One config for every site of the wiki; WIKI_SPACE selects which one is built:
//   WIKI_SPACE=portal   -> base /,           sources .content/portal
//   WIKI_SPACE=<slug>   -> base /p/<slug>/,  sources .content/p-<slug>
// Product sites carry only their own sidebar, so page data never leaks across products.
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type DefaultTheme } from 'vitepress'

const REPO_URL = 'https://github.com/billyhotjava/dts-rdc'
const PUBLIC_URL = process.env.WIKI_PUBLIC_URL ?? 'https://wiki.yuzhicloud.com'
const SSO_LOGOUT = 'https://sso.yuzhicloud.com/realms/yuzhicloud/protocol/openid-connect/logout'
  + `?client_id=dts-wiki&post_logout_redirect_uri=${encodeURIComponent(PUBLIC_URL + '/')}`
const LOGOUT_URL = `${PUBLIC_URL}/oauth2/sign_out?rd=${encodeURIComponent(SSO_LOGOUT)}`
const BUILD_SHA = process.env.WIKI_BUILD_SHA ?? 'local'
const BUILD_TIME = process.env.WIKI_BUILD_TIME ?? new Date().toISOString()

interface Spaces {
  portal: { sidebar: DefaultTheme.SidebarMulti }
  products: { slug: string; name: string; sidebar: DefaultTheme.SidebarMulti }[]
  extras: { dir: string; name: string }[]
}
const spacesFile = path.resolve(__dirname, 'generated', 'spaces.json')
const spaces: Spaces = fs.existsSync(spacesFile)
  ? JSON.parse(fs.readFileSync(spacesFile, 'utf8'))
  : { portal: { sidebar: {} }, products: [], extras: [] }

const SPACE = process.env.WIKI_SPACE ?? 'portal'
const product = spaces.products.find((p) => p.slug === SPACE)
if (SPACE !== 'portal' && !product) throw new Error(`unknown WIKI_SPACE ${SPACE}`)

// Links to portal pages: plain paths on the portal, absolute URLs inside product sites
// (VitePress would otherwise prefix them with the product base).
const portal = (p: string) => (product ? `${PUBLIC_URL}${p}` : p)
const outside = product ? { target: '_self' } : {}

const nav: DefaultTheme.NavItem[] = [
  { text: '首页', link: portal('/'), ...outside },
  ...(product ? [{ text: product.name, link: '/' }] : []),
  { text: '搜索', link: portal('/search'), ...outside },
  {
    text: '更多',
    items: [
      ...spaces.extras.map((e) => ({ text: e.name, link: portal(`/${e.dir}/`), ...outside })),
      { text: '发布状态', link: portal('/status'), ...outside },
      { text: '新建产品', link: portal('/new-product'), ...outside },
      { text: '退出登录', link: LOGOUT_URL, target: '_self' },
    ],
  },
]

export default defineConfig({
  lang: 'zh-CN',
  title: product ? `${product.name} · DTS Wiki` : 'DTS Wiki',
  description: 'DTS 研发 Wiki：架构、规划、设计与测试',
  base: product ? `/p/${product.slug}/` : '/',
  srcDir: product ? `.content/p-${product.slug}` : '.content/portal',
  outDir: product ? `.vitepress/dist/p/${product.slug}` : '.vitepress/dist',
  cacheDir: `.vitepress/cache/${SPACE}`,
  cleanUrls: true,
  // Repository docs reference files in other repos (e.g. PRS/..., AI/...) that are not pages.
  ignoreDeadLinks: true,
  lastUpdated: false,
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]],
  markdown: { lineNumbers: false, breaks: true },
  vite: {
    // Portal-rooted path prefixes; inside a product site VitePress prefixes absolute markdown
    // links with the product base, and the click handler undoes that for these prefixes.
    define: {
      __WIKI_PORTAL_PREFIXES__: JSON.stringify(['edit', 'search', 'status', 'new-product', 'p/', ...spaces.extras.map((e) => `${e.dir}/`)]),
    },
  },
  themeConfig: {
    siteTitle: product ? product.name : 'DTS Wiki',
    logoLink: product ? { link: `${PUBLIC_URL}/`, target: '_self' } : '/',
    nav,
    sidebar: product ? product.sidebar : spaces.portal.sidebar,
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一页', next: '下一页' },
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '回到顶部',
    footer: { message: `构建 ${BUILD_SHA.slice(0, 8)} · ${BUILD_TIME}` },
    socialLinks: [{ icon: 'github', link: REPO_URL }],
  },
})
