<template>
  <BaseSheet :open="open" title="Aktivasi studio" subtitle="Bayar langganan pakai QRIS, studio langsung aktif setelah lunas." width="sm:max-w-3xl" @close="close">
    <div class="grid gap-5 md:grid-cols-2">
      <!-- Plan -->
      <section class="rounded-2xl border border-ink-600/70 bg-ink-900/60 p-5">
        <p class="text-xs font-semibold uppercase tracking-wider text-brand-400">Paket langganan</p>
        <p class="mt-2 text-3xl font-extrabold">{{ formatPrice(plan.price) }}</p>
        <p class="text-sm text-ink-300">untuk {{ plan.days }} hari</p>
        <dl class="mt-6 space-y-3 text-sm">
          <div><dt class="text-ink-400">Mulai aktif</dt><dd class="font-semibold">{{ activationLabel }}</dd></div>
          <div><dt class="text-ink-400">Aktif sampai</dt><dd class="font-semibold">{{ expireLabel }}</dd></div>
        </dl>
      </section>

      <!-- Payment -->
      <section class="flex flex-col items-center justify-center rounded-2xl border border-ink-600/70 bg-ink-900/60 p-5 text-center">
        <template v-if="!qr">
          <span class="text-4xl">📱</span>
          <p class="mt-3 text-sm text-ink-300">Buat kode QRIS untuk membayar langganan.</p>
          <BaseButton class="mt-5" :loading="generating" @click="generate">Buat pembayaran</BaseButton>
        </template>

        <template v-else-if="expired">
          <span class="flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-500/15 text-4xl">⌛</span>
          <p class="mt-3 font-bold text-rose-300">QR sudah kedaluwarsa</p>
          <BaseButton class="mt-4" variant="secondary" :loading="generating" @click="generate">Buat QR baru</BaseButton>
        </template>

        <template v-else>
          <div class="rounded-2xl bg-white p-3"><qrcode-vue :value="qr.qrContent" :size="196" level="M" /></div>
          <p class="mt-4 text-xl font-extrabold">{{ formatPrice(qr.totalPayment) }}</p>
          <p class="mt-1 font-mono text-xs text-ink-400">{{ qr.transaction_uuid }}</p>
          <p class="mt-3 flex items-center gap-2 text-sm text-ink-300">
            <span class="h-2 w-2 animate-pulse rounded-full bg-amber-brand" /> Menunggu pembayaran · <b class="tabular-nums text-ink-100">{{ countdownLabel }}</b>
          </p>
        </template>
      </section>
    </div>

    <template #footer>
      <BaseButton variant="secondary" @click="close">Tutup</BaseButton>
    </template>
  </BaseSheet>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import QrcodeVue from 'qrcode.vue'
import BaseSheet from '../ui/BaseSheet.vue'
import BaseButton from '../ui/BaseButton.vue'
import { subscriptionApi } from '../../api/studio'
import { formatPrice } from '../../utils/format'
import { toast } from '../../composables/useToast'

const props = defineProps({ open: Boolean, studioUuid: { type: String, required: true } })
const emit = defineEmits(['close', 'paid'])

const POLL_MS = 3000
const plan = ref({ price: 0, days: 0 })
const qr = ref(null)
const generating = ref(false)
const secondsLeft = ref(0)
let countdownTimer = null
let pollTimer = null

const dateLabel = (date) => date.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })
const activationLabel = computed(() => dateLabel(new Date()))
// Duration is in days (settings.subscription_studio_duration)
const expireLabel = computed(() => {
  const expire = new Date()
  expire.setDate(expire.getDate() + plan.value.days)
  return dateLabel(expire)
})
const expired = computed(() => qr.value && secondsLeft.value <= 0)
const countdownLabel = computed(() => `${String(Math.floor(secondsLeft.value / 60)).padStart(2, '0')}:${String(secondsLeft.value % 60).padStart(2, '0')}`)

function stopTimers() {
  clearInterval(countdownTimer)
  clearInterval(pollTimer)
}

function startTimers() {
  stopTimers()
  const tick = () => {
    secondsLeft.value = Math.max(0, qr.value.expiredQris - Math.floor(Date.now() / 1000))
    if (!secondsLeft.value) stopTimers()
  }
  tick()
  countdownTimer = setInterval(tick, 1000)
  pollTimer = setInterval(async () => {
    const paid = await subscriptionApi.isPaid(props.studioUuid, qr.value.transaction_uuid).catch(() => false)
    if (paid) {
      stopTimers()
      emit('paid')
    }
  }, POLL_MS)
}

// Reuses a still-valid pending QR, otherwise creates a new subscription payment (same order as before)
async function generate() {
  generating.value = true
  try {
    const pending = await subscriptionApi.pendingQr(props.studioUuid)
    qr.value = pending.checkQr ? pending : await subscriptionApi.create(props.studioUuid)
    startTimers()
  } catch (error) {
    toast.error(error.message)
  } finally {
    generating.value = false
  }
}

function close() {
  stopTimers()
  emit('close')
}

watch(() => props.open, async (isOpen) => {
  if (!isOpen) return stopTimers()
  try {
    const price = await subscriptionApi.price()
    plan.value = { price: price.subscriptionPrice, days: price.subscriptionDuration }
  } catch (error) {
    toast.error(error.message)
  }
  if (qr.value && !expired.value) startTimers()
})

onBeforeUnmount(stopTimers)
</script>
