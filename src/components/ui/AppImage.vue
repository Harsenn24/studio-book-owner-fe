<template>
  <div class="relative overflow-hidden bg-ink-700">
    <img v-if="src && !failed" :src="src" :alt="alt" loading="lazy" class="h-full w-full object-cover" @error="failed = true" />
    <!-- Fallback when the studio has no photo or the file is missing -->
    <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-700 via-ink-800 to-ink-900 text-4xl">
      🎸
    </div>
    <slot />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ src: String, alt: { type: String, default: '' } })
const failed = ref(false)
watch(() => props.src, () => { failed.value = false })
</script>
