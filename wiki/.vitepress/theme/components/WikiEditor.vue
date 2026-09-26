<script setup lang="ts">
// In-site markdown editor (Vditor). Loads a page from /api/page, saves with optimistic
// concurrency (baseSha), uploads pasted/dropped images next to the page, keeps a local
// draft, and follows the publish status until the new version is live.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  ApiError, errorText, getMe, getPage, getStatus, pageUrl, savePage, uploadImage, type Me,
} from '../wikiApi'

type Phase = 'loading' | 'ready' | 'error'
type Notice = { kind: 'info' | 'success' | 'warning' | 'danger'; text: string; link?: string }

const phase = ref<Phase>('loading')
const loadError = ref('')
const me = ref<Me | null>(null)
const pagePath = ref('')          // repo-relative path, e.g. worklog/v1.0.0/x.md
const isNew = ref(false)
const newDir = ref('')
const newName = ref('')
const baseSha = ref<string | null>(null)
const dirty = ref(false)
const saving = ref(false)
const notice = ref<Notice | null>(null)
const conflictSha = ref<string | null>(null)
const draft = ref<{ content: string; time: string } | null>(null)

let vditor: any = null
let draftTimer: ReturnType<typeof setTimeout> | undefined
let pollTimer: ReturnType<typeof setInterval> | undefined

