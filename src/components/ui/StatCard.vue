<template>
  <div class="card relative overflow-hidden p-5" :class="highlight && 'border-brand-500/40'">
    <div v-if="highlight" class="bg-brand-gradient absolute inset-x-0 top-0 h-1" />
    <div class="flex items-start justify-between gap-3">
      <p class="text-sm text-ink-300">{{ label }}</p>
      <span class="text-xl">{{ icon }}</span>
    </div>
    <p class="mt-2 truncate text-2xl font-extrabold tracking-tight">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-xs" :class="highlight ? 'text-brand-400' : 'text-ink-400'">{{ hint }}</p>
  </div>
</template>

<script setup>
defineProps({ label: String, value: [String, Number], hint: String, icon: String, highlight: Boolean })
</script>
