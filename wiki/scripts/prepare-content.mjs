// Copies ../docs and ../worklog into .content/ for VitePress, normalising what the
// raw repository layout cannot express directly:
//   - README.md becomes index.md (and links to README.md are rewritten)
//   - directories without an index get a generated table of contents
//   - binary attachments (pdf/pptx/images) are served from public/ at the same URL
//   - page bodies are wrapped in ::: v-pre so text like {{x}} is never evaluated by Vue
//   - frontmatter records sourcePath for the "edit on GitHub" link
// It also emits .vitepress/generated/sidebar.json.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const WIKI_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO_DIR = path.resolve(WIKI_DIR, '..')
const OUT_DIR = path.join(WIKI_DIR, '.content')
const GENERATED_DIR = path.join(WIKI_DIR, '.vitepress', 'generated')

const SOURCES = [
  { dir: 'docs', title: '产品文档' },
  { dir: 'worklog', title: '工作日志' },
]
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'])
const DOCUMENT_EXT = new Set(['.pdf', '.pptx', '.docx', '.xlsx'])
const SKIP_NAMES = new Set(['.git', 'node_modules', '.DS_Store'])

const collator = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' })

function extractTitle(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m)
  if (!match) return fallback
  return match[1].replace(/[*_`]/g, '').trim()
}

function splitFrontmatter(markdown) {
  if (!markdown.startsWith('---\n')) return { frontmatter: '', body: markdown }
  const end = markdown.indexOf('\n---', 4)
  if (end === -1) return { frontmatter: '', body: markdown }
  return { frontmatter: markdown.slice(4, end).trim(), body: markdown.slice(end + 4).replace(/^\n/, '') }
}

// Repository docs are plain markdown: text such as `Optional<T>` or `<name>-<version>`
// outside code must not reach the Vue template compiler as HTML. Only '<' is escaped so
// blockquotes ('> ...') keep working.
function escapeAngleBracketsOutsideCode(body) {
  return body
    .split(/(^```[\s\S]*?^```)/m)
    .map((chunk, i) => (i % 2 === 1 ? chunk : chunk
      .split(/(`[^`\n]*`)/)
      .map((part, j) => (j % 2 === 1 ? part : part.replace(/</g, '&lt;')))
      .join('')))
    .join('')
}

function transformMarkdown(markdown, sourcePath) {
  const { frontmatter, body } = splitFrontmatter(markdown)
  const rewritten = escapeAngleBracketsOutsideCode(body)
    .replace(/(\]\([^)\s]*?)README\.md/g, '$1index.md')
  const meta = [frontmatter, `sourcePath: ${JSON.stringify(sourcePath)}`].filter(Boolean).join('\n')
  return `---\n${meta}\n---\n\n::: v-pre\n${rewritten}\n:::\n`
}

function toUrl(relPath) {
  return '/' + relPath.split(path.sep).join('/')
}

// Walks one source directory; returns a sidebar node for it (or null when empty).
function copyTree(relDir) {
  const srcDir = path.join(REPO_DIR, relDir)
  const entries = fs.readdirSync(srcDir, { withFileTypes: true })
    .filter((e) => !SKIP_NAMES.has(e.name))
    .sort((a, b) => collator.compare(a.name, b.name))

  fs.mkdirSync(path.join(OUT_DIR, relDir), { recursive: true })
  const children = []
  let indexTitle = null
  let hasIndex = false

  for (const entry of entries) {
    const rel = path.join(relDir, entry.name)
    if (entry.isDirectory()) {
      const node = copyTree(rel)
      if (node) children.push(node)
      continue
    }
    const ext = path.extname(entry.name).toLowerCase()
    if (ext === '.md') {
      const markdown = fs.readFileSync(path.join(REPO_DIR, rel), 'utf8')
      const isIndex = /^(readme|index)\.md$/i.test(entry.name)
      const outName = isIndex ? 'index.md' : entry.name
      const title = extractTitle(markdown, path.basename(entry.name, '.md'))
      fs.writeFileSync(path.join(OUT_DIR, relDir, outName), transformMarkdown(markdown, rel.split(path.sep).join('/')))
      if (isIndex) {
        hasIndex = true
        indexTitle = title
      } else {
        children.push({ text: title, link: toUrl(path.join(relDir, path.basename(entry.name, '.md'))) })
      }
    } else if (IMAGE_EXT.has(ext)) {
      // next to the markdown so relative image references resolve at build time
      fs.copyFileSync(path.join(REPO_DIR, rel), path.join(OUT_DIR, rel))
    } else if (DOCUMENT_EXT.has(ext)) {
      const target = path.join(OUT_DIR, 'public', rel)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.copyFileSync(path.join(REPO_DIR, rel), target)
      children.push({ text: `📎 ${entry.name}`, link: toUrl(rel), target: '_blank' })
    }
  }

  if (!hasIndex && children.length === 0) return null
  const dirName = path.basename(relDir)
  if (!hasIndex) {
    const lines = children.map((c) => `- [${c.text}](${c.link})`).join('\n')
    fs.writeFileSync(path.join(OUT_DIR, relDir, 'index.md'),
      `---\ngenerated: true\neditLink: false\n---\n\n# ${dirName}\n\n${lines}\n`)
  }
  return {
    text: indexTitle ?? dirName,
    link: toUrl(relDir) + '/',
    collapsed: true,
    items: children.length ? children : undefined,
  }
}

function main() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.mkdirSync(GENERATED_DIR, { recursive: true })

  const sidebar = {}
  for (const source of SOURCES) {
    if (!fs.existsSync(path.join(REPO_DIR, source.dir))) {
      console.warn(`[prepare-content] skip missing source: ${source.dir}`)
      continue
    }
    const node = copyTree(source.dir)
    if (node) sidebar[`/${source.dir}/`] = [{ ...node, text: source.title, collapsed: false }]
  }
  for (const page of fs.readdirSync(path.join(WIKI_DIR, 'pages'))) {
    fs.copyFileSync(path.join(WIKI_DIR, 'pages', page), path.join(OUT_DIR, page === 'home.md' ? 'index.md' : page))
  }
  fs.cpSync(path.join(WIKI_DIR, 'public'), path.join(OUT_DIR, 'public'), { recursive: true })
  // editor runtime assets (lute, highlight, themes) are loaded by Vditor from /vendor/vditor/dist
  fs.cpSync(path.join(WIKI_DIR, 'node_modules', 'vditor', 'dist'), path.join(OUT_DIR, 'public', 'vendor', 'vditor', 'dist'), { recursive: true })
  fs.writeFileSync(path.join(GENERATED_DIR, 'sidebar.json'), JSON.stringify(sidebar, null, 2))

  const pageCount = fs.readdirSync(OUT_DIR, { recursive: true }).filter((f) => f.endsWith('.md')).length
  console.log(`[prepare-content] ${pageCount} pages -> ${path.relative(REPO_DIR, OUT_DIR)}`)
}

main()
