// Builds the VitePress source dir (.content/) from the repository:
//   - products.json (repo root) lists product spaces; each has a docs and a worklog tree
//   - extra sections (e.g. the sandbox) are rendered without a product
//   - emits .vitepress/generated/{sidebar,products}.json and a home page with product cards
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { copyTree, toUrl } from './content-tree.mjs'

const WIKI_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO_DIR = path.resolve(WIKI_DIR, '..')
const OUT_DIR = path.join(WIKI_DIR, '.content')
const GENERATED_DIR = path.join(WIKI_DIR, '.vitepress', 'generated')

function loadRegistry() {
  const file = path.join(REPO_DIR, 'products.json')
  const registry = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (!Array.isArray(registry.products) || registry.products.length === 0) {
    throw new Error('products.json: "products" must be a non-empty array')
  }
  return { products: registry.products, extras: registry.extras ?? [] }
}

// One tree -> one titled sidebar group; missing directories are tolerated (new products).
function section(relDir, title) {
  if (!fs.existsSync(path.join(REPO_DIR, relDir))) return null
  const node = copyTree(REPO_DIR, OUT_DIR, relDir)
  return node ? { ...node, text: title, collapsed: false } : null
}

function buildProduct(product, sidebar) {
  const groups = [section(product.docs, '产品文档'), section(product.worklog, '工作日志')].filter(Boolean)
  const productSidebar = [{ text: product.name, items: groups }]
  for (const dir of [product.docs, product.worklog]) sidebar[`/${dir}/`] = productSidebar
}

function writeHome(products) {
  const template = fs.readFileSync(path.join(WIKI_DIR, 'pages', 'home.md'), 'utf8')
  const features = products.map((p) => [
    `  - title: ${JSON.stringify(p.name)}`,
    `    details: ${JSON.stringify(p.description || '')}`,
    `    link: ${JSON.stringify(toUrl(p.docs) + '/')}`,
  ].join('\n')).join('\n')
  const newProduct = '  - title: "＋ 新建产品"\n    details: "为新的产品创建文档与工作日志空间"\n    link: "/new-product"'
  fs.writeFileSync(path.join(OUT_DIR, 'index.md'), template.replace('features: []', `features:\n${features}\n${newProduct}`))
}

function main() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.mkdirSync(GENERATED_DIR, { recursive: true })

  const { products, extras } = loadRegistry()
  const sidebar = {}
  for (const product of products) buildProduct(product, sidebar)
  for (const extra of extras) {
    const node = section(extra.dir, extra.name)
    if (node) sidebar[`/${extra.dir}/`] = [node]
  }

  for (const page of fs.readdirSync(path.join(WIKI_DIR, 'pages'))) {
    if (page !== 'home.md') fs.copyFileSync(path.join(WIKI_DIR, 'pages', page), path.join(OUT_DIR, page))
  }
  writeHome(products)
  fs.cpSync(path.join(WIKI_DIR, 'public'), path.join(OUT_DIR, 'public'), { recursive: true })
  // editor runtime assets (lute, highlight, themes) are loaded by Vditor from /vendor/vditor/dist
  fs.cpSync(path.join(WIKI_DIR, 'node_modules', 'vditor', 'dist'), path.join(OUT_DIR, 'public', 'vendor', 'vditor', 'dist'), { recursive: true })

  fs.writeFileSync(path.join(GENERATED_DIR, 'sidebar.json'), JSON.stringify(sidebar, null, 2))
  fs.writeFileSync(path.join(GENERATED_DIR, 'products.json'), JSON.stringify({ products, extras }, null, 2))

  const pageCount = fs.readdirSync(OUT_DIR, { recursive: true }).filter((f) => f.endsWith('.md')).length
  console.log(`[prepare-content] ${products.length} products, ${pageCount} pages -> ${path.relative(REPO_DIR, OUT_DIR)}`)
}

main()
