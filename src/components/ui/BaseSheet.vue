<template>
  <Teleport to="body">
    <Transition enter-from-class="opacity-0" leave-to-class="opacity-0" enter-active-class="transition duration-200" leave-active-class="transition duration-150">
      <div v-if="open" class="fixed inset-0 z-50 flex justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6" @click.self="emit('close')">
        <!-- Full screen on phones, a wide dialog from sm: up -->
        <div role="dialog" aria-modal="true" :aria-label="title"
          class="flex h-full w-full animate-fade-up flex-col border-ink-600 bg-ink-800 shadow-2xl sm:h-auto sm:max-h-[92dvh] sm:rounded-3xl sm:border"
          :class="width">
          <header class="flex items-start justify-between gap-4 border-b border-ink-600/70 px-5 py-4 sm:px-6">
            <div>
              <h2 class="text-lg font-bold">{{ title }}</h2>
              <p v-if="subtitle" class="mt-0.5 text-sm text-ink-300">{{ subtitle }}</p>
            </div>
            <button type="button" class="rounded-lg p-1.5 text-ink-400 hover:bg-ink-700 hover:text-ink-100" aria-label="Tutup" @click="emit('close')">✕</button>
          </header>
          <div class="flex-1 overflow-y-auto px-5 py-5 sm:px-6"><slot /></div>
          <footer v-if="$slots.footer" class="flex flex-col-reverse gap-2 border-t border-ink-600/70 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, watch } from 'vue'

const props = defineProps({ open: Boolean, title: String, subtitle: String, width: { type: String, default: 'sm:max-w-3xl' } })
const emit = defineEmits(['close'])

const onKey = (event) => { if (event.key === 'Escape') emit('close') }
watch(() => props.open, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
  isOpen ? window.addEventListener('keydown', onKey) : window.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>
