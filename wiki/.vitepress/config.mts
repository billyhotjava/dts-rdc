import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type DefaultTheme } from 'vitepress'

const REPO_URL = 'https://github.com/billyhotjava/dts-rdc'
const BUILD_SHA = process.env.WIKI_BUILD_SHA ?? 'local'
const BUILD_TIME = process.env.WIKI_BUILD_TIME ?? new Date().toISOString()

const sidebarFile = path.resolve(__dirname, 'generated/sidebar.json')
const sidebar: DefaultTheme.SidebarMulti = fs.existsSync(sidebarFile)
  ? JSON.parse(fs.readFileSync(sidebarFile, 'utf8'))
  : {}

export default defineConfig({
  lang: 'zh-CN',
  title: 'DTS Wiki',
  description: 'DTS 研发 Wiki：架构、规划、设计与测试',
  srcDir: '.content',
  cleanUrls: true,
  // Repository docs reference files in other repos (e.g. PRS/..., AI/...) that are not pages.
  ignoreDeadLinks: true,
  lastUpdated: false,
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]],
  markdown: { lineNumbers: false, breaks: true },
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '产品文档', link: '/docs/' },
      { text: '工作日志', link: '/worklog/' },
      { text: 'Sprint-5', link: '/worklog/v1.0.0/sprint-5-202610/' },
      { text: '搜索', link: '/search' },
    ],
    sidebar,
    outline: { level: [2, 3], label: '本页目录' },
    editLink: {
      // Serialized and executed in the browser: must not reference module-scope variables.
      pattern: ({ frontmatter }) =>
        frontmatter.sourcePath
          ? `https://github.com/billyhotjava/dts-rdc/edit/main/${encodeURI(frontmatter.sourcePath)}`
          : 'https://github.com/billyhotjava/dts-rdc',
      text: '在 GitHub 上编辑此页',
    },
    docFooter: { prev: '上一页', next: '下一页' },
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '回到顶部',
    footer: { message: `构建 ${BUILD_SHA.slice(0, 8)} · ${BUILD_TIME}` },
    socialLinks: [{ icon: 'github', link: REPO_URL }],
  },
})
