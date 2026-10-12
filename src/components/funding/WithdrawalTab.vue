<template>
  <div class="space-y-6">
    <!-- Balance overview -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total transaksi" icon="🧮" :value="formatPrice(summary.total_amount)" :hint="`Dari ${summary.total_transaction ?? 0} penyewaan`" />
      <StatCard label="Total pendapatan" icon="💰" :value="formatPrice(summary.amount)" hint="Tanpa biaya admin penyewa" />
      <StatCard label="Saldo tersedia" icon="✨" :value="formatPrice(summary.total_amount_recon_pending)"
        :hint="available < 0 ? 'Saldo minus, hubungi admin' : 'Bisa ditarik sekarang'" :highlight="available >= 0" />
      <StatCard label="Sudah dicairkan" icon="🏦" :value="formatPrice(summary.total_amount_disbursement)" hint="Total penarikan sukses" />
    </div>

    <div class="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <!-- Payout account + recon -->
      <section class="card space-y-5 p-5 sm:p-6">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-ink-400">Rekening pencairan</p>
          <div class="mt-3 flex items-center justify-between gap-3 rounded-xl bg-ink-900/70 p-4">
            <div class="min-w-0">
              <p class="truncate font-bold">{{ summary.bank?.bank_name || '-' }}</p>
              <p class="font-mono text-sm text-ink-300">{{ summary.bank?.bank_account || '-' }}</p>
            </div>
            <BaseButton size="sm" variant="secondary" @click="showEditBank = true">Ganti</BaseButton>
          </div>
        </div>
        <div class="rounded-xl border border-ink-600/70 p-4">
          <p class="text-sm font-semibold">Rekonsiliasi saldo</p>
          <p class="mt-1 text-xs text-ink-400">Hitung transaksi sewa yang sudah settle ke saldo tersedia.</p>
          <BaseButton class="mt-3" variant="secondary" block :loading="reconciling" @click="recon">🔄 Rekonsiliasi sekarang</BaseButton>
        </div>
      </section>

      <!-- Withdraw -->
      <section class="card p-5 sm:p-6">
        <p class="text-xs font-semibold uppercase tracking-wider text-ink-400">Tarik dana</p>
        <label class="mt-3 block">
          <span class="mb-1.5 block text-sm text-ink-300">Jumlah yang ingin diterima</span>
          <div class="relative">
            <span class="pointer-events-none absolute inset-y-0 left-4 flex items-center font-bold text-ink-400">Rp</span>
            <input :value="amountLabel" inputmode="numeric" placeholder="0" @input="onAmountInput"
              class="w-full rounded-xl border bg-ink-900/80 py-3.5 pl-12 pr-4 text-2xl font-extrabold tracking-tight placeholder:text-ink-600 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
              :class="amount && amountError ? 'border-rose-500/70' : 'border-ink-600'" />
          </div>
        </label>
        <div class="mt-3 flex flex-wrap gap-2">
          <button v-for="preset in presets" :key="preset.label" type="button" class="rounded-lg border border-ink-600 px-3 py-1.5 text-xs font-semibold text-ink-300 hover:border-brand-400 hover:text-ink-100"
            @click="amount = preset.value">{{ preset.label }}</button>
        </div>
        <p class="mt-3 min-h-5 text-sm" :class="amount && amountError ? 'text-rose-400' : 'text-ink-400'">
          {{ amount && amountError ? amountError : `Minimal ${formatPrice(MIN_WITHDRAW)} · biaya admin ${formatPrice(fee)}` }}
        </p>
        <BaseButton class="mt-4" size="lg" block :disabled="!!amountError" @click="openTransfer">Tarik {{ amount ? formatPrice(amount) : 'dana' }}</BaseButton>
      </section>
    </div>

    <!-- History -->
    <FilterBar :active-count="activeCount" @reset="reset">
      <FieldInput v-model="filters.transaction_id" label="ID transaksi" placeholder="Cari ID…" />
      <FieldSelect v-model="filters.status" label="Status" :options="STATUS_OPTIONS" />
      <FieldInput v-model="filters.date_start" type="date" label="Dari tanggal" />
      <FieldInput v-model="filters.date_end" type="date" label="Sampai tanggal" />
    </FilterBar>

    <section class="card overflow-hidden">
      <header class="flex items-center justify-between gap-3 border-b border-ink-600/60 px-5 py-4">
        <h2 class="font-bold">🏦 Riwayat penarikan</h2>
        <FieldSelect v-model="filters.limit" class="w-40" :options="LIMIT_OPTIONS" />
      </header>
      <div v-if="loading" class="space-y-2 p-5"><div v-for="n in 4" :key="n" class="h-12 animate-pulse rounded-xl bg-ink-700/60" /></div>
      <EmptyState v-else-if="!rows.length" class="!border-0 !shadow-none" icon="🏦" title="Belum ada penarikan" />
      <template v-else>
        <table class="hidden w-full text-sm md:table">
          <thead class="bg-ink-900/60 text-left text-xs uppercase tracking-wider text-ink-400">
            <tr><th class="px-5 py-3">Tanggal</th><th class="px-5 py-3">ID transaksi</th><th class="px-5 py-3 text-right">Jumlah</th><th class="px-5 py-3">Status</th><th class="px-5 py-3">Rekening</th></tr>
          </thead>
          <tbody class="divide-y divide-ink-600/50">
            <tr v-for="item in rows" :key="item.id" class="hover:bg-ink-700/30">
              <td class="whitespace-nowrap px-5 py-3 text-ink-300">{{ formatEpoch(item.transaction_date) }}</td>
              <td class="max-w-48 truncate px-5 py-3 font-mono text-xs">{{ item.id }}</td>
              <td class="px-5 py-3 text-right font-semibold">{{ formatPrice(item.amount) }}</td>
              <td class="px-5 py-3"><StatusBadge :status="item.payment_status" /></td>
              <td class="px-5 py-3 text-ink-300">{{ item.bank_name }} · {{ item.bank_account }}<br /><span class="text-xs text-ink-400">{{ item.bank_account_name }}</span></td>
            </tr>
          </tbody>
        </table>
        <ul class="divide-y divide-ink-600/50 md:hidden">
          <li v-for="item in rows" :key="item.id" class="space-y-1.5 px-5 py-4">
            <div class="flex items-center justify-between gap-3"><span class="font-bold">{{ formatPrice(item.amount) }}</span><StatusBadge :status="item.payment_status" /></div>
            <p class="text-sm text-ink-300">{{ item.bank_name }} · {{ item.bank_account }}</p>
            <p class="text-xs text-ink-400">{{ formatEpoch(item.transaction_date) }}</p>
          </li>
        </ul>
      </template>
    </section>
    <BasePagination :page="page" :max-page="maxPage" @update:page="goTo" />

    <TransferModal v-if="summary.bank" :open="showTransfer" :studio-uuid="studioUuid" :bank="summary.bank" :amount="amount" :fee="fee"
      @close="showTransfer = false" @done="afterTransfer" />
    <EditBankModal :open="showEditBank" :studio-uuid="studioUuid" @close="showEditBank = false" @saved="showEditBank = false; loadSummary()" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import StatCard from '../ui/StatCard.vue'
