<template>
  <div class="space-y-4">
    <FilterBar :active-count="activeCount" @reset="reset">
      <FieldInput v-model="filters.search" label="ID transaksi" placeholder="Cari ID…" />
      <FieldSelect v-model="filters.status" label="Status pembayaran" :options="STATUS_OPTIONS" />
      <FieldInput v-model="filters.start_date" type="date" label="Dari tanggal" />
      <FieldInput v-model="filters.end_date" type="date" label="Sampai tanggal" />
    </FilterBar>

    <section class="card overflow-hidden">
      <header class="flex items-center justify-between gap-3 border-b border-ink-600/60 px-5 py-4">
        <h2 class="font-bold">🧾 Riwayat berlangganan</h2>
        <FieldSelect v-model="filters.limit" class="w-40" :options="LIMIT_OPTIONS" />
      </header>

      <div v-if="loading" class="space-y-2 p-5"><div v-for="n in 4" :key="n" class="h-12 animate-pulse rounded-xl bg-ink-700/60" /></div>
      <EmptyState v-else-if="!rows.length" class="!border-0 !shadow-none" icon="🧾" title="Belum ada transaksi langganan" />

      <template v-else>
        <!-- Table from md: up -->
        <table class="hidden w-full text-sm md:table">
          <thead class="bg-ink-900/60 text-left text-xs uppercase tracking-wider text-ink-400">
            <tr><th class="px-5 py-3">#</th><th class="px-5 py-3">ID transaksi</th><th class="px-5 py-3">Jumlah</th><th class="px-5 py-3">Tanggal</th><th class="px-5 py-3">Status</th><th class="px-5 py-3">Batas bayar</th></tr>
          </thead>
          <tbody class="divide-y divide-ink-600/50">
            <tr v-for="(item, index) in rows" :key="item.transaction_id" class="hover:bg-ink-700/30">
              <td class="px-5 py-3 text-ink-400">{{ (page - 1) * filters.limit + index + 1 }}</td>
              <td class="px-5 py-3 font-mono text-xs">{{ item.transaction_id }}</td>
              <td class="px-5 py-3 font-semibold">{{ formatPrice(item.amount) }}</td>
              <td class="px-5 py-3 text-ink-300">{{ formatEpoch(item.paid_at) }}</td>
              <td class="px-5 py-3"><StatusBadge :status="item.status" /></td>
              <td class="px-5 py-3 text-ink-300">{{ formatEpoch(item.expired_at) }}</td>
            </tr>
          </tbody>
        </table>
        <!-- Cards on phones -->
        <ul class="divide-y divide-ink-600/50 md:hidden">
          <li v-for="item in rows" :key="item.transaction_id" class="space-y-1.5 px-5 py-4">
            <div class="flex items-center justify-between gap-3"><span class="font-bold">{{ formatPrice(item.amount) }}</span><StatusBadge :status="item.status" /></div>
            <p class="truncate font-mono text-xs text-ink-400">{{ item.transaction_id }}</p>
            <p class="text-xs text-ink-300">{{ formatEpoch(item.paid_at) }}</p>
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
import { dayToEpoch, formatEpoch, formatPrice } from '../../utils/format'

const props = defineProps({ studioUuid: { type: String, required: true } })

const STATUS_OPTIONS = [
  { value: '', label: 'Semua status' }, { value: 'success', label: 'Sukses' }, { value: 'pending', label: 'Menunggu' }, { value: 'cancelled', label: 'Dibatalkan' },
]

const { filters, rows, page, maxPage, loading, activeCount, goTo, reset } = usePagedList(async (page, f) => {
  const result = await fundingApi.subscriptions({
    studio_id: props.studioUuid, page, limit: f.limit, search: f.search, status: f.status,
    start_date: dayToEpoch(f.start_date), end_date: dayToEpoch(f.end_date, true),
  })
  return { rows: result.data, total: result.total }
}, { search: '', status: '', start_date: '', end_date: '', limit: 10 })
</script>
