<template>
  <BaseModal :open="open" icon="✏️" title="Ganti rekening pencairan" @close="emit('close')">
    <div class="mt-4 space-y-4 text-left">
      <AutocompleteInput v-model="bank" label="Bank" placeholder="Cari nama bank…" :search="searchBanks" />
      <BaseInput v-model="accountNumber" label="Nomor rekening" placeholder="Minimal 5 digit" icon="🏦" inputmode="numeric" maxlength="20"
        :error="accountNumber && accountNumber.length < 5 ? 'Minimal 5 digit.' : ''" @input="accountNumber = digitsOnly(accountNumber)" />
    </div>
    <template #actions>
      <BaseButton variant="secondary" @click="emit('close')">Batal</BaseButton>
      <BaseButton :disabled="!isValid" :loading="saving" @click="save">Simpan</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import BaseModal from '../ui/BaseModal.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseInput from '../ui/BaseInput.vue'
import AutocompleteInput from '../ui/AutocompleteInput.vue'
import { fundingApi } from '../../api/funding'
import { digitsOnly } from '../../utils/format'
import { toast } from '../../composables/useToast'

const props = defineProps({ open: Boolean, studioUuid: { type: String, required: true } })
const emit = defineEmits(['close', 'saved'])

const bank = ref(null)
const accountNumber = ref('')
const saving = ref(false)
const isValid = computed(() => !!bank.value && accountNumber.value.length >= 5)

watch(() => props.open, (isOpen) => { if (isOpen) { bank.value = null; accountNumber.value = '' } })

const searchBanks = async (query) => (await fundingApi.banks(query)).data

async function save() {
  saving.value = true
  try {
    await fundingApi.editBankAccount({ studio_uuid: props.studioUuid, bank_code: bank.value.prima_code, bank_account_number: accountNumber.value })
    toast.success('Rekening pencairan berhasil diganti.')
    emit('saved')
  } catch (error) {
    toast.error(error.message)
  } finally {
    saving.value = false
  }
}
</script>
