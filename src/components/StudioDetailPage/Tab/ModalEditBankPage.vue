<template>
    <div v-if="show" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

        <div class="bg-white w-full max-w-md rounded-2xl shadow-lg p-6">

            <!-- Title -->
            <h2 class="text-lg font-semibold mb-4 text-gray-800 text-center">
                Pergantian Akun Bank
            </h2>

            <!-- Form -->
            <div class="space-y-4">

                <!-- Nama Bank -->
                <div class="relative">
                    <label class="text-sm text-gray-600">Nama Bank</label>

                    <input type="text" v-model="searchBank" @focus="showDropdownBank = true"
                        placeholder="Cari nama bank..."
                        class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black" />

                    <div v-if="showDropdownBank"
                        class="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow text-black">

                        <div v-for="bank in filteredBanks" :key="bank.id" @click="selectBank(bank)"
                            class="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer">
                            {{ bank.name }}
                        </div>

                        <div v-if="filteredBanks.length === 0" class="px-3 py-2 text-sm text-gray-400">
                            Bank tidak ditemukan
                        </div>
                    </div>
                </div>

                <!-- Nomor Rekening -->
                <div>
                    <label class="text-sm text-gray-600">Nomor Rekening</label>

                    <input type="text" v-model="accountNumber" @keydown="handleKeydown"
                        placeholder="Masukkan nomor rekening"
                        class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                        :class="accountNumber && accountNumber.length < 5 ? 'border-red-500' : ''" />

                    <p v-if="accountNumber && accountNumber.length < 5" class="text-xs text-red-500 mt-1">
                        Minimal 5 digit
                    </p>
                </div>

            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 mt-6">
                <button @click="$emit('close')" class="px-4 py-2 text-sm bg-red-400! rounded-lg">
                    Batal
                </button>

                <button @click="handleSaveBank" :disabled="!isValid"
                    class="px-4 py-2 text-sm bg-blue-600! text-white rounded-lg disabled:bg-blue-200 disabled:cursor-not-allowed">
                    Simpan
                </button>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { editBankAccountApi } from '../../../api/funding'
const router = useRouter()

const studio_uuid = router.currentRoute.value.params.studio_uuid

const props = defineProps({
    show: Boolean,
    bankList: Array
})

const emit = defineEmits(['close', 'submit', 'success'])

const searchBank = ref('')
const selectedBank = ref('')
const accountNumber = ref('')
const showDropdownBank = ref(false)

const filteredBanks = computed(() => {
    if (!searchBank.value) return props.bankList || []
    return props.bankList.filter(b =>
        b.name.toLowerCase().includes(searchBank.value.toLowerCase())
    )
})

const selectBank = (bank) => {
    selectedBank.value = bank.prima_code
    searchBank.value = bank.name
    showDropdownBank.value = false
}

const handleKeydown = (e) => {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']
    if (allowed.includes(e.key)) return
    if (/^[0-9]$/.test(e.key)) return
    e.preventDefault()
}

const isValid = computed(() => {
    return selectedBank.value && accountNumber.value.length >= 5
})

async function handleSaveBank() {
    try {
        const payload = {
            studio_uuid,
            bank_code: selectedBank.value,
            bank_account_number: accountNumber.value

        }

        await editBankAccountApi(payload)


        emit('success')
        emit('close')


    } catch (error) {
        console.log(error)
        alert('Gagal Edit Rekening')
    } 
}

</script>