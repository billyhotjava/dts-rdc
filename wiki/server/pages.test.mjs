// Unit tests for content path validation, optimistic concurrency and image storage.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'wiki-pages-'))
process.env.REPO_DIR = repo
const { resolveContentPath, readPage, writePage, saveImage, HttpError } = await import('./pages.mjs')

const md = { extensions: ['.md'] }

test('accepts markdown under editable roots and normalises the path', () => {
  assert.equal(resolveContentPath('/worklog/v1/./a.md', md), 'worklog/v1/a.md')
  assert.equal(resolveContentPath('docs\\adr\\x.md', md), 'docs/adr/x.md')
})

test('rejects traversal, foreign roots, hidden paths and wrong extensions', () => {
  for (const bad of ['../etc/passwd.md', 'worklog/../../x.md', 'wiki/x.md', 'deploy/a.md', 'worklog/.git/x.md', 'worklog/a.sh', 'worklog', '', null]) {
    assert.throws(() => resolveContentPath(bad, md), HttpError, `should reject ${bad}`)
  }
})

test('create then edit with matching baseSha succeeds; stale baseSha is a conflict', () => {
  const rel = 'worklog/t/page.md'
  const sha1 = writePage(rel, '# v1', { create: true })
  assert.equal(readPage(rel).sha, sha1)
  assert.throws(() => writePage(rel, '# again', { create: true }), (e) => e.code === 'PAGE_EXISTS')
  const sha2 = writePage(rel, '# v2', { baseSha: sha1 })
  assert.notEqual(sha2, sha1)
  assert.throws(() => writePage(rel, '# v3', { baseSha: sha1 }), (e) => e.code === 'EDIT_CONFLICT' && e.currentSha === sha2)
})

test('editing a missing page is 404', () => {
  assert.throws(() => writePage('docs/none.md', 'x', { baseSha: 'abc' }), (e) => e.status === 404)
})

test('images are stored under the page assets dir with a relative link', () => {
  const saved = saveImage('worklog/t/page.md', 'image/png', Buffer.from([0x89, 0x50]))
  assert.match(saved.rel, /^worklog\/t\/assets\/\d{14}-[0-9a-f]{6}\.png$/)
  assert.equal(saved.link, `./assets/${path.basename(saved.rel)}`)
  assert.ok(fs.existsSync(path.join(repo, saved.rel)))
  assert.throws(() => saveImage('worklog/t/page.md', 'image/svg+xml', Buffer.from('<svg/>')), (e) => e.status === 415)
  assert.throws(() => saveImage('worklog/t/page.md', 'image/png', Buffer.alloc(0)), (e) => e.code === 'EMPTY_UPLOAD')
})
