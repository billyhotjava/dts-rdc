// Runtime configuration for the wiki API (all values from environment).
const env = process.env

export const config = Object.freeze({
  port: Number(env.PORT ?? 8080),
  repoDir: env.REPO_DIR ?? '/repo',
  siteDir: env.SITE_DIR ?? '/site',
  cacheDir: env.CACHE_DIR ?? '/cache',
  gitUrl: env.GIT_URL ?? 'git@github.com:billyhotjava/dts-rdc.git',
  branch: env.BRANCH ?? 'main',
  syncIntervalMs: Number(env.SYNC_INTERVAL ?? 120) * 1000,
  buildDebounceMs: Number(env.BUILD_DEBOUNCE ?? 5) * 1000,
  keepReleases: Number(env.KEEP_RELEASES ?? 5),
  editableRoots: (env.EDITABLE_ROOTS ?? 'docs,worklog,products,sandbox').split(',').map((s) => s.trim()).filter(Boolean),
  maxUploadBytes: Number(env.MAX_UPLOAD_MB ?? 10) * 1024 * 1024,
  maxPageBytes: 2 * 1024 * 1024,
  clientId: env.OIDC_CLIENT_ID ?? 'dts-wiki',
  editorRole: env.EDITOR_ROLE ?? 'dts-wiki:editor',
  adminRole: env.ADMIN_ROLE ?? 'dts-wiki:admin',
  committerName: env.COMMITTER_NAME ?? 'DTS Wiki',
  committerEmail: env.COMMITTER_EMAIL ?? 'wiki@yuzhicloud.com',
})

export const IMAGE_TYPES = Object.freeze({
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
})
