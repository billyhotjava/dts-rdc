// Client helpers for the wiki API (served under /api by wiki-api behind oauth2-proxy).
export interface Me { username: string; email: string; canEdit: boolean; isAdmin: boolean }
export interface PageData { path: string; exists: boolean; content: string; sha: string | null }
export interface SaveResult { path: string; sha: string; commit: string | null }
export interface ApiErrorBody { code: string; message: string; currentSha?: string }

export class ApiError extends Error {
  constructor(public status: number, public body: ApiErrorBody) {
    super(body.message)
  }
}

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'same-origin', ...init })
  const text = await res.text()
  const body = text ? JSON.parse(text) : {}
  if (!res.ok) throw new ApiError(res.status, body)
  return body as T
}

export const getMe = () => call<Me>('/api/me')
export const getPage = (path: string) => call<PageData>(`/api/page?path=${encodeURIComponent(path)}`)
export const getStatus = (commit?: string) =>
  call<Record<string, any>>(`/api/status${commit ? `?commit=${commit}` : ''}`)

export function savePage(path: string, content: string, baseSha: string | null, create: boolean) {
  return call<SaveResult>('/api/page', {
    method: create ? 'POST' : 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content, baseSha }),
  })
}

export function uploadImage(pagePath: string, file: File) {
  return call<{ path: string; link: string; commit: string }>(
    `/api/upload?page=${encodeURIComponent(pagePath)}`,
    { method: 'POST', headers: { 'Content-Type': file.type }, body: file },
  )
}

export const triggerSync = () => call<Record<string, any>>('/api/sync', { method: 'POST' })
export const triggerRebuild = () => call<Record<string, any>>('/api/rebuild', { method: 'POST' })

// Repository path -> published page URL (README.md/index.md map to the directory).
export function pageUrl(repoPath: string): string {
  const withoutExt = repoPath.replace(/\.md$/i, '')
  const url = /\/(README|index)$/i.test(withoutExt) ? withoutExt.replace(/(README|index)$/i, '') : withoutExt
  return encodeURI('/' + url)
}

export const ERROR_TEXT: Record<string, string> = {
  EDIT_CONFLICT: '该页面已被他人修改',
  PAGE_EXISTS: '同名页面已存在',
  PAGE_NOT_FOUND: '页面不存在',
  FORBIDDEN: '你没有编辑权限（需加入“研发部”或授予 dts-wiki:editor 角色）',
  UNAUTHENTICATED: '登录已失效，请刷新页面重新登录',
  PATH_NOT_EDITABLE: '只能编辑 docs/ 或 worklog/ 下的文档',
  EXTENSION_NOT_ALLOWED: '文件类型不允许',
  UNSUPPORTED_IMAGE: '只支持 PNG / JPG / GIF / WebP 图片',
  TOO_LARGE: '文件过大（图片上限 10 MB）',
  PAGE_TOO_LARGE: '页面过大（上限 2 MB）',
}

export const errorText = (e: unknown) =>
  e instanceof ApiError ? (ERROR_TEXT[e.body.code] ?? e.body.message) : String((e as Error)?.message ?? e)
