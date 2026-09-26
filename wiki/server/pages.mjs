// Path validation and file access for editable wiki content.
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { config, IMAGE_TYPES } from './config.mjs'

export class HttpError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

// Returns a normalised repo-relative POSIX path inside an editable root, or throws 400.
export function resolveContentPath(raw, { extensions }) {
  if (typeof raw !== 'string' || !raw) throw new HttpError(400, 'PATH_REQUIRED', 'path is required')
  const rel = path.posix.normalize(raw.replace(/\\/g, '/').replace(/^\/+/, ''))
  const root = rel.split('/')[0]
  if (rel.startsWith('..') || rel.includes('/../') || !config.editableRoots.includes(root) || rel === root) {
    throw new HttpError(400, 'PATH_NOT_EDITABLE', `path must be under ${config.editableRoots.join(', ')}`)
  }
  if (!extensions.includes(path.posix.extname(rel).toLowerCase())) {
    throw new HttpError(400, 'EXTENSION_NOT_ALLOWED', `allowed extensions: ${extensions.join(', ')}`)
  }
  if (rel.split('/').some((seg) => seg.startsWith('.'))) {
    throw new HttpError(400, 'PATH_NOT_EDITABLE', 'hidden paths are not editable')
  }
  return rel
}

export const absPath = (rel) => path.join(config.repoDir, ...rel.split('/'))

export const contentHash = (buf) => crypto.createHash('sha256').update(buf).digest('hex')

export function readPage(rel) {
  const file = absPath(rel)
  if (!fs.existsSync(file)) return { path: rel, exists: false, content: '', sha: null }
  const buf = fs.readFileSync(file)
  return { path: rel, exists: true, content: buf.toString('utf8'), sha: contentHash(buf) }
}

export function writePage(rel, content, { baseSha, create }) {
  const file = absPath(rel)
  const exists = fs.existsSync(file)
  if (create && exists) throw new HttpError(409, 'PAGE_EXISTS', 'page already exists')
  if (!create) {
    if (!exists) throw new HttpError(404, 'PAGE_NOT_FOUND', 'page does not exist')
    const current = contentHash(fs.readFileSync(file))
    if (current !== baseSha) {
      throw Object.assign(new HttpError(409, 'EDIT_CONFLICT', 'page was changed by someone else'), { currentSha: current })
    }
  }
  const buf = Buffer.from(content, 'utf8')
  if (buf.length > config.maxPageBytes) throw new HttpError(413, 'PAGE_TOO_LARGE', 'page exceeds 2 MB')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, buf)
  return contentHash(buf)
}

// Stores an uploaded image next to the page: <page dir>/assets/<timestamp>-<rand><ext>.
export function saveImage(pageRel, contentType, body) {
  const ext = IMAGE_TYPES[contentType]
  if (!ext) throw new HttpError(415, 'UNSUPPORTED_IMAGE', `allowed types: ${Object.keys(IMAGE_TYPES).join(', ')}`)
  if (body.length === 0) throw new HttpError(400, 'EMPTY_UPLOAD', 'empty file')
  const dir = path.posix.dirname(pageRel)
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
  const name = `${stamp}-${crypto.randomBytes(3).toString('hex')}${ext}`
  const rel = `${dir}/assets/${name}`
  fs.mkdirSync(path.dirname(absPath(rel)), { recursive: true })
  fs.writeFileSync(absPath(rel), body)
  return { rel, link: `./assets/${name}` }
}
