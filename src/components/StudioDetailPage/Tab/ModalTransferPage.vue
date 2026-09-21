<template>
    <div v-if="show" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

        <div class="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6">

            <!-- Header -->
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold text-gray-800">Tarik Dana</h2>
                <button @click="handleClose()"
                    class="bg-white!  border border-gray-300! text-black hover:text-gray-600! hover:border-black! text-xl">×</button>
            </div>

            <p class="text-sm text-gray-500 mb-4">
                Mohon periksa kembali detail penarikan dana Anda
            </p>

            <!-- Detail -->
            <div class="space-y-3 text-sm text-gray-700">

                <div class="flex justify-between">
                    <span>Nama Bank</span>
                    <span class="font-medium">{{ transactionDetail?.bank?.bank_name }}</span>
                </div>

                <div class="flex justify-between">
                    <span>Rekening Tujuan</span>
                    <span class="font-medium">{{ transactionDetail?.bank?.bank_account }}</span>
                </div>

                <div class="flex justify-between items-center">
                    <span>Pemilik Rekening</span>

                    <!-- Jika sudah inquiry -->
                    <span v-if="isInquiry" class="font-medium text-right">
                        {{ accountHolderName }}
                    </span>

                    <!-- Jika belum inquiry -->
                    <button v-else
                        @click="handleInquiry(transactionDetail?.bank?.bank_code, transactionDetail?.bank?.bank_account, totalTransfer)"
                        :disabled="loadingInquiry"
                        class="bg-blue-500! hover:bg-blue-600! text-white text-xs px-3 py-1 rounded-lg shadow disabled:opacity-50">
                        {{ loadingInquiry ? 'Checking...' : 'Inquiry Rekening' }}
                    </button>
                </div>

                <hr class="my-2" />

                <div class="flex justify-between">
                    <span>Dana</span>
                    <span class="font-medium">{{ formatRupiah(props.withdrawAmount) }}</span>
                </div>

                <div class="flex justify-between">
                    <span>Biaya Admin</span>
                    <span class="font-medium">{{ formatRupiah(props.adminFeeTransfer) }}</span>
                </div>

                <!-- Total -->
                <div class="flex justify-between bg-blue-50 rounded-lg px-3 py-2 mt-2">
                    <span class="font-semibold text-blue-600">Total Dana</span>
                    <span class="font-bold text-blue-600">{{ formatRupiah(props.totalTransfer) }}</span>
                </div>

            </div>

            <!-- Actions -->
            <div class="flex gap-3 mt-6">
                <button @click="handleClose()"
                    class="w-full bg-gray-200! hover:bg-gray-300! text-gray-700 py-2 rounded-lg">
                    Batal
                </button>

                <button @click="handleConfirm(accountHolderName, totalTransfer)"
                    :disabled="!isInquiry || loadingTransfer" :class="[
                        'w-full py-2 rounded-lg text-white transition',
                        !isInquiry || loadingTransfer
                            ? 'bg-gray-400! cursor-not-allowed'
                            : 'bg-gradient-to-r! from-blue-500! to-green-500! hover:opacity-90'
                    ]">
                    {{ loadingTransfer ? 'Memproses Tarik Dana...' : 'Konfirmasi Tarik Dana' }}
                </button>
            </div>

            <p v-if="!isInquiry" class="mt-3 text-sm text-red-500! text-center">
                Silakan lakukan inquiry rekening terlebih dahulu sebelum melakukan konfirmasi tarik dana.
            </p>

        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { inquiryApi, transferApi } from '../../../api/funding'
const router = useRouter()


const studio_uuid = router.currentRoute.value.params.studio_uuid
const isInquiry = ref(false)
const accountHolderName = ref('')
const loadingInquiry = ref(false)
const loadingTransfer = ref(false)


const handleInquiry = async (bank_code, account_number, amount) => {
    try {
        loadingInquiry.value = true

        const payload = {
            studio_id: studio_uuid,
            amount: amount.toString(),
            bank_code: bank_code,
            account_number: account_number
        }


        const res = await inquiryApi(payload)
        if (res.data.message !== "success") throw new Error(res.data.message)
        accountHolderName.value = res.data.data.account_name

        isInquiry.value = true
    } catch (error) {
        console.log(error)
        alert('Gagal inquiry rekening')
    } finally {
        loadingInquiry.value = false
    }
}

const props = defineProps({
    show: Boolean,
    transactionDetail: Object,
    withdrawAmount: Number,
    adminFeeTransfer: Number,
    totalTransfer: Number
})

const formatRupiah = (val) => {
    return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
}

const emit = defineEmits(['close', 'confirm'])

const handleConfirm = async (account_name, amount) => {
    try {
        loadingTransfer.value = true

        const payload = {
            studio_id: studio_uuid,
            amount: amount.toString(),
            account_name
        }


        const res = await transferApi(payload)
        if (res.data.message !== "success") throw new Error(res.data.message)

        props.withdrawAmount = 0

        emit('confirm')
        emit('close')
    } catch (error) {
        console.log(error)
        alert('Gagal konfirmasi tarik dana')
    } finally {
        loadingTransfer.value = false
    }

}

const handleClose = () => {
    isInquiry.value = false
    emit('close')
}

</script>