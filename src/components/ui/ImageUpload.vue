<template>
  <div class="text-left">
    <span v-if="label" class="mb-1.5 block text-sm font-medium text-ink-300">{{ label }}</span>
    <label class="group relative flex aspect-[16/10] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition"
      :class="error ? 'border-rose-500/70' : preview ? 'border-transparent' : 'border-ink-600 hover:border-brand-400/70'">
      <input type="file" class="sr-only" :accept="ACCEPT" @change="pick" />
      <img v-if="preview" :src="preview" alt="" class="h-full w-full object-cover" />
      <div v-else class="flex flex-col items-center gap-1 px-4 text-center text-ink-400">
        <span class="text-3xl">{{ icon }}</span>
        <span class="text-sm font-semibold text-ink-300">Pilih foto</span>
        <span class="text-xs">JPG, PNG, atau WEBP · maks {{ maxKb }} KB</span>
      </div>
      <div v-if="preview" class="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold opacity-0 transition group-hover:opacity-100">
        Ganti foto
      </div>
      <div v-if="uploading" class="absolute inset-0 flex items-center justify-center bg-ink-950/70">
        <span class="h-8 w-8 animate-spin rounded-full border-4 border-ink-600 border-t-brand-500" />
      </div>
      <span v-if="done && !uploading" class="absolute right-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">✓</span>
    </label>
    <span v-if="error" class="mt-1.5 block text-xs text-rose-400">{{ error }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Same types the backend accepts; anything else would be rejected after upload
const ACCEPT = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

const props = defineProps({
  label: String,
  icon: { type: String, default: '📷' },
  initialUrl: String,
  maxKb: { type: Number, default: 500 },
  // async (file) => void; throws to show an error. Without it the file is only previewed and emitted
  upload: Function,
})
const emit = defineEmits(['selected'])

const preview = ref(props.initialUrl ?? null)
const error = ref('')
const uploading = ref(false)
const done = ref(false)

async function pick(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  error.value = ''
  if (!ALLOWED.includes(file.type)) return (error.value = 'Format harus JPG, PNG, atau WEBP.')
  if (file.size > props.maxKb * 1024) return (error.value = `Ukuran maksimal ${props.maxKb} KB.`)

  preview.value = URL.createObjectURL(file)
  done.value = false
  emit('selected', file)
  if (!props.upload) return

  uploading.value = true
  try {
    await props.upload(file)
    done.value = true
  } catch (uploadError) {
    error.value = uploadError.message
  } finally {
    uploading.value = false
  }
}
</script>
