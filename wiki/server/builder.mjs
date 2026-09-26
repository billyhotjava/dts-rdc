// Builds the static site from the working repository HEAD and publishes it atomically:
//   <site>/releases/<sha>@<epoch>  +  <site>/current -> releases/<name>
// node_modules is cached per package-lock hash and moved in/out of the build tree.
import { spawn } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { config } from './config.mjs'
import { headSha } from './git.mjs'

const workDir = path.join(config.cacheDir, 'work')
const srcDir = path.join(workDir, 'src')

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts })
    let tail = ''
    const keep = (d) => { tail = (tail + d).slice(-4000) }
    child.stdout.on('data', keep)
    child.stderr.on('data', keep)
    child.on('error', reject)
    child.on('close', (code) => (code === 0 ? resolve(tail) : reject(new Error(`${cmd} exited ${code}: ${tail}`))))
  })
}

export function currentLiveSha() {
  try {
    return path.basename(fs.readlinkSync(path.join(config.siteDir, 'current'))).split('@')[0]
  } catch {
    return null
  }
}

async function extractSources(sha) {
  fs.rmSync(srcDir, { recursive: true, force: true })
  fs.mkdirSync(srcDir, { recursive: true })
  await run('sh', ['-c', `git -C "${config.repoDir}" archive ${sha} docs worklog wiki | tar -x -C "${srcDir}"`])
}

async function withCachedNodeModules(wikiDir, fn) {
  const lock = fs.readFileSync(path.join(wikiDir, 'package-lock.json'))
  const key = crypto.createHash('sha256').update(lock).digest('hex').slice(0, 16)
  const cached = path.join(config.cacheDir, `node_modules-${key}`)
  const target = path.join(wikiDir, 'node_modules')
  if (fs.existsSync(cached)) {
    fs.renameSync(cached, target)
  } else {
    await run('npm', ['ci', '--no-audit', '--no-fund', '--loglevel=error'], {
      cwd: wikiDir, env: { ...process.env, npm_config_cache: path.join(config.cacheDir, 'npm') },
    })
  }
  try {
    return await fn()
  } finally {
    for (const old of fs.readdirSync(config.cacheDir).filter((n) => n.startsWith('node_modules-'))) {
      fs.rmSync(path.join(config.cacheDir, old), { recursive: true, force: true })
    }
    if (fs.existsSync(target)) fs.renameSync(target, cached)
  }
}

function publish(sha, distDir) {
  const releases = path.join(config.siteDir, 'releases')
  fs.mkdirSync(releases, { recursive: true })
  const name = `${sha}@${Math.floor(Date.now() / 1000)}`
  fs.cpSync(distDir, path.join(releases, `${name}.tmp`), { recursive: true })
  fs.renameSync(path.join(releases, `${name}.tmp`), path.join(releases, name))
  const link = path.join(config.siteDir, 'current.tmp')
  fs.rmSync(link, { force: true })
  fs.symlinkSync(`releases/${name}`, link)
  fs.renameSync(link, path.join(config.siteDir, 'current'))
  pruneReleases(releases, name)
}

function pruneReleases(releases, live) {
  const entries = fs.readdirSync(releases)
    .filter((n) => n !== live)
    .map((n) => ({ n, t: fs.statSync(path.join(releases, n)).mtimeMs }))
    .sort((a, b) => b.t - a.t)
  for (const { n } of entries.slice(Math.max(config.keepReleases - 1, 0))) {
    fs.rmSync(path.join(releases, n), { recursive: true, force: true })
  }
}

export async function buildAndPublish() {
  const sha = await headSha()
  await extractSources(sha)
  const wikiDir = path.join(srcDir, 'wiki')
  await withCachedNodeModules(wikiDir, () => run('npm', ['run', 'build', '--silent'], {
    cwd: wikiDir,
    env: {
      ...process.env,
      WIKI_BUILD_SHA: sha,
      WIKI_BUILD_TIME: new Date().toLocaleString('zh-CN', { hour12: false }),
    },
  }))
  publish(sha, path.join(wikiDir, '.vitepress', 'dist'))
  return sha
}
