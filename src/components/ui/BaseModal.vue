<template>
  <Teleport to="body">
    <Transition enter-from-class="opacity-0" leave-to-class="opacity-0" enter-active-class="transition duration-200"
      leave-active-class="transition duration-150">
      <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
        @click.self="dismissible && emit('close')">
        <!-- Bottom sheet on phones, centered dialog from sm: up -->
        <div role="dialog" aria-modal="true" :aria-label="title"
          class="w-full max-w-md animate-fade-up rounded-t-3xl border border-ink-600 bg-ink-800 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center shadow-2xl sm:rounded-3xl">
          <div class="mx-auto mb-4 h-1.5 w-12 rounded-full bg-ink-600 sm:hidden" />
          <div v-if="icon" class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-700 text-3xl">{{ icon }}</div>
          <h2 v-if="title" class="text-lg font-bold text-ink-100">{{ title }}</h2>
          <div class="mt-2 text-sm leading-relaxed text-ink-300"><slot /></div>
          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
            <slot name="actions" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  open: Boolean,
  title: String,
  icon: String,
  dismissible: { type: Boolean, default: true },
})
const emit = defineEmits(['close'])

const onKey = (event) => { if (event.key === 'Escape' && props.dismissible) emit('close') }

watch(() => props.open, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
  isOpen ? window.addEventListener('keydown', onKey) : window.removeEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>
