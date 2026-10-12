<template>
  <label class="block text-left">
    <span v-if="label" class="mb-1.5 block text-xs font-medium text-ink-400">{{ label }}</span>
    <input v-model="model" :type="type" :placeholder="placeholder" :inputmode="inputmode"
      class="w-full rounded-xl border border-ink-600 bg-ink-900/80 px-3.5 py-2.5 text-sm text-ink-100 [color-scheme:dark] placeholder:text-ink-400 transition focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15" />
  </label>
</template>

<script setup>
// Compact input for filters and inline forms
const model = defineModel({ type: [String, Number], default: '' })
defineProps({ label: String, type: { type: String, default: 'text' }, placeholder: String, inputmode: String })
</script>
