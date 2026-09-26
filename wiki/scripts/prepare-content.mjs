// Builds one VitePress source dir per site from the repository (products.json at repo root):
//   .content/portal/        home, search, editor, status, new-product + extras (sandbox)
//   .content/p-<slug>/      product space: index (landing), docs/, worklog/
// Each product is built as its own site (base /p/<slug>/) so that navigation data, page
// chunks and the search index of one product never ship inside another product's pages.
// Emits .vitepress/generated/spaces.json for the VitePress config.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { copyTree } from './content-tree.mjs'

const WIKI_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO_DIR = path.resolve(WIKI_DIR, '..')
const CONTENT_DIR = path.join(WIKI_DIR, '.content')
const GENERATED_DIR = path.join(WIKI_DIR, '.vitepress', 'generated')

export function loadRegistry() {
  const registry = JSON.parse(fs.readFileSync(path.join(REPO_DIR, 'products.json'), 'utf8'))
  if (!Array.isArray(registry.products) || registry.products.length === 0) {
    throw new Error('products.json: "products" must be a non-empty array')
  }
  return { products: registry.products, extras: registry.extras ?? [] }
}

function section(outDir, relDir, destDir, title) {
  if (!fs.existsSync(path.join(REPO_DIR, relDir))) return null
  const node = copyTree(REPO_DIR, outDir, relDir, destDir)
  return node ? { ...node, text: title, collapsed: false } : null
}

function copyPublic(outDir) {
  fs.cpSync(path.join(WIKI_DIR, 'public'), path.join(outDir, 'public'), { recursive: true })
}

function buildProduct(product) {
  const outDir = path.join(CONTENT_DIR, `p-${product.slug}`)
  fs.mkdirSync(outDir, { recursive: true })
  const groups = [
    section(outDir, product.docs, 'docs', '产品文档'),
    section(outDir, product.worklog, 'worklog', '工作日志'),
  ].filter(Boolean)
  fs.writeFileSync(path.join(outDir, 'index.md'), `---
title: ${JSON.stringify(product.name)}
editLink: false
---

# ${product.name}

${product.description || ''}

- [产品文档](./docs/)：架构、设计、集成、部署等稳定文档
- [工作日志](./worklog/)：Sprint / Feature / Task 规划与验收证据
`)
  copyPublic(outDir)
  return { slug: product.slug, name: product.name, sidebar: { '/': [{ text: product.name, link: '/', items: groups }] } }
}

function buildPortal(extras) {
  const outDir = path.join(CONTENT_DIR, 'portal')
  fs.mkdirSync(outDir, { recursive: true })
  const sidebar = {}
  for (const extra of extras) {
    const node = section(outDir, extra.dir, extra.dir, extra.name)
    if (node) sidebar[`/${extra.dir}/`] = [node]
  }
  for (const page of fs.readdirSync(path.join(WIKI_DIR, 'pages'))) {
    fs.copyFileSync(path.join(WIKI_DIR, 'pages', page), path.join(outDir, page === 'home.md' ? 'index.md' : page))
  }
  copyPublic(outDir)
  // editor runtime assets (lute, highlight, themes) are loaded by Vditor from /vendor/vditor/dist
  fs.cpSync(path.join(WIKI_DIR, 'node_modules', 'vditor', 'dist'), path.join(outDir, 'public', 'vendor', 'vditor', 'dist'), { recursive: true })
  return { sidebar }
}

function main() {
  fs.rmSync(CONTENT_DIR, { recursive: true, force: true })
  fs.mkdirSync(GENERATED_DIR, { recursive: true })
  const { products, extras } = loadRegistry()
  const spaces = {
    portal: buildPortal(extras),
    products: products.map(buildProduct),
    extras: extras.map((e) => ({ dir: e.dir, name: e.name })),
  }
  fs.writeFileSync(path.join(GENERATED_DIR, 'spaces.json'), JSON.stringify(spaces, null, 2))
  const pageCount = fs.readdirSync(CONTENT_DIR, { recursive: true }).filter((f) => f.endsWith('.md')).length
  console.log(`[prepare-content] portal + ${products.length} product sites, ${pageCount} pages`)
}

if (import.meta.url === `file://${process.argv[1]}`) main()
