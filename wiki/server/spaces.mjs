// Spaces = products (docs + worklog, access-controlled) and extras (e.g. sandbox, open to all
// signed-in readers). Maps repository paths and site URLs to spaces and decides access.
//
// Site layout: product <slug> is published under /p/<slug>/ with its trees at
// /p/<slug>/docs/... and /p/<slug>/worklog/...; extras keep their own path (/<dir>/...).
// Access to a product requires the client role  <client>:space-<slug>  (or wiki admin).
import fs from 'node:fs'
import path from 'node:path'
import { config } from './config.mjs'

export function readRegistry() {
  return JSON.parse(fs.readFileSync(path.join(config.repoDir, 'products.json'), 'utf8'))
}

export const spaceRole = (product) => product.access?.role ?? `space-${product.slug}`

export function canAccessProduct(user, product) {
  return user.isAdmin || user.hasRole(`${config.clientId}:${spaceRole(product)}`)
}

const under = (rel, dir) => rel === dir || rel.startsWith(`${dir}/`)

// Repository-relative path -> { kind, product?, extra?, tree?, sub? } or null.
export function spaceOfPath(rel, registry = readRegistry()) {
  for (const product of registry.products) {
    for (const tree of ['docs', 'worklog']) {
      const dir = product[tree]
      if (under(rel, dir)) return { kind: 'product', product, tree, sub: rel.slice(dir.length).replace(/^\//, '') }
    }
  }
  for (const extra of registry.extras ?? []) {
    if (under(rel, extra.dir)) return { kind: 'extra', extra, sub: rel.slice(extra.dir.length).replace(/^\//, '') }
  }
  return null
}

export function canAccessPath(user, rel, registry = readRegistry()) {
  const space = spaceOfPath(rel, registry)
  if (!space) return false
  return space.kind === 'extra' || canAccessProduct(user, space.product)
}

// Site URL (path part) -> product slug when it is inside a product space.
export function productSlugOfUrl(urlPath) {
  const m = /^\/p\/([a-z][a-z0-9-]*)(\/|$)/.exec(urlPath)
  return m ? m[1] : null
}

// Repository path of a markdown page -> its published URL.
export function siteUrl(rel, registry = readRegistry()) {
  const space = spaceOfPath(rel, registry)
  if (!space) return null
  const page = space.sub.replace(/\.md$/i, '').replace(/(^|\/)(README|index)$/i, '$1')
  const base = space.kind === 'product' ? `/p/${space.product.slug}/${space.tree}` : `/${space.extra.dir}`
  return encodeURI(page ? `${base}/${page}` : `${base}/`)
}

export function visibleProducts(user, registry = readRegistry()) {
  return registry.products
    .filter((p) => canAccessProduct(user, p))
    .map((p) => ({ slug: p.slug, name: p.name, description: p.description, url: `/p/${p.slug}/` }))
}
