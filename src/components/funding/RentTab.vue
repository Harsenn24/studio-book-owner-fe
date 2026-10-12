<template>
  <div class="space-y-4">
    <FilterBar :active-count="activeCount" @reset="reset">
      <FieldInput v-model="filters.transaction_id" label="ID transaksi" placeholder="Cari ID…" />
      <FieldInput v-model="filters.user_name" label="Nama penyewa" placeholder="Nama persis…" />
      <FieldSelect v-model="filters.payment_status" label="Status sewa" :options="STATUS_OPTIONS" />
      <FieldSelect v-model="filters.recon_status" label="Status pencairan" :options="RECON_OPTIONS" />
      <FieldInput v-model="filters.start_date" type="date" label="Dibuat dari" />
      <FieldInput v-model="filters.end_date" type="date" label="Dibuat sampai" />
    </FilterBar>

    <section class="card overflow-hidden">
      <header class="flex items-center justify-between gap-3 border-b border-ink-600/60 px-5 py-4">
        <h2 class="font-bold">🎸 Riwayat penyewaan</h2>
        <FieldSelect v-model="filters.limit" class="w-40" :options="LIMIT_OPTIONS" />
      </header>

      <div v-if="loading" class="space-y-2 p-5"><div v-for="n in 4" :key="n" class="h-12 animate-pulse rounded-xl bg-ink-700/60" /></div>
      <EmptyState v-else-if="!rows.length" class="!border-0 !shadow-none" icon="🎸" title="Belum ada transaksi sewa" />

      <template v-else>
        <div class="hidden overflow-x-auto lg:block">
          <table class="w-full text-sm">
            <thead class="bg-ink-900/60 text-left text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th class="px-4 py-3">Penyewa</th><th class="px-4 py-3">ID transaksi</th><th class="px-4 py-3">Studio</th><th class="px-4 py-3">Jadwal</th>
                <th class="px-4 py-3 text-right">Sewa</th><th class="px-4 py-3 text-right">Admin</th><th class="px-4 py-3 text-right">Total</th>
                <th class="px-4 py-3">Status</th><th class="px-4 py-3">Pencairan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-ink-600/50">
              <tr v-for="item in rows" :key="item.id" class="hover:bg-ink-700/30">
                <td class="px-4 py-3 font-semibold">{{ item.user }}</td>
                <td class="max-w-40 truncate px-4 py-3 font-mono text-xs">{{ item.id }}</td>
                <td class="px-4 py-3">#{{ item.studio }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-ink-300">{{ formatDate(item.date, { day: 'numeric', month: 'short', year: 'numeric' }) }}<br />{{ item.time }}</td>
                <td class="px-4 py-3 text-right">{{ formatPrice(item.amount) }}</td>
                <td class="px-4 py-3 text-right text-ink-300">{{ formatPrice(item.admin_fee) }}</td>
                <td class="px-4 py-3 text-right font-semibold">{{ formatPrice(item.total_amount) }}</td>
                <td class="px-4 py-3"><StatusBadge :status="item.payment_status" /></td>
                <td class="px-4 py-3"><StatusBadge :status="item.recon_status ? 'success' : 'pending'" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul class="divide-y divide-ink-600/50 lg:hidden">
          <li v-for="item in rows" :key="item.id" class="space-y-2 px-5 py-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0"><p class="truncate font-bold">{{ item.user }}</p><p class="truncate font-mono text-xs text-ink-400">{{ item.id }}</p></div>
              <StatusBadge :status="item.payment_status" />
            </div>
            <p class="text-sm text-ink-300">Studio #{{ item.studio }} · {{ formatDate(item.date, { day: 'numeric', month: 'short' }) }} · {{ item.time }}</p>
            <div class="flex items-center justify-between text-sm">
              <span class="font-semibold">{{ formatPrice(item.total_amount) }}</span>
              <span class="text-xs text-ink-400">Pencairan: {{ item.recon_status ? 'selesai' : 'menunggu' }}</span>
            </div>
          </li>
        </ul>
      </template>
    </section>

    <BasePagination :page="page" :max-page="maxPage" @update:page="goTo" />
  </div>
</template>

<script setup>
import FilterBar from '../ui/FilterBar.vue'
import FieldInput from '../ui/FieldInput.vue'
import FieldSelect from '../ui/FieldSelect.vue'
import StatusBadge from '../ui/StatusBadge.vue'
import EmptyState from '../ui/EmptyState.vue'
import BasePagination from '../ui/BasePagination.vue'
import { fundingApi } from '../../api/funding'
import { LIMIT_OPTIONS, usePagedList } from '../../composables/usePagedList'
import { dayToEpoch, formatDate, formatPrice } from '../../utils/format'

const props = defineProps({ studioUuid: { type: String, required: true } })

const STATUS_OPTIONS = [
  { value: '', label: 'Semua status' }, { value: 'booked', label: 'Lunas' }, { value: 'pending', label: 'Menunggu' }, { value: 'cancelled', label: 'Dibatalkan' },
]
const RECON_OPTIONS = [{ value: '', label: 'Semua' }, { value: 1, label: 'Selesai' }, { value: 2, label: 'Menunggu' }]

const { filters, rows, page, maxPage, loading, activeCount, goTo, reset } = usePagedList(async (page, f) => {
  const result = await fundingApi.rentals({
    studio_id: props.studioUuid, page, limit: f.limit,
    transaction_id: f.transaction_id.trim(),
    // The name is sent as text (it used to be coerced to a number and rejected by the API)
    user_name: f.user_name.trim(),
    payment_status: f.payment_status, recon_status: f.recon_status,
    start_date: dayToEpoch(f.start_date), end_date: dayToEpoch(f.end_date, true),
  })
  return { rows: result.data, total: result.totalData }
}, { transaction_id: '', user_name: '', payment_status: '', recon_status: '', start_date: '', end_date: '', limit: 10 })
</script>
