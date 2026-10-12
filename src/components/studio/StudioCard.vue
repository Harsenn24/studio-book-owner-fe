<template>
  <article class="group card flex flex-col p-5 transition duration-300 hover:-translate-y-1 hover:border-brand-500/50">
    <router-link :to="`/home/${studio.studio_id}`" class="flex-1">
      <div class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-700 text-xl">🎙️</span>
          <div class="min-w-0">
            <h3 class="truncate text-lg font-bold transition group-hover:text-brand-400">{{ studio.studio_name }}</h3>
            <p class="truncate text-sm text-ink-300">📍 {{ studio.studio_district }}, {{ studio.studio_city }}</p>
          </div>
        </div>
        <StatusBadge :status="studio.studio_status" />
      </div>
      <p class="mt-4 text-xs text-ink-400">Dibuat {{ formatEpoch(studio.studio_created_at, { day: 'numeric', month: 'short', year: 'numeric' }) }}</p>
    </router-link>
    <div class="mt-4 flex items-center justify-between border-t border-ink-600/60 pt-4">
      <a v-if="studio.studio_gmaps" :href="studio.studio_gmaps" target="_blank" rel="noopener noreferrer" class="text-sm font-medium text-ink-300 hover:text-ink-100">🗺️ Maps</a>
      <router-link :to="`/home/${studio.studio_id}`" class="ml-auto text-sm font-semibold text-brand-400 hover:underline">Kelola →</router-link>
    </div>
  </article>
</template>

<script setup>
import StatusBadge from '../ui/StatusBadge.vue'
import { formatEpoch } from '../../utils/format'

defineProps({ studio: { type: Object, required: true } })
</script>
