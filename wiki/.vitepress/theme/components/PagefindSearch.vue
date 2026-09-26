<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getMe } from '../wikiApi'

// Pagefind indexes are generated after `vitepress build`: one for the portal (extras) and one
// per product site. Only the indexes of products the user may access are merged, so search
// never surfaces text from other products.
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
    const [me] = await Promise.all([getMe(), loadScript('/pagefind/pagefind-ui.js')])
    // @ts-expect-error provided by pagefind-ui.js
    new window.PagefindUI({
      element: '#pagefind-search',
      baseUrl: '/',
      mergeIndex: me.products.map((p) => ({ bundlePath: `/p/${p.slug}/pagefind/`, baseUrl: `/p/${p.slug}/` })),
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
