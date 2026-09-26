<script setup lang="ts">
// "编辑此页" for every content page; the editor lives on the portal (/edit), outside
// product site bases, so this is a full-page link (target="_self": the VitePress router
// ignores links that carry a target).
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()
const href = computed(() => {
  const source = frontmatter.value.sourcePath as string | undefined
  return source ? `/edit?path=${encodeURIComponent(source)}` : null
})
</script>

<template>
  <div v-if="href" class="wiki-edit-link">
    <a :href="href" target="_self" data-full-nav>
      <span class="vpi-square-pen" aria-hidden="true" />编辑此页
    </a>
  </div>
</template>

<style scoped>
.wiki-edit-link { margin-top: 48px; }
.wiki-edit-link a { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 500; color: var(--vp-c-brand-1); }
.wiki-edit-link a:hover { color: var(--vp-c-brand-2); }
.wiki-edit-link a:focus-visible { outline: 2px solid var(--vp-c-brand-2); outline-offset: 2px; border-radius: 4px; }
</style>
