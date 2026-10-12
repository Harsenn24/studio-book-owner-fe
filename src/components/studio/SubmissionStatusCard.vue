<template>
  <section class="card overflow-hidden">
    <div class="px-6 py-8 text-center sm:px-10">
      <StatusBadge :status="submission.status" />
      <h2 class="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">{{ submission.studio_name }}</h2>
      <p class="mt-2 text-ink-300">{{ headline }}</p>
    </div>

    <!-- Timeline -->
    <ol class="grid gap-4 border-t border-ink-600/60 px-6 py-8 sm:grid-cols-3 sm:gap-0 sm:px-10">
      <li v-for="(step, index) in steps" :key="step.title" class="relative flex gap-4 sm:flex-col sm:items-center sm:text-center">
        <span v-if="index < steps.length - 1" class="absolute left-5 top-12 h-[calc(100%-1rem)] w-0.5 bg-ink-600 sm:left-[calc(50%+1.75rem)] sm:top-5 sm:h-0.5 sm:w-[calc(100%-3.5rem)]" />
        <span class="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold"
          :class="toneClass[step.tone]">
          <span v-if="step.tone === 'active'" class="h-3 w-3 animate-ping rounded-full bg-amber-brand" />
          <template v-else>{{ step.icon }}</template>
        </span>
        <div class="pb-2 sm:mt-3">
          <p class="font-semibold">{{ step.title }}</p>
          <p class="mt-0.5 text-xs text-ink-400">{{ step.hint }}</p>
        </div>
      </li>
    </ol>

    <div class="border-t border-ink-600/60 px-6 py-6 text-center sm:px-10">
      <p v-if="submission.status === 'rejected'" class="mx-auto mb-5 max-w-lg rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
        <b>Catatan tim:</b> {{ submission.submission_notes || 'Tidak ada catatan spesifik.' }}. Silakan perbaiki lalu ajukan ulang.
      </p>
      <p v-else-if="submission.status === 'submission'" class="mb-5 text-sm text-ink-300">Kamu akan dikabari setelah pengajuan selesai diproses.</p>

      <BaseButton v-if="submission.status === 'submission'" variant="secondary" :loading="refreshing" @click="emit('refresh')">🔄 Periksa lagi</BaseButton>
      <BaseButton v-else-if="submission.status === 'rejected'" @click="emit('resubmit')">Ajukan ulang studio</BaseButton>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import StatusBadge from '../ui/StatusBadge.vue'
import BaseButton from '../ui/BaseButton.vue'
import { formatEpoch } from '../../utils/format'

const props = defineProps({ submission: { type: Object, required: true }, refreshing: Boolean })
const emit = defineEmits(['refresh', 'resubmit'])

const headline = computed(() => ({
  submission: 'Pengajuan studio sedang diproses.',
  rejected: 'Mohon maaf, pengajuanmu ditolak.',
  accepted: 'Selamat! Pengajuanmu diterima.',
}[props.submission.status] ?? ''))

const steps = computed(() => {
  const status = props.submission.status
  const decided = status !== 'submission'
  return [
    { title: 'Pengajuan dikirim', hint: formatEpoch(props.submission.created_at), icon: '✓', tone: 'done' },
    { title: decided ? 'Verifikasi selesai' : 'Sedang diverifikasi', hint: 'Oleh tim kami', icon: decided ? '✓' : '2', tone: decided ? 'done' : 'active' },
    {
      title: 'Hasil pengajuan',
      hint: { rejected: 'Ditolak', accepted: 'Disetujui' }[status] ?? 'Menunggu hasil',
      icon: { rejected: '✕', accepted: '✓' }[status] ?? '3',
      tone: { rejected: 'danger', accepted: 'done' }[status] ?? 'idle',
    },
  ]
})

const toneClass = {
  done: 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300',
  active: 'border-amber-brand/70 bg-amber-500/10',
  danger: 'border-rose-500/60 bg-rose-500/15 text-rose-300',
  idle: 'border-ink-600 bg-ink-800 text-ink-400',
}
</script>
