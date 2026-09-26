// Unit tests for product registry and space scaffolding.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'wiki-products-'))
process.env.REPO_DIR = repo
fs.writeFileSync(path.join(repo, 'products.json'), JSON.stringify({
  products: [{ slug: 'dts', name: 'DTS 平台', description: '', docs: 'docs', worklog: 'worklog' }],
  extras: [{ dir: 'sandbox', name: '练习区' }],
}))
const { createProduct, readRegistry } = await import('./products.mjs')

test('creates registry entry and both space READMEs', () => {
  const { product, paths } = createProduct({ slug: 'metro', name: '地铁运维', description: '轨交运维' })
  assert.equal(product.docs, 'products/metro/docs')
  assert.deepEqual(paths, ['products.json', 'products/metro/docs/README.md', 'products/metro/worklog/README.md'])
  for (const p of paths.slice(1)) assert.ok(fs.existsSync(path.join(repo, p)))
  const reg = readRegistry()
  assert.equal(reg.products.length, 2)
  assert.deepEqual(reg.extras, [{ dir: 'sandbox', name: '练习区' }], 'extras preserved')
  assert.match(fs.readFileSync(path.join(repo, 'products/metro/docs/README.md'), 'utf8'), /^# 地铁运维 · 产品文档/)
})

test('rejects invalid slug, empty name and duplicates', () => {
  for (const slug of ['A', 'x', '1abc', 'has space', 'a/../b', 'toolongtoolongtoolongtoolongtool']) {
    assert.throws(() => createProduct({ slug, name: 'n' }), (e) => e.code === 'INVALID_SLUG', slug)
  }
  assert.throws(() => createProduct({ slug: 'ok-name', name: ' ' }), (e) => e.code === 'INVALID_NAME')
  assert.throws(() => createProduct({ slug: 'dts', name: '另一个' }), (e) => e.code === 'PRODUCT_EXISTS')
  assert.throws(() => createProduct({ slug: 'other', name: 'DTS 平台' }), (e) => e.code === 'PRODUCT_EXISTS')
})
