<script setup lang="ts">
// Creates a product space (docs + worklog) through /api/products, then follows the publish.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { createProduct, errorText, getMe, getStatus, type Me } from '../wikiApi'

const me = ref<Me | null>(null)
const name = ref('')
const slug = ref('')
const description = ref('')
const busy = ref(false)
const error = ref('')
const done = ref<{ name: string; link: string } | null>(null)
const publishing = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const SLUG = /^[a-z][a-z0-9-]{1,30}$/
const slugValid = computed(() => SLUG.test(slug.value))
const canSubmit = computed(() => !!me.value?.isAdmin && !!name.value.trim() && slugValid.value && !busy.value)

onMounted(async () => { me.value = await getMe().catch(() => null) })
onBeforeUnmount(() => clearInterval(timer))

async function submit() {
  if (!canSubmit.value) return
  busy.value = true
  error.value = ''
  try {
    const res = await createProduct({ slug: slug.value, name: name.value.trim(), description: description.value.trim() })
    done.value = { name: res.product.name, link: `/${res.product.docs}/` }
    publishing.value = true
    const commit = res.commit
    timer = setInterval(async () => {
      const s = await getStatus(commit ?? undefined).catch(() => null)
      if (s?.published || s?.build?.state === 'failed') {
        clearInterval(timer)
        publishing.value = false
      }
    }, 3000)
  } catch (e) {
    error.value = errorText(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <p v-if="me && !me.isAdmin" class="np-notice np-warning">
    新建产品需要 wiki 管理员权限（dts-wiki:admin）。请联系管理员，或让管理员把你加入“管理员”组。
  </p>

  <div v-if="done" class="np-notice np-success" role="status">
    产品「{{ done.name }}」已创建。
    <template v-if="publishing">正在发布，约需 30 秒…</template>
    <template v-else><a :href="done.link">进入产品空间 →</a>（如导航未刷新，请刷新页面）</template>
  </div>

  <form v-else class="np-form" @submit.prevent="submit">
    <label>
      <span>产品名称 <em>*</em></span>
      <input v-model="name" maxlength="40" placeholder="例如：地铁运维" :disabled="!me?.isAdmin" />
    </label>
    <label>
      <span>标识 <em>*</em></span>
      <input v-model="slug" maxlength="31" placeholder="例如：metro" :disabled="!me?.isAdmin"
             :aria-invalid="slug !== '' && !slugValid" />
      <small :class="{ 'np-bad': slug !== '' && !slugValid }">
        用于目录和网址：products/<b>{{ slug || '标识' }}</b>/。小写字母开头，只含小写字母、数字、连字符，2–31 位；创建后不可修改。
      </small>
    </label>
    <label>
      <span>简介</span>
      <textarea v-model="description" maxlength="200" rows="3" placeholder="一句话介绍这个产品（显示在首页卡片上）" :disabled="!me?.isAdmin" />
    </label>
    <p class="np-hint">将创建：<code>products/{{ slug || '标识' }}/docs/</code>（产品文档）与 <code>products/{{ slug || '标识' }}/worklog/</code>（工作日志）。</p>
    <p v-if="error" class="np-notice np-danger">创建失败：{{ error }}</p>
    <button type="submit" :disabled="!canSubmit">{{ busy ? '创建中…' : '创建产品' }}</button>
  </form>
</template>

<style scoped>
.np-form { display: grid; gap: 18px; max-width: 560px; margin-top: 16px; }
.np-form label { display: grid; gap: 6px; }
.np-form span { font-weight: 600; font-size: 14px; }
.np-form em { color: var(--vp-c-danger-1); font-style: normal; }
.np-form input, .np-form textarea { border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 8px 10px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font: inherit; }
.np-form input:focus, .np-form textarea:focus { outline: 2px solid var(--vp-c-brand-2); outline-offset: 1px; }
.np-form input[aria-invalid="true"] { border-color: var(--vp-c-danger-1); }
.np-form small { color: var(--vp-c-text-2); font-size: 12px; }
.np-form small.np-bad { color: var(--vp-c-danger-1); }
.np-form button { justify-self: start; padding: 8px 20px; border-radius: 8px; background: var(--vp-c-brand-1); color: var(--vp-c-white); font-weight: 500; }
.np-form button:hover:not(:disabled) { background: var(--vp-c-brand-2); }
.np-form button:disabled { opacity: .5; cursor: not-allowed; }
.np-hint { font-size: 13px; color: var(--vp-c-text-2); margin: 0; }
.np-notice { padding: 10px 14px; border-radius: 8px; font-size: 14px; }
.np-notice a { color: var(--vp-c-brand-1); text-decoration: underline; margin-left: 6px; }
.np-warning { background: var(--vp-c-warning-soft); }
.np-success { background: var(--vp-c-tip-soft); }
.np-danger { background: var(--vp-c-danger-soft); }
</style>
