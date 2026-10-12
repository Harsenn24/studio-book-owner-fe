<template>
  <span class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold" :class="tones[meta.tone]">
    <span class="h-1.5 w-1.5 rounded-full bg-current" />
    {{ meta.label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { STATUS } from '../../utils/format'

const props = defineProps({ status: String })

const meta = computed(() => STATUS[props.status] ?? { label: props.status ?? '-', tone: 'neutral' })

const tones = {
  success: 'bg-emerald-500/15 text-emerald-300',
  warning: 'bg-amber-500/15 text-amber-300',
  danger: 'bg-rose-500/15 text-rose-300',
  neutral: 'bg-ink-700 text-ink-300',
}
</script>
