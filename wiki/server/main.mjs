// DTS wiki API: page editing, image upload, build/publish and git sync.
// Runs behind oauth2-proxy, which authenticates users against Keycloak and injects
// X-Forwarded-* identity headers; this service is not reachable otherwise.
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { config } from './config.mjs'
import { buildAndPublish, currentLiveSha } from './builder.mjs'
import { commitPaths, headSha, isAncestor, syncWithRemote } from './git.mjs'
import { HttpError, absPath, readPage, resolveContentPath, saveImage, writePage } from './pages.mjs'
import { createProduct, readRegistry } from './products.mjs'

const status = {
  build: { state: 'idle', sha: null, message: '', time: null },
  sync: { state: 'pending', message: '', time: null, ahead: 0 },
}

// Every git mutation and build runs through this queue, one at a time.
let tail = Promise.resolve()
function enqueue(task) {
  const result = tail.then(task, task)
  tail = result.catch(() => {})
  return result
}

function log(...args) {
  console.log(new Date().toISOString(), ...args)
}

function writeStatusFile() {
  const snapshot = { ...status, live: currentLiveSha(), time: new Date().toISOString() }
  const file = path.join(config.siteDir, 'status.json')
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(snapshot))
  fs.renameSync(`${file}.tmp`, file)
}

let buildTimer = null
function scheduleBuild(reason) {
  clearTimeout(buildTimer)
  buildTimer = setTimeout(() => enqueue(runBuild).catch(() => {}), config.buildDebounceMs)
  log('build scheduled:', reason)
}

async function runBuild() {
  const sha = await headSha()
  if (sha === currentLiveSha() && !fs.existsSync(path.join(config.siteDir, '.rebuild'))) return
  fs.rmSync(path.join(config.siteDir, '.rebuild'), { force: true })
  Object.assign(status.build, { state: 'building', sha, message: '', time: new Date().toISOString() })
  writeStatusFile()
  try {
    await buildAndPublish()
    Object.assign(status.build, { state: 'ok', message: 'published', time: new Date().toISOString() })
    log('published', sha)
  } catch (err) {
    Object.assign(status.build, { state: 'failed', message: String(err.message).slice(-1500), time: new Date().toISOString() })
    log('build failed', sha, err.message)
  }
  writeStatusFile()
}

async function runSync() {
  const result = await syncWithRemote()
  Object.assign(status.sync, result, { time: new Date().toISOString() })
  writeStatusFile()
  if (result.state !== 'ok') log('sync:', result.state, result.message)
  if (result.changed) scheduleBuild('upstream changed')
}

// ---------- identity ----------
function identity(req) {
  const username = req.headers['x-forwarded-preferred-username'] || req.headers['x-forwarded-user'] || ''
  const email = req.headers['x-forwarded-email'] || `${username || 'unknown'}@users.noreply.yuzhicloud.com`
  const groups = String(req.headers['x-forwarded-groups'] || '').split(',').map((g) => g.trim())
  const hasRole = (role) => groups.includes(role) || groups.includes(`role:${role}`)
  return { username, email, canEdit: hasRole(config.editorRole), isAdmin: hasRole(config.adminRole) }
}

function requireEditor(user) {
  if (!user.username) throw new HttpError(401, 'UNAUTHENTICATED', 'login required')
  if (!user.canEdit) throw new HttpError(403, 'FORBIDDEN', `role ${config.editorRole} required`)
}

// ---------- http helpers ----------
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (c) => {
      size += c.length
      if (size > limit) {
        reject(new HttpError(413, 'TOO_LARGE', `body exceeds ${limit} bytes`))
        req.destroy()
      } else chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

async function readJson(req) {
  try {
    return JSON.parse((await readBody(req, config.maxPageBytes + 64 * 1024)).toString('utf8'))
  } catch (err) {
    if (err instanceof HttpError) throw err
    throw new HttpError(400, 'INVALID_JSON', 'request body must be JSON')
  }
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers })
  res.end(JSON.stringify(body))
}

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.md': 'text/plain; charset=utf-8' }

