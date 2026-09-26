// Copies one repository directory tree into the VitePress source dir, normalising what the
// raw layout cannot express directly:
//   - README.md becomes index.md (and links to README.md are rewritten)
//   - directories without an index get a generated table of contents
//   - every directory index ends with a "new page here" link to the in-site editor
//   - images sit next to the markdown; office/pdf documents are served from public/
//   - page bodies are wrapped in ::: v-pre so text like {{x}} is never evaluated by Vue
//   - frontmatter records sourcePath for the edit link
import fs from 'node:fs'
import path from 'node:path'

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'])
const DOCUMENT_EXT = new Set(['.pdf', '.pptx', '.docx', '.xlsx'])
const SKIP_NAMES = new Set(['.git', 'node_modules', '.DS_Store'])
const collator = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' })

const posix = (p) => p.split(path.sep).join('/')
export const toUrl = (relPath) => '/' + posix(relPath)

function extractTitle(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m)
  return match ? match[1].replace(/[*_`]/g, '').trim() : fallback
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

// Raw HTML so VitePress does not prefix the product base: the editor lives on the portal.
const newPageLink = (relDir) =>
  `\n\n---\n\n<a class="wiki-new-page" href="/edit?new=1&amp;dir=${encodeURIComponent(posix(relDir))}" target="_self" data-full-nav>＋ 在此目录新建页面</a>\n`

function transformMarkdown(markdown, sourcePath, { isIndex, relDir }) {
  const { frontmatter, body } = splitFrontmatter(markdown)
  const rewritten = escapeAngleBracketsOutsideCode(body).replace(/(\]\([^)\s]*?)README\.md/g, '$1index.md')
  const meta = [frontmatter, `sourcePath: ${JSON.stringify(sourcePath)}`].filter(Boolean).join('\n')
  return `---\n${meta}\n---\n\n::: v-pre\n${rewritten}\n:::\n${isIndex ? newPageLink(relDir) : ''}`
}

// Copies <repo>/<relDir> into <out>/<destDir>; returns a sidebar node (or null when empty).
// Sidebar links are relative to the destination site's base; sourcePath/edit links keep the
// repository path.
export function copyTree(repoDir, outDir, relDir, destDir = relDir) {
  const entries = fs.readdirSync(path.join(repoDir, relDir), { withFileTypes: true })
    .filter((e) => !SKIP_NAMES.has(e.name))
    .sort((a, b) => collator.compare(a.name, b.name))

  fs.mkdirSync(path.join(outDir, destDir), { recursive: true })
  const children = []
  let indexTitle = null

  for (const entry of entries) {
    const rel = path.join(relDir, entry.name)
    const dest = path.join(destDir, entry.name)
    if (entry.isDirectory()) {
      const node = copyTree(repoDir, outDir, rel, dest)
      if (node) children.push(node)
      continue
    }
    const ext = path.extname(entry.name).toLowerCase()
    if (ext === '.md') {
      const markdown = fs.readFileSync(path.join(repoDir, rel), 'utf8')
      const isIndex = /^(readme|index)\.md$/i.test(entry.name)
      const title = extractTitle(markdown, path.basename(entry.name, '.md'))
      fs.writeFileSync(path.join(outDir, destDir, isIndex ? 'index.md' : entry.name),
        transformMarkdown(markdown, posix(rel), { isIndex, relDir }))
      if (isIndex) indexTitle = title
      else children.push({ text: title, link: toUrl(path.join(destDir, path.basename(entry.name, '.md'))) })
    } else if (IMAGE_EXT.has(ext)) {
      fs.copyFileSync(path.join(repoDir, rel), path.join(outDir, dest))
    } else if (DOCUMENT_EXT.has(ext)) {
      const target = path.join(outDir, 'public', dest)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.copyFileSync(path.join(repoDir, rel), target)
      children.push({ text: `📎 ${entry.name}`, link: toUrl(dest), target: '_blank' })
    }
  }

  if (indexTitle === null && children.length === 0) return null
  const dirName = path.basename(relDir)
  if (indexTitle === null) {
    const lines = children.map((c) => `- [${c.text}](${c.link})`).join('\n')
    fs.writeFileSync(path.join(outDir, destDir, 'index.md'),
      `---\ngenerated: true\neditLink: false\n---\n\n# ${dirName}\n\n${lines}\n${newPageLink(relDir)}`)
  }
  return { text: indexTitle ?? dirName, link: toUrl(destDir) + '/', collapsed: true, items: children.length ? children : undefined }
}
