<script setup lang="ts">
// Publish/sync status of the wiki server (build queue, git sync with GitHub).
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { errorText, getMe, getStatus, triggerRebuild, triggerSync, type Me } from '../wikiApi'

const status = ref<Record<string, any> | null>(null)
const me = ref<Me | null>(null)
const error = ref('')
const busy = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const BUILD_TEXT: Record<string, string> = { idle: '空闲', building: '构建中', ok: '已发布', failed: '构建失败' }
const SYNC_TEXT: Record<string, string> = {
  pending: '等待首次同步', ok: '已同步', offline: '无法连接 GitHub', conflict: '同步冲突，需人工处理', push_failed: '推送失败',
}

async function refresh() {
  try {
    status.value = await getStatus()
    error.value = ''
  } catch (e) {
    error.value = errorText(e)
  }
}

async function act(fn: () => Promise<unknown>) {
  busy.value = true
  try { await fn() } catch (e) { error.value = errorText(e) } finally { busy.value = false; refresh() }
}

const short = (sha?: string | null) => (sha ? sha.slice(0, 8) : '—')
const when = (t?: string | null) => (t ? new Date(t).toLocaleString('zh-CN', { hour12: false }) : '—')

onMounted(async () => {
  me.value = await getMe().catch(() => null)
  await refresh()
  timer = setInterval(refresh, 5000)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <p v-if="error" class="ws-error">读取状态失败：{{ error }}</p>
  <p v-else-if="!status">正在读取…</p>
  <template v-else>
    <table>
      <tbody>
        <tr><th>线上版本</th><td><code>{{ short(status.live) }}</code></td></tr>
        <tr><th>服务器最新提交</th><td><code>{{ short(status.head) }}</code>
          <span v-if="status.head !== status.live" class="ws-pending">（待发布）</span></td></tr>
        <tr><th>构建</th><td :class="`ws-${status.build.state}`">{{ BUILD_TEXT[status.build.state] ?? status.build.state }}
          · {{ when(status.build.time) }}</td></tr>
        <tr><th>与 GitHub 同步</th><td :class="`ws-${status.sync.state}`">{{ SYNC_TEXT[status.sync.state] ?? status.sync.state }}
          · {{ when(status.sync.time) }}<br /><small>{{ status.sync.message }}</small></td></tr>
      </tbody>
    </table>
    <pre v-if="status.build.state === 'failed'" class="ws-log">{{ status.build.message }}</pre>
    <p class="ws-actions">
      <button v-if="me?.canEdit" :disabled="busy" @click="act(triggerSync)">立即同步 GitHub</button>
      <button v-if="me?.isAdmin" :disabled="busy" @click="act(triggerRebuild)">重新构建</button>
    </p>
  </template>
</template>

<style scoped>
th { white-space: nowrap; }
.ws-ok { color: var(--vp-c-tip-1); }
.ws-building, .ws-pending, .ws-pending_state { color: var(--vp-c-warning-1); }
.ws-failed, .ws-conflict, .ws-offline, .ws-push_failed, .ws-error { color: var(--vp-c-danger-1); }
.ws-log { max-height: 320px; overflow: auto; font-size: 12px; background: var(--vp-c-bg-soft); padding: 12px; border-radius: 8px; }
.ws-actions button { margin-right: 12px; padding: 6px 14px; border-radius: 8px; background: var(--vp-c-brand-1); color: var(--vp-c-white); }
.ws-actions button:hover:not(:disabled) { background: var(--vp-c-brand-2); }
.ws-actions button:disabled { opacity: .5; }
</style>
