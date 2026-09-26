<script setup lang="ts">
import { onMounted, ref } from 'vue'

// Pagefind is generated after `vitepress build`, so its UI bundle is loaded at runtime
// from /pagefind/ rather than imported at build time.
const status = ref<'loading' | 'ready' | 'unavailable'>('loading')

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script')
    el.src = src
    el.onload = () => resolve()
    el.onerror = () => reject(new Error(`failed to load ${src}`))
    document.head.appendChild(el)
  })
}

onMounted(async () => {
  try {
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = '/pagefind/pagefind-ui.css'
    document.head.appendChild(css)
    await loadScript('/pagefind/pagefind-ui.js')
    // @ts-expect-error provided by pagefind-ui.js
    new window.PagefindUI({
      element: '#pagefind-search',
      showSubResults: true,
      showImages: false,
      translations: { placeholder: '搜索文档、Sprint、Feature、Task…', zero_results: '没有找到 [SEARCH_TERM] 相关内容' },
    })
    status.value = 'ready'
  } catch {
    status.value = 'unavailable'
  }
})
</script>

<template>
  <p v-if="status === 'loading'">正在加载搜索…</p>
  <p v-else-if="status === 'unavailable'">搜索索引不可用（本地开发模式下不生成索引，请使用构建产物）。</p>
  <div id="pagefind-search" />
</template>