const targetPath = computed(() => {
  if (!isNew.value) return pagePath.value
  const name = newName.value.trim().replace(/\.md$/i, '').replace(/[\\/:*?"<>|]/g, '-')
  return name ? `${newDir.value.replace(/\/$/, '')}/${name}.md` : ''
})
const pageDir = computed(() => (isNew.value ? newDir.value.replace(/\/$/, '') : pagePath.value.split('/').slice(0, -1).join('/')))
const draftKey = computed(() => `wiki-draft:${targetPath.value || 'new:' + newDir.value}`)
const canEdit = computed(() => !!me.value?.canEdit)

function setNotice(kind: Notice['kind'], text: string, link?: string) {
  notice.value = { kind, text, link }
}

function storeDraft() {
  clearTimeout(draftTimer)
  draftTimer = setTimeout(() => {
    try {
      localStorage.setItem(draftKey.value, JSON.stringify({
        baseSha: baseSha.value, content: vditor?.getValue() ?? '', time: new Date().toLocaleString('zh-CN'),
      }))
    } catch { /* storage unavailable: drafts are best-effort */ }
  }, 800)
}

function readDraft(currentContent: string) {
  try {
    const raw = localStorage.getItem(draftKey.value)
    if (!raw) return
    const d = JSON.parse(raw)
    if (d.content && d.content !== currentContent && d.baseSha === baseSha.value) draft.value = d
  } catch { /* ignore */ }
}

function clearDraft() {
  try { localStorage.removeItem(draftKey.value) } catch { /* ignore */ }
  draft.value = null
}

async function handleUpload(files: File[]): Promise<string | null> {
  if (!targetPath.value) return '请先填写页面文件名，再上传图片'
  for (const file of files) {
    try {
      setNotice('info', `正在上传 ${file.name}…`)
      const res = await uploadImage(targetPath.value, file)
      const alt = file.name.replace(/\.[^.]+$/, '')
      vditor.insertValue(`\n![${alt}](${res.link})\n`)
      setNotice('success', `已上传 ${file.name}`)
    } catch (e) {
      setNotice('danger', `上传失败：${errorText(e)}`)
    }
  }
  return null
}

async function createEditor(initial: string) {
  const [{ default: Vditor }] = await Promise.all([import('vditor'), import('vditor/dist/index.css')])
  const dark = document.documentElement.classList.contains('dark')
  vditor = new Vditor('wiki-vditor', {
    cdn: '/vendor/vditor',
    lang: 'zh_CN',
    mode: 'ir',
    value: initial,
    height: Math.max(window.innerHeight - 230, 420),
    theme: dark ? 'dark' : 'classic',
    cache: { enable: false },
    placeholder: '在这里编写 Markdown，支持粘贴或拖拽图片…',
    toolbarConfig: { pin: true },
    toolbar: [
      'headings', 'bold', 'italic', 'strike', '|', 'list', 'ordered-list', 'check', 'quote', 'line', '|',
      'table', 'code', 'inline-code', 'link', 'upload', '|', 'undo', 'redo', '|',
      'edit-mode', 'outline', 'preview', 'fullscreen',
    ],
    counter: { enable: true },
    outline: { enable: false, position: 'right' },
    preview: {
      theme: { current: dark ? 'dark' : 'light', path: '/vendor/vditor/dist/css/content-theme' },
      hljs: { style: dark ? 'native' : 'github' },
      markdown: { linkBase: `/api/raw/${pageDir.value}/` },
    },
    upload: {
      accept: 'image/png,image/jpeg,image/gif,image/webp',
      multiple: true,
      max: 10 * 1024 * 1024,
      handler: handleUpload,
    },
    input: () => { dirty.value = true; storeDraft() },
    after: () => { phase.value = 'ready' },
  })
}

async function save() {
  if (!vditor || saving.value) return
  if (!targetPath.value) return setNotice('warning', '请填写页面文件名')
  saving.value = true
  conflictSha.value = null
  try {
    const res = await savePage(targetPath.value, vditor.getValue(), baseSha.value, isNew.value)
    const wasNew = isNew.value
    baseSha.value = res.sha
    pagePath.value = res.path
    isNew.value = false
    dirty.value = false
    clearDraft()
    if (wasNew) history.replaceState(null, '', `/edit?path=${encodeURIComponent(res.path)}`)
    if (res.commit) {
      setNotice('info', `已保存（提交 ${res.commit.slice(0, 8)}），正在发布，约需 30 秒…`)
      followPublish(res.commit)
    } else {
      setNotice('success', '内容没有变化')
    }
  } catch (e) {
    if (e instanceof ApiError && e.body.code === 'EDIT_CONFLICT') {
      conflictSha.value = e.body.currentSha ?? null
      storeDraft()
      setNotice('danger', '保存失败：该页面已被他人修改。你的内容已保存为浏览器草稿。')
    } else {
      setNotice('danger', `保存失败：${errorText(e)}`)
    }
  } finally {
    saving.value = false
  }
}

async function overwriteConflict() {
  if (!conflictSha.value) return
  if (!confirm('确定用你的版本覆盖他人的修改吗？被覆盖的内容仍可在 git 历史中找回。')) return
  baseSha.value = conflictSha.value
  await save()
}

async function reloadLatest() {
  if (dirty.value && !confirm('加载最新版本会丢弃编辑器中的内容（草稿仍保留在浏览器中），继续吗？')) return
  const page = await getPage(pagePath.value)
  baseSha.value = page.sha
  vditor.setValue(page.content)
  dirty.value = false
  conflictSha.value = null
  setNotice('info', '已加载最新版本')
}

function followPublish(commit: string) {
  clearInterval(pollTimer)
  const started = Date.now()
  pollTimer = setInterval(async () => {
    try {
      const s = await getStatus(commit)
      if (s.published) {
        clearInterval(pollTimer)
        setNotice('success', '已发布。', pageUrl(targetPath.value))
      } else if (s.build?.state === 'failed') {
        clearInterval(pollTimer)
        setNotice('danger', '内容已保存，但站点构建失败，请到"发布状态"页查看原因。', '/status')
      } else if (Date.now() - started > 180_000) {
        clearInterval(pollTimer)
        setNotice('warning', '内容已保存，发布耗时较长，请稍后到"发布状态"页查看。', '/status')
      }
    } catch { /* keep polling */ }
  }, 3000)
}

// Full page load: after a publish the SPA's cached site data (sidebar, routes) is outdated.
function hardNavigate(url: string) {
  window.location.assign(url)
}

function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault()
    if (canEdit.value) save()
  }
}

function onBeforeUnload(e: BeforeUnloadEvent) {
  if (dirty.value) { e.preventDefault(); e.returnValue = '' }
}

function restoreDraft() {
  if (!draft.value) return
  vditor.setValue(draft.value.content)
  dirty.value = true
  draft.value = null
}

