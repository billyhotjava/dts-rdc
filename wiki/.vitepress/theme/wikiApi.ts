// Client helpers for the wiki API (served under /api by wiki-api behind oauth2-proxy).
export interface ProductRef { slug: string; name: string; description: string; url: string }
export interface Me { username: string; email: string; canEdit: boolean; isAdmin: boolean; products: ProductRef[] }
export interface PageData { path: string; exists: boolean; content: string; sha: string | null; url: string | null }
export interface SaveResult { path: string; url: string | null; sha: string; commit: string | null }
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

export interface Product { slug: string; name: string; description: string; docs: string; worklog: string }

export function createProduct(input: { slug: string; name: string; description: string }) {
  return call<{ product: Product; commit: string | null }>('/api/products', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  })
}

export const triggerSync = () => call<Record<string, any>>('/api/sync', { method: 'POST' })
export const triggerRebuild = () => call<Record<string, any>>('/api/rebuild', { method: 'POST' })

// Published URLs are computed by the server (products live under /p/<slug>/).
export const pageUrl = (url: string | null | undefined) => url || '/'

export const ERROR_TEXT: Record<string, string> = {
  EDIT_CONFLICT: '该页面已被他人修改',
  PAGE_EXISTS: '同名页面已存在',
  PAGE_NOT_FOUND: '页面不存在',
  FORBIDDEN: '你没有编辑权限（需加入“研发部”或授予 dts-wiki:editor 角色）',
  UNAUTHENTICATED: '登录已失效，请刷新页面重新登录',
  PATH_NOT_EDITABLE: '只能编辑产品空间或练习区中的文档',
  SPACE_FORBIDDEN: '你没有该产品空间的访问权限',
  EXTENSION_NOT_ALLOWED: '文件类型不允许',
  UNSUPPORTED_IMAGE: '只支持 PNG / JPG / GIF / WebP 图片',
  TOO_LARGE: '文件过大（图片上限 10 MB）',
  PAGE_TOO_LARGE: '页面过大（上限 2 MB）',
}

export const errorText = (e: unknown) =>
  e instanceof ApiError ? (ERROR_TEXT[e.body.code] ?? e.body.message) : String((e as Error)?.message ?? e)