import BaseButton from '../ui/BaseButton.vue'
import FilterBar from '../ui/FilterBar.vue'
import FieldInput from '../ui/FieldInput.vue'
import FieldSelect from '../ui/FieldSelect.vue'
import StatusBadge from '../ui/StatusBadge.vue'
import EmptyState from '../ui/EmptyState.vue'
import BasePagination from '../ui/BasePagination.vue'
import TransferModal from './TransferModal.vue'
import EditBankModal from './EditBankModal.vue'
import { fundingApi } from '../../api/funding'
import { LIMIT_OPTIONS, usePagedList } from '../../composables/usePagedList'
import { dayToEpoch, digitsOnly, formatEpoch, formatPrice } from '../../utils/format'
import { toast } from '../../composables/useToast'

const props = defineProps({ studioUuid: { type: String, required: true } })

const MIN_WITHDRAW = 50000
const STATUS_OPTIONS = [{ value: '', label: 'Semua status' }, { value: 'success', label: 'Sukses' }, { value: 'pending', label: 'Diproses' }, { value: 'failed', label: 'Gagal' }]

const summary = ref({})
const fee = ref(0)
const amount = ref(0)
const reconciling = ref(false)
const showTransfer = ref(false)
const showEditBank = ref(false)

const available = computed(() => Number(summary.value.total_amount_recon_pending) || 0)
const maxReceivable = computed(() => Math.max(0, available.value - fee.value))
const amountLabel = computed(() => (amount.value ? new Intl.NumberFormat('id-ID').format(amount.value) : ''))
const amountError = computed(() => {
  if (amount.value < MIN_WITHDRAW) return `Minimal penarikan ${formatPrice(MIN_WITHDRAW)}.`
  if (amount.value + fee.value > available.value) return 'Saldo tidak mencukupi (termasuk biaya admin).'
  return ''
})
const presets = computed(() => [
  { label: '50 rb', value: 50000 }, { label: '100 rb', value: 100000 }, { label: '500 rb', value: 500000 },
  ...(maxReceivable.value >= MIN_WITHDRAW ? [{ label: 'Semua saldo', value: maxReceivable.value }] : []),
])

const onAmountInput = (event) => { amount.value = Number(digitsOnly(event.target.value)) || 0 }

async function loadSummary() {
  try {
    const [detail, transferFee] = await Promise.all([fundingApi.summary(props.studioUuid), fundingApi.transferFee()])
    summary.value = detail
    fee.value = Number(transferFee) || 0
  } catch (error) {
    toast.error(error.message)
  }
}

async function recon() {
  reconciling.value = true
  try {
    await fundingApi.recon(props.studioUuid)
    await loadSummary()
    toast.success('Rekonsiliasi selesai, saldo sudah diperbarui.')
  } catch (error) {
    toast.error(error.message)
  } finally {
    reconciling.value = false
  }
}

async function openTransfer() {
  await loadSummary() // re-check the balance right before confirming
  if (!amountError.value) showTransfer.value = true
}

function afterTransfer() {
  showTransfer.value = false
  amount.value = 0
  loadSummary()
  reload()
}

const { filters, rows, page, maxPage, loading, activeCount, goTo, reset, reload } = usePagedList(async (page, f) => {
  const result = await fundingApi.disbursements({
    studio_id: props.studioUuid, page, limit: f.limit, transaction_id: f.transaction_id.trim(), status: f.status,
    date_start: dayToEpoch(f.date_start), date_end: dayToEpoch(f.date_end, true),
  })
  // Paginate with totalData (the old code read a `total` field the API never sends)
  return { rows: result.data, total: result.totalData }
}, { transaction_id: '', status: '', date_start: '', date_end: '', limit: 10 })

onMounted(loadSummary)
</script>