// ---------- routes ----------
async function handle(req, res) {
  const url = new URL(req.url, 'http://wiki')
  const user = identity(req)
  const route = `${req.method} ${url.pathname}`

  if (route === 'GET /api/me') return send(res, 200, user)
  if (route === 'GET /api/status') {
    const live = currentLiveSha()
    const commit = url.searchParams.get('commit')
    const published = commit && live && /^[0-9a-f]{7,40}$/.test(commit) ? await isAncestor(commit, live) : undefined
    return send(res, 200, { ...status, live, head: await headSha(), published })
  }

  if (route === 'GET /api/page') {
    const rel = resolveContentPath(url.searchParams.get('path'), { extensions: ['.md'] })
    return send(res, 200, readPage(rel))
  }

  if (req.method === 'GET' && url.pathname.startsWith('/api/raw/')) {
    const rel = resolveContentPath(decodeURIComponent(url.pathname.slice('/api/raw/'.length)), { extensions: Object.keys(MIME) })
    const file = absPath(rel)
    if (!fs.existsSync(file)) throw new HttpError(404, 'NOT_FOUND', 'file not found')
    res.writeHead(200, { 'Content-Type': MIME[path.extname(rel).toLowerCase()], 'Cache-Control': 'no-cache' })
    return fs.createReadStream(file).pipe(res)
  }

  if (route === 'PUT /api/page' || route === 'POST /api/page') {
    requireEditor(user)
    const create = req.method === 'POST'
    const { path: rawPath, content, baseSha, message } = await readJson(req)
    const rel = resolveContentPath(rawPath, { extensions: ['.md'] })
    if (typeof content !== 'string') throw new HttpError(400, 'CONTENT_REQUIRED', 'content must be a string')
    const result = await enqueue(async () => {
      const sha = writePage(rel, content, { baseSha, create })
      const commit = await commitPaths([rel], {
        authorName: user.username, authorEmail: user.email,
        message: message?.trim() || `wiki: ${create ? 'create' : 'edit'} ${rel}`,
      })
      return { sha, commit }
    })
    if (result.commit) scheduleBuild(`edit ${rel}`)
    log(`${user.username} ${create ? 'created' : 'edited'} ${rel} -> ${result.commit ?? 'no change'}`)
    return send(res, create ? 201 : 200, { path: rel, ...result })
  }

  if (route === 'POST /api/upload') {
    requireEditor(user)
    const pageRel = resolveContentPath(url.searchParams.get('page'), { extensions: ['.md'] })
    const contentType = String(req.headers['content-type'] || '').split(';')[0].trim()
    const body = await readBody(req, config.maxUploadBytes)
    const result = await enqueue(async () => {
      const saved = saveImage(pageRel, contentType, body)
      const commit = await commitPaths([saved.rel], {
        authorName: user.username, authorEmail: user.email, message: `wiki: upload ${saved.rel}`,
      })
      return { ...saved, commit }
    })
    scheduleBuild(`upload ${result.rel}`)
    log(`${user.username} uploaded ${result.rel}`)
    return send(res, 201, { path: result.rel, link: result.link, commit: result.commit })
  }

  if (route === 'GET /api/products') return send(res, 200, readRegistry())

  if (route === 'POST /api/products') {
    if (!user.isAdmin) throw new HttpError(403, 'FORBIDDEN', `role ${config.adminRole} required`)
    const input = await readJson(req)
    const result = await enqueue(async () => {
      const { product, paths } = createProduct(input)
      const commit = await commitPaths(paths, {
        authorName: user.username, authorEmail: user.email, message: `wiki: create product ${product.slug} (${product.name})`,
      })
      return { product, commit }
    })
    scheduleBuild(`product ${result.product.slug}`)
    log(`${user.username} created product ${result.product.slug}`)
    return send(res, 201, result)
  }

  if (route === 'POST /api/sync') {
    requireEditor(user)
    await enqueue(runSync)
    return send(res, 200, status.sync)
  }

  if (route === 'POST /api/rebuild') {
    if (!user.isAdmin) throw new HttpError(403, 'FORBIDDEN', `role ${config.adminRole} required`)
    fs.writeFileSync(path.join(config.siteDir, '.rebuild'), '')
    scheduleBuild(`manual by ${user.username}`)
    return send(res, 202, { scheduled: true })
  }

  throw new HttpError(404, 'NOT_FOUND', `no route ${route}`)
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((err) => {
    const status = err instanceof HttpError ? err.status : 500
    if (status === 500) log('error', req.method, req.url, err)
    send(res, status, { code: err.code ?? 'INTERNAL', message: err.message, ...(err.currentSha ? { currentSha: err.currentSha } : {}) })
  })
})

server.listen(config.port, () => {
  log(`wiki-api listening on :${config.port}, repo=${config.repoDir}`)
  fs.mkdirSync(config.siteDir, { recursive: true })
  enqueue(runSync).catch((e) => log('initial sync error', e.message))
  scheduleBuild('startup')
  setInterval(() => enqueue(runSync).catch((e) => log('sync error', e.message)), config.syncIntervalMs)
})

for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => {
    log(`${sig} received, draining queue`)
    server.close()
    tail.finally(() => process.exit(0))
  })
}
