<template>
  <label class="block text-left">
    <span v-if="label" class="mb-1.5 block text-xs font-medium text-ink-400">{{ label }}</span>
    <select v-model="model" :disabled="disabled"
      class="w-full appearance-none rounded-xl border border-ink-600 bg-ink-900/80 bg-[length:12px] bg-[right_0.9rem_center] bg-no-repeat px-3.5 py-2.5 pr-9 text-sm text-ink-100 transition focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15 disabled:opacity-50"
      :style="{ backgroundImage: `url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath fill='none' stroke='%23a3a3bb' stroke-width='1.6' d='m1 1.5 5 5 5-5'/%3E%3C/svg%3E&quot;)` }">
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
  </label>
</template>

<script setup>
// options: [{ value, label }]
const model = defineModel({ type: [String, Number, Boolean], default: '' })
defineProps({ label: String, options: { type: Array, default: () => [] }, placeholder: String, disabled: Boolean })
</script>