onMounted(async () => {
  const params = new URLSearchParams(location.search)
  pagePath.value = params.get('path') ?? ''
  isNew.value = params.get('new') === '1' || !pagePath.value
  newDir.value = params.get('dir') ?? 'docs'
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('beforeunload', onBeforeUnload)
  try {
    me.value = await getMe()
    let content = isNew.value ? '# 新页面标题\n\n' : ''
    if (!isNew.value) {
      const page = await getPage(pagePath.value)
      if (page.exists) {
        content = page.content
        baseSha.value = page.sha
      } else {
        isNew.value = true
        newDir.value = pagePath.value.split('/').slice(0, -1).join('/')
        newName.value = pagePath.value.split('/').pop()?.replace(/\.md$/i, '') ?? ''
      }
    }
    readDraft(content)
    await createEditor(content)
  } catch (e) {
    loadError.value = errorText(e)
    phase.value = 'error'
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('beforeunload', onBeforeUnload)
  clearInterval(pollTimer)
  clearTimeout(draftTimer)
  vditor?.destroy?.()
})
</script>

<template>
  <div class="wiki-editor">
    <header class="we-bar">
      <div class="we-title">
        <template v-if="isNew">
          <span class="we-label">新建页面</span>
          <code class="we-dir">{{ newDir }}/</code>
          <input v-model="newName" class="we-name" placeholder="文件名，如 T08-新任务" :disabled="!canEdit" />
          <code>.md</code>
        </template>
        <template v-else>
          <span class="we-label">编辑</span>
          <a :href="pageUrl(pagePath)" class="we-path" title="查看页面" @click.prevent="hardNavigate(pageUrl(pagePath))">{{ pagePath }}</a>
          <span v-if="dirty" class="we-dirty">● 未保存</span>
        </template>
      </div>
      <div class="we-actions">
        <a v-if="!isNew" :href="pageUrl(pagePath)" class="we-btn we-btn-alt" @click.prevent="hardNavigate(pageUrl(pagePath))">返回页面</a>
        <button class="we-btn" :disabled="!canEdit || saving || phase !== 'ready'" @click="save()">
          {{ saving ? '保存中…' : '保存 (Ctrl+S)' }}
        </button>
      </div>
    </header>

    <p v-if="me && !canEdit" class="we-notice we-warning">
      你当前是只读权限（{{ me.username }}）。如需编辑，请联系管理员把你加入“研发部”组。
    </p>
    <p v-if="draft" class="we-notice we-info">
      发现 {{ draft.time }} 未保存的草稿。
      <button class="we-link" @click="restoreDraft">恢复草稿</button>
      <button class="we-link" @click="clearDraft">丢弃</button>
    </p>
    <p v-if="notice" class="we-notice" :class="`we-${notice.kind}`" role="status">
      {{ notice.text }}
      <a v-if="notice.link" :href="notice.link" @click.prevent="hardNavigate(notice.link!)">{{ notice.link === '/status' ? '查看状态' : '查看页面' }}</a>
      <template v-if="conflictSha">
        <button class="we-link" @click="reloadLatest">加载最新版本</button>
        <button class="we-link" @click="overwriteConflict">用我的版本覆盖</button>
      </template>
    </p>

    <p v-if="phase === 'loading'" class="we-placeholder">正在加载编辑器…</p>
    <p v-if="phase === 'error'" class="we-notice we-danger">加载失败：{{ loadError }}</p>
    <div id="wiki-vditor" v-show="phase === 'ready'" />
  </div>
</template>

<style scoped>
.wiki-editor { max-width: 1280px; margin: 0 auto; padding: 16px 24px 32px; }
.we-bar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.we-title { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 14px; min-width: 0; }
.we-label { font-weight: 600; color: var(--vp-c-text-1); }
.we-path { color: var(--vp-c-brand-1); word-break: break-all; }
.we-dir { color: var(--vp-c-text-2); }
.we-name { border: 1px solid var(--vp-c-divider); border-radius: 6px; padding: 4px 8px; min-width: 16em; background: var(--vp-c-bg); color: var(--vp-c-text-1); }
.we-name:focus { outline: 2px solid var(--vp-c-brand-2); outline-offset: 1px; }
.we-dirty { color: var(--vp-c-warning-1); font-size: 13px; }
.we-actions { display: flex; gap: 8px; }
.we-btn { border-radius: 8px; padding: 6px 16px; font-size: 14px; font-weight: 500; background: var(--vp-c-brand-1); color: var(--vp-c-white); transition: background .15s; }
.we-btn:hover:not(:disabled) { background: var(--vp-c-brand-2); }
.we-btn:focus-visible { outline: 2px solid var(--vp-c-brand-3); outline-offset: 2px; }
.we-btn:disabled { opacity: .5; cursor: not-allowed; }
.we-btn-alt { background: var(--vp-c-default-soft); color: var(--vp-c-text-1); text-decoration: none; }
.we-btn-alt:hover { background: var(--vp-c-default-2); }
.we-notice { margin: 0 0 12px; padding: 8px 12px; border-radius: 8px; font-size: 14px; }
.we-notice a, .we-link { margin-left: 8px; color: var(--vp-c-brand-1); text-decoration: underline; cursor: pointer; }
.we-info { background: var(--vp-c-default-soft); }
.we-success { background: var(--vp-c-tip-soft); }
.we-warning { background: var(--vp-c-warning-soft); }
.we-danger { background: var(--vp-c-danger-soft); }
.we-placeholder { color: var(--vp-c-text-2); }
</style>
