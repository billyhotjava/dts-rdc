// Unit tests for space mapping and access decisions.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { canAccessPath, canAccessProduct, productSlugOfUrl, siteUrl, spaceOfPath, visibleProducts } from './spaces.mjs'

const registry = {
  products: [
    { slug: 'dts', name: 'DTS 平台', description: '', docs: 'docs', worklog: 'worklog' },
    { slug: 'prs', name: 'PRS', description: '', docs: 'products/prs/docs', worklog: 'products/prs/worklog' },
  ],
  extras: [{ dir: 'sandbox', name: '练习区' }],
}
const user = (roles, isAdmin = false) => ({ isAdmin, hasRole: (r) => roles.includes(r) })
const prsOnly = user(['dts-wiki:space-prs'])

test('maps repository paths to spaces', () => {
  assert.equal(spaceOfPath('docs/adr/x.md', registry).product.slug, 'dts')
  assert.equal(spaceOfPath('worklog/v1.0.0/README.md', registry).tree, 'worklog')
  assert.equal(spaceOfPath('products/prs/docs/a/b.md', registry).sub, 'a/b.md')
  assert.equal(spaceOfPath('sandbox/编辑器练习.md', registry).kind, 'extra')
  assert.equal(spaceOfPath('docsx/a.md', registry), null, 'prefix must match whole segment')
  assert.equal(spaceOfPath('deploy/x.md', registry), null)
})

test('access: space role, admin bypass, extras open', () => {
  assert.equal(canAccessProduct(prsOnly, registry.products[1]), true)
  assert.equal(canAccessProduct(prsOnly, registry.products[0]), false)
  assert.equal(canAccessProduct(user([], true), registry.products[0]), true)
  assert.equal(canAccessPath(prsOnly, 'docs/a.md', registry), false)
  assert.equal(canAccessPath(prsOnly, 'products/prs/worklog/x.md', registry), true)
  assert.equal(canAccessPath(user([]), 'sandbox/a.md', registry), true)
  assert.equal(canAccessPath(user([], true), 'deploy/secret.md', registry), false, 'outside any space')
  assert.deepEqual(visibleProducts(prsOnly, registry).map((p) => p.slug), ['prs'])
})

test('site urls', () => {
  assert.equal(siteUrl('docs/README.md', registry), '/p/dts/docs/')
  assert.equal(siteUrl('worklog/v1.0.0/sprint-queue.md', registry), '/p/dts/worklog/v1.0.0/sprint-queue')
  assert.equal(siteUrl('products/prs/docs/a/index.md', registry), '/p/prs/docs/a/')
  assert.equal(siteUrl('sandbox/编辑器练习.md', registry), encodeURI('/sandbox/编辑器练习'))
  assert.equal(productSlugOfUrl('/p/prs/docs/x'), 'prs')
  assert.equal(productSlugOfUrl('/p/prs'), 'prs')
  assert.equal(productSlugOfUrl('/sandbox/x'), null)
  assert.equal(productSlugOfUrl('/p/../etc'), null)
})
