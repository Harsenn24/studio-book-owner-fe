<template>
  <nav v-if="maxPage > 1" class="flex items-center justify-between gap-3 text-sm" aria-label="Paginasi">
    <button type="button" class="rounded-xl border border-ink-600 px-3 py-2 font-semibold text-ink-300 transition hover:text-ink-100 disabled:opacity-40"
      :disabled="page <= 1" @click="emit('update:page', page - 1)">‹ Sebelumnya</button>

    <div class="hidden items-center gap-1 sm:flex">
      <button v-for="item in pages" :key="item.key" type="button" :disabled="item.gap"
        class="h-9 min-w-9 rounded-lg px-2 font-semibold transition"
        :class="item.value === page ? 'bg-brand-gradient text-white' : item.gap ? 'text-ink-400' : 'text-ink-300 hover:bg-ink-700'"
        @click="!item.gap && emit('update:page', item.value)">{{ item.gap ? '…' : item.value }}</button>
    </div>
    <span class="text-ink-300 sm:hidden">Halaman {{ page }} / {{ maxPage }}</span>

    <button type="button" class="rounded-xl border border-ink-600 px-3 py-2 font-semibold text-ink-300 transition hover:text-ink-100 disabled:opacity-40"
      :disabled="page >= maxPage" @click="emit('update:page', page + 1)">Berikutnya ›</button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ page: { type: Number, required: true }, maxPage: { type: Number, default: 1 } })
const emit = defineEmits(['update:page'])

// 1 … 4 5 6 … 20
const pages = computed(() => {
  const { page, maxPage } = props
  const wanted = new Set([1, maxPage, page - 1, page, page + 1].filter((n) => n >= 1 && n <= maxPage))
  const sorted = [...wanted].sort((a, b) => a - b)
  return sorted.flatMap((value, index) =>
    index > 0 && value - sorted[index - 1] > 1 ? [{ key: `gap-${value}`, gap: true }, { key: value, value }] : [{ key: value, value }])
})
</script>
