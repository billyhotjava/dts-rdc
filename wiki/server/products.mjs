// Product spaces: registry (products.json at repo root) and space scaffolding.
import fs from 'node:fs'
import path from 'node:path'
import { config } from './config.mjs'
import { HttpError } from './pages.mjs'
import { readRegistry } from './spaces.mjs'

const REGISTRY = 'products.json'
const SLUG = /^[a-z][a-z0-9-]{1,30}$/

const registryPath = () => path.join(config.repoDir, REGISTRY)

function scaffold(name, description) {
  const docs = `# ${name} · 产品文档

${description || '（产品简介待补充）'}

## 目录规划

| 目录 | 内容 |
|------|------|
| \`architecture/\` | 系统架构与模块边界 |
| \`domain/\` | 业务域与统一语言 |
| \`integration/\` | 集成与接口契约 |
| \`deployment/\` | 部署与运维 |
`
  const worklog = `# ${name} · 工作日志

按 sprint-workflow 规范组织：\`v{版本}/sprint-{N}-{YYYYMM}/features/F{N}-*/T{NN}-*.md\`。
`
  return { docs, worklog }
}

// Validates input, writes the registry and the two README files.
// Returns the repo-relative paths that must be committed.
export function createProduct({ slug, name, description }) {
  slug = String(slug ?? '').trim()
  name = String(name ?? '').trim()
  description = String(description ?? '').trim()
  if (!SLUG.test(slug)) throw new HttpError(400, 'INVALID_SLUG', '标识须为 2–31 位小写字母、数字或连字符，以字母开头')
  if (!name || name.length > 40) throw new HttpError(400, 'INVALID_NAME', '名称不能为空，且不超过 40 个字符')
  if (description.length > 200) throw new HttpError(400, 'INVALID_DESCRIPTION', '简介不超过 200 个字符')

  const registry = readRegistry()
  if (registry.products.some((p) => p.slug === slug)) throw new HttpError(409, 'PRODUCT_EXISTS', `产品标识 ${slug} 已存在`)
  if (registry.products.some((p) => p.name === name)) throw new HttpError(409, 'PRODUCT_EXISTS', `产品名称 ${name} 已存在`)

  const base = `products/${slug}`
  if (fs.existsSync(path.join(config.repoDir, base))) throw new HttpError(409, 'PRODUCT_EXISTS', `目录 ${base} 已存在`)
  // readers need the client role <client>:space-<slug>, granted to a group in Keycloak
  const product = { slug, name, description, docs: `${base}/docs`, worklog: `${base}/worklog`, access: { role: `space-${slug}` } }
  const { docs, worklog } = scaffold(name, description)
  for (const [dir, content] of [[product.docs, docs], [product.worklog, worklog]]) {
    fs.mkdirSync(path.join(config.repoDir, dir), { recursive: true })
    fs.writeFileSync(path.join(config.repoDir, dir, 'README.md'), content)
  }
  const next = { ...registry, products: [...registry.products, product] }
  fs.writeFileSync(registryPath(), JSON.stringify(next, null, 2) + '\n')
  return { product, paths: [REGISTRY, `${product.docs}/README.md`, `${product.worklog}/README.md`] }
}
