<template>
  <div class="card p-4">
    <div class="flex items-center justify-between gap-3">
      <button type="button" class="flex items-center gap-2 text-sm font-semibold md:pointer-events-none" @click="expanded = !expanded">
        <span>🔎 Filter</span>
        <span v-if="activeCount" class="rounded-full bg-brand-500/20 px-2 py-0.5 text-xs text-brand-400">{{ activeCount }} aktif</span>
        <span class="text-ink-400 md:hidden">{{ expanded ? '▴' : '▾' }}</span>
      </button>
      <button v-if="activeCount" type="button" class="text-sm font-semibold text-ink-300 hover:text-ink-100" @click="emit('reset')">Reset</button>
    </div>
    <!-- Collapsed by default on phones, always open from md: up -->
    <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" :class="!expanded && 'hidden md:grid'">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ activeCount: { type: Number, default: 0 } })
const emit = defineEmits(['reset'])
const expanded = ref(false)
</script>
