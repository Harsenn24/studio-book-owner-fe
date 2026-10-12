<template>
  <label class="block text-left">
    <span v-if="label" class="mb-1.5 block text-sm font-medium text-ink-300">{{ label }}</span>
    <span class="relative block">
      <span v-if="icon" class="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-400">{{ icon }}</span>
      <input v-model="model" :type="inputType" :placeholder="placeholder" :required="required" :autocomplete="autocomplete"
        :minlength="minlength" :maxlength="maxlength" :inputmode="inputmode"
        :class="[
          'w-full rounded-xl border bg-ink-900/80 py-3 text-ink-100 placeholder:text-ink-400 transition',
          'focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15',
          icon ? 'pl-10' : 'pl-4', type === 'password' ? 'pr-12' : 'pr-4',
          error ? 'border-rose-500/70' : 'border-ink-600',
        ]" />
      <button v-if="type === 'password'" type="button" @click="reveal = !reveal"
        class="absolute inset-y-0 right-2 my-auto h-9 rounded-lg px-2 text-sm text-ink-300 hover:text-ink-100"
        :aria-label="reveal ? 'Sembunyikan password' : 'Tampilkan password'">
        {{ reveal ? 'Sembunyi' : 'Lihat' }}
      </button>
    </span>
    <span v-if="error" class="mt-1.5 block text-xs text-rose-400">{{ error }}</span>
    <span v-else-if="hint" class="mt-1.5 block text-xs text-ink-400">{{ hint }}</span>
  </label>
</template>

<script setup>
import { computed, ref } from 'vue'

const model = defineModel({ type: String, default: '' })
const props = defineProps({
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  icon: String,
  hint: String,
  error: String,
  required: Boolean,
  autocomplete: String,
  minlength: [String, Number],
  maxlength: [String, Number],
  inputmode: String,
})

const reveal = ref(false)
const inputType = computed(() => (props.type === 'password' && reveal.value ? 'text' : props.type))
</script>
