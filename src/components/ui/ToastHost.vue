<template>
  <div class="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end">
    <TransitionGroup enter-from-class="opacity-0 -translate-y-2" leave-to-class="opacity-0" enter-active-class="transition duration-200"
      leave-active-class="transition duration-150">
      <div v-for="item in toasts" :key="item.id" role="status"
        class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-ink-800/95 px-4 py-3 text-sm shadow-2xl backdrop-blur"
        :class="tones[item.type].border">
        <span class="mt-0.5 text-base">{{ tones[item.type].icon }}</span>
        <p class="flex-1 text-ink-100">{{ item.message }}</p>
        <button class="text-ink-400 hover:text-ink-100" aria-label="Tutup" @click="dismiss(item.id)">✕</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToasts } from '../../composables/useToast'

const { toasts, dismiss } = useToasts()

const tones = {
  success: { icon: '✅', border: 'border-emerald-500/40' },
  error: { icon: '⚠️', border: 'border-rose-500/50' },
  info: { icon: '💬', border: 'border-ink-600' },
}
</script>
