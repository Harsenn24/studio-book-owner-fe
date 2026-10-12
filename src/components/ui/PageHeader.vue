<template>
  <header class="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
    <div class="min-w-0">
      <button v-if="back" type="button" class="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-300 hover:text-ink-100"
        @click="goBack">
        <span aria-hidden="true">←</span> {{ backLabel }}
      </button>
      <p v-if="eyebrow" class="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">{{ eyebrow }}</p>
      <h1 class="mt-1 truncate text-2xl font-extrabold tracking-tight sm:text-3xl">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-sm text-ink-300">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.default" class="shrink-0"><slot /></div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: String,
  eyebrow: String,
  subtitle: String,
  back: { type: [String, Object, Boolean], default: false },
  backLabel: { type: String, default: 'Kembali' },
})

const router = useRouter()
const goBack = () => (typeof props.back === 'boolean' ? router.back() : router.push(props.back))
</script>
