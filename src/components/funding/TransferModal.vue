<template>
  <BaseModal :open="open" icon="🏦" title="Konfirmasi tarik dana" :dismissible="!transferring" @close="close">
    <dl class="mt-2 space-y-3 text-left text-sm">
      <div class="flex justify-between gap-4"><dt class="text-ink-400">Bank</dt><dd class="font-semibold">{{ bank.bank_name }}</dd></div>
      <div class="flex justify-between gap-4"><dt class="text-ink-400">Rekening tujuan</dt><dd class="font-mono font-semibold">{{ bank.bank_account }}</dd></div>
      <div class="flex items-center justify-between gap-4">
        <dt class="text-ink-400">Pemilik rekening</dt>
        <dd v-if="accountName" class="font-semibold text-emerald-300">✓ {{ accountName }}</dd>
        <dd v-else><BaseButton size="sm" variant="secondary" :loading="checking" @click="inquiry">Cek rekening</BaseButton></dd>
      </div>
      <div class="border-t border-ink-600/60 pt-3" />
      <div class="flex justify-between gap-4"><dt class="text-ink-400">Dana diterima</dt><dd>{{ formatPrice(amount) }}</dd></div>
      <div class="flex justify-between gap-4"><dt class="text-ink-400">Biaya admin</dt><dd>{{ formatPrice(fee) }}</dd></div>
      <div class="flex justify-between gap-4 rounded-xl bg-ink-900/70 px-3 py-2.5 text-base font-extrabold"><dt>Dipotong dari saldo</dt><dd class="text-brand-gradient">{{ formatPrice(total) }}</dd></div>
    </dl>
    <p v-if="!accountName" class="mt-4 text-xs text-ink-400">Cek rekening dulu untuk memastikan nama pemiliknya benar.</p>

    <template #actions>
      <BaseButton variant="secondary" :disabled="transferring" @click="close">Batal</BaseButton>
      <BaseButton :disabled="!accountName" :loading="transferring" @click="confirm">Tarik dana</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import BaseModal from '../ui/BaseModal.vue'
import BaseButton from '../ui/BaseButton.vue'
import { fundingApi } from '../../api/funding'
import { formatPrice } from '../../utils/format'
import { toast } from '../../composables/useToast'

const props = defineProps({
  open: Boolean,
  studioUuid: { type: String, required: true },
  bank: { type: Object, required: true },
  amount: { type: Number, required: true }, // what the owner receives
  fee: { type: Number, required: true },
})
const emit = defineEmits(['close', 'done'])

// The backend debits `amount` and transfers `amount - fee`, so the requested sum includes the fee
const total = computed(() => props.amount + props.fee)
const accountName = ref('')
const checking = ref(false)
const transferring = ref(false)

watch(() => props.open, (isOpen) => { if (isOpen) accountName.value = '' })

async function inquiry() {
  checking.value = true
  try {
    const result = await fundingApi.inquiry({
      studio_id: props.studioUuid, amount: String(total.value), bank_code: props.bank.bank_code, account_number: props.bank.bank_account,
    })
    accountName.value = result.account_name
  } catch (error) {
    toast.error(error.message)
  } finally {
    checking.value = false
  }
}

async function confirm() {
  transferring.value = true
  try {
    await fundingApi.transfer({ studio_id: props.studioUuid, amount: String(total.value), account_name: accountName.value })
    toast.success(`Penarikan ${formatPrice(props.amount)} berhasil diproses.`)
    emit('done')
  } catch (error) {
    toast.error(error.message)
  } finally {
    transferring.value = false
  }
}

const close = () => { if (!transferring.value) emit('close') }
</script>
