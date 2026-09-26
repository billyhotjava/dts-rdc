// Full site build: prepare sources, build the portal and every product site, index search.
//   dist/                 portal (base /)          + dist/pagefind      (extras only)
//   dist/p/<slug>/        product site (base /p/<slug>/) + its own pagefind index
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const WIKI_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(WIKI_DIR, '.vitepress', 'dist')
const bin = (name) => path.join(WIKI_DIR, 'node_modules', '.bin', name)
const EXCLUDE = '.VPNav,.VPSidebar,.VPLocalNav,.aside,.VPDocFooter,.VPFooter,.wiki-edit-link'

function run(cmd, args, env = {}) {
  execFileSync(cmd, args, { cwd: WIKI_DIR, stdio: 'inherit', env: { ...process.env, ...env } })
}

run('node', ['scripts/prepare-content.mjs'])
const spaces = JSON.parse(fs.readFileSync(path.join(WIKI_DIR, '.vitepress', 'generated', 'spaces.json'), 'utf8'))

run(bin('vitepress'), ['build', '.'], { WIKI_SPACE: 'portal' })
for (const product of spaces.products) {
  run(bin('vitepress'), ['build', '.'], { WIKI_SPACE: product.slug })
  run(bin('pagefind'), ['--site', path.join(DIST, 'p', product.slug), '--output-subdir', 'pagefind',
    '--exclude-selectors', EXCLUDE, '--quiet'])
}
// portal index covers only the extras; product pages under p/ must never enter it
const portalGlob = spaces.extras.length ? `{${spaces.extras.map((e) => `${e.dir}/**/*.html`).join(',')}}` : 'index.html'
run(bin('pagefind'), ['--site', DIST, '--glob', portalGlob, '--output-subdir', 'pagefind', '--exclude-selectors', EXCLUDE, '--quiet'])
console.log(`[build] portal + ${spaces.products.length} product sites -> ${path.relative(WIKI_DIR, DIST)}`)
