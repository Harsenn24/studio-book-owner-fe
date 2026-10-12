<template>
  <div class="space-y-6">
    <!-- Activation banner -->
    <div v-if="studio.status !== 'active'" class="flex flex-col gap-4 rounded-2xl border border-brand-500/40 bg-brand-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="font-bold">Studio belum aktif</p>
        <p class="mt-1 text-sm text-ink-300">Aktifkan langganan agar studio tampil dan bisa dibooking penyewa.</p>
      </div>
      <BaseButton class="shrink-0" @click="emit('activate')">⚡ Aktifkan studio</BaseButton>
    </div>

    <!-- Info -->
    <section class="card grid gap-6 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4">
      <div v-for="block in infoBlocks" :key="block.title">
        <p class="text-xs font-semibold uppercase tracking-wider text-ink-400">{{ block.icon }} {{ block.title }}</p>
        <p v-for="(line, index) in block.lines" :key="index" class="mt-1.5 text-sm" :class="index === 0 ? 'font-semibold text-ink-100' : 'text-ink-300'">{{ line }}</p>
      </div>
    </section>

    <!-- Rooms -->
    <section>
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold">Nomor studio</h2>
          <p class="text-sm text-ink-300">{{ rooms.length }} dari {{ studio.estimated_studio_number }} ruangan sudah diatur</p>
        </div>
        <BaseButton v-if="canAddRoom" size="sm" :to="`/home/create-studio-detail/${studio.studio_id}`">＋ Tambah nomor studio</BaseButton>
      </div>

      <EmptyState v-if="!rooms.length" icon="🚪" title="Belum ada nomor studio" description="Atur alat, harga, dan jam operasional ruangan pertamamu.">
        <BaseButton :to="`/home/create-studio-detail/${studio.studio_id}`">＋ Tambah nomor studio</BaseButton>
      </EmptyState>

      <div v-else class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <article v-for="room in rooms" :key="room.id" class="card flex flex-col overflow-hidden">
          <AppImage :src="uploadUrl(room.document_file)" :alt="`Studio ${room.studio_number}`" class="aspect-[16/10]">
            <span class="absolute left-3 top-3 rounded-full bg-ink-950/75 px-3 py-1 text-sm font-bold backdrop-blur">Studio {{ room.studio_number }}</span>
          </AppImage>
          <div class="flex flex-1 flex-col p-5">
            <ul class="flex flex-wrap gap-2">
              <li v-for="equipment in room.studio_equipment" :key="equipment.name"
                class="inline-flex items-center gap-1.5 rounded-lg bg-ink-900/80 px-2.5 py-1.5 text-xs font-medium capitalize">
                {{ equipmentIcon(equipment.name) }} {{ equipment.name }} <span class="rounded bg-ink-700 px-1.5 text-ink-300">×{{ equipment.quantity }}</span>
              </li>
            </ul>
            <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div class="rounded-xl bg-ink-900/60 p-3"><p class="text-xs text-ink-400">Weekday</p><p class="font-bold">{{ formatPrice(room.price_weekday) }}</p></div>
              <div class="rounded-xl bg-ink-900/60 p-3"><p class="text-xs text-ink-400">Weekend</p><p class="font-bold">{{ formatPrice(room.price_weekend) }}</p></div>
            </div>
            <BaseButton class="mt-5" variant="secondary" block :to="`/home/${studio.studio_id}/${room.id}`">✏️ Edit ruangan & jadwal</BaseButton>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import EmptyState from '../ui/EmptyState.vue'
import AppImage from '../ui/AppImage.vue'
import { uploadUrl } from '../../api/http'
import { equipmentIcon, formatPrice } from '../../utils/format'

const props = defineProps({ studio: { type: Object, required: true }, rooms: { type: Array, default: () => [] } })
const emit = defineEmits(['activate'])

const canAddRoom = computed(() => props.rooms.length > 0 && props.rooms.length < props.studio.estimated_studio_number)

const infoBlocks = computed(() => {
  const s = props.studio
  return [
    { icon: '📍', title: 'Alamat', lines: [s.studio_address, `${s.studio_village}, ${s.studio_district}`, `${s.studio_city}, ${s.studio_province} ${s.studio_postal_code}`] },
    { icon: '👤', title: 'Contact person', lines: [s.studio_contact_person_name, s.studio_contact_person_phone] },
    { icon: '🏦', title: 'Rekening pencairan', lines: [s.studio_bank_name, s.studio_bank_account_number] },
    { icon: '⚡', title: 'Langganan', lines: s.status === 'active' ? ['Aktif', s.active_until ? `Sampai ${s.active_until}` : 'Masa aktif tidak tercatat'] : ['Tidak aktif', 'Aktifkan untuk mulai menerima booking'] },
  ]
})
</script>
