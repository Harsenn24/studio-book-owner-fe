<template>
  <div class="card flex flex-col items-center px-6 py-14 text-center">
    <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-700 text-3xl">{{ icon }}</div>
    <h3 class="text-lg font-bold">{{ title }}</h3>
    <p v-if="description" class="mt-1 max-w-sm text-sm text-ink-300">{{ description }}</p>
    <div v-if="$slots.default" class="mt-6"><slot /></div>
  </div>
</template>

<script setup>
defineProps({ icon: { type: String, default: '🎵' }, title: String, description: String })
</script>
