<template>
  <div ref="root" class="relative text-left">
    <BaseInput v-model="query" :label="label" :placeholder="disabled ? disabledHint : placeholder" :icon="icon" :error="error"
      :class="disabled && 'pointer-events-none opacity-50'" @focusin="open" @input="onInput" @keydown.down.prevent="move(1)"
      @keydown.up.prevent="move(-1)" @keydown.enter.prevent="choose(options[highlight])" @keydown.esc="close" />

    <ul v-if="isOpen" class="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-ink-600 bg-ink-800 py-1 shadow-2xl">
      <li v-if="loading" class="px-4 py-2.5 text-sm text-ink-400">Mencari…</li>
      <li v-else-if="!options.length" class="px-4 py-2.5 text-sm text-ink-400">Tidak ditemukan</li>
      <li v-for="(option, index) in options" v-else :key="option[valueKey]"
        class="cursor-pointer px-4 py-2.5 text-sm transition"
        :class="index === highlight ? 'bg-ink-600 text-ink-100' : 'text-ink-300 hover:bg-ink-700'"
        @mousedown.prevent="choose(option)">{{ option[labelKey] }}</li>
    </ul>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BaseInput from './BaseInput.vue'

// Searchable select: `search(query)` returns options; v-model holds the chosen option (or null)
const model = defineModel({ type: Object, default: null })
const props = defineProps({
  label: String,
  placeholder: String,
  icon: String,
  error: String,
  disabled: Boolean,
  disabledHint: { type: String, default: 'Pilih isian sebelumnya dulu' },
  search: { type: Function, required: true },
  labelKey: { type: String, default: 'name' },
  valueKey: { type: String, default: 'id' },
})

const root = ref(null)
const query = ref(model.value?.[props.labelKey] ?? '')
const options = ref([])
const isOpen = ref(false)
const loading = ref(false)
const highlight = ref(0)
let timer = null
let requestId = 0

async function load() {
  const id = ++requestId
  loading.value = true
  try {
    const result = await props.search(query.value)
    if (id === requestId) options.value = result ?? []
  } catch {
    if (id === requestId) options.value = []
  } finally {
    if (id === requestId) loading.value = false
  }
  highlight.value = 0
}

function open() {
  if (props.disabled) return
  isOpen.value = true
  load()
}

// Typing invalidates the previous choice; results are debounced
function onInput() {
  if (model.value) model.value = null
  isOpen.value = true
  clearTimeout(timer)
  timer = setTimeout(load, 250)
}

function choose(option) {
  if (!option) return
  model.value = option
  query.value = option[props.labelKey]
  close()
}

function close() {
  isOpen.value = false
}

function move(step) {
  if (!options.value.length) return
  highlight.value = (highlight.value + step + options.value.length) % options.value.length
}

const onClickOutside = (event) => { if (!root.value?.contains(event.target)) close() }
onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => { document.removeEventListener('mousedown', onClickOutside); clearTimeout(timer) })

// Parent resets (e.g. province changed -> city cleared)
watch(model, (value) => { if (!value) { if (!isOpen.value) query.value = '' } else query.value = value[props.labelKey] })
</script>
