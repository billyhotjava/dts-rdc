<script setup lang="ts">
// Product spaces visible to the signed-in user (filtered server-side by Keycloak roles).
import { onMounted, ref } from 'vue'
import { errorText, getMe, type Me } from '../wikiApi'

const me = ref<Me | null>(null)
const error = ref('')
const loading = ref(true)

onMounted(async () => {
  try { me.value = await getMe() } catch (e) { error.value = errorText(e) } finally { loading.value = false }
})
</script>

<template>
  <section class="pc">
    <h2 class="pc-title">产品空间</h2>
    <p v-if="loading" class="pc-muted">正在加载…</p>
    <p v-else-if="error" class="pc-error">加载失败：{{ error }}</p>
    <template v-else-if="me">
      <p v-if="!me.products.length" class="pc-muted">
        你还没有任何产品空间的访问权限。请联系管理员把你加入相应的"产品-"组。
      </p>
      <div class="pc-grid">
        <a v-for="p in me.products" :key="p.slug" :href="p.url" class="pc-card" data-full-nav>
          <strong>{{ p.name }}</strong>
          <span>{{ p.description || '—' }}</span>
        </a>
        <a v-if="me.isAdmin" href="/new-product" class="pc-card pc-new">
          <strong>＋ 新建产品</strong>
          <span>为新的产品创建文档与工作日志空间</span>
        </a>
      </div>
    </template>
  </section>
</template>

<style scoped>
.pc { max-width: 1152px; margin: 0 auto; padding: 0 24px 48px; }
.pc-title { font-size: 20px; font-weight: 600; margin: 8px 0 16px; border: 0; }
.pc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.pc-card { display: grid; gap: 8px; padding: 20px 22px; border-radius: 12px; background: var(--vp-c-bg-soft);
  border: 1px solid transparent; text-decoration: none; color: var(--vp-c-text-1); transition: border-color .2s, transform .2s; }
.pc-card:hover { border-color: var(--vp-c-brand-1); transform: translateY(-2px); }
.pc-card:focus-visible { outline: 2px solid var(--vp-c-brand-2); outline-offset: 2px; }
.pc-card strong { font-size: 16px; }
.pc-card span { font-size: 14px; color: var(--vp-c-text-2); line-height: 1.6; }
.pc-new { border-style: dashed; border-color: var(--vp-c-divider); }
.pc-muted { color: var(--vp-c-text-2); }
.pc-error { color: var(--vp-c-danger-1); }
</style>
