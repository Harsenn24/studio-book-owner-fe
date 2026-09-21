<template>

    <div class="max-w-7xl mx-auto p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">

            <!-- Total Transaksi -->
            <div class="bg-red-100 rounded-2xl p-6 border-2 border-gray-200 shadow-md hover:shadow-lg transition">
                <p class="text-sm text-gray-500 mb-1">Total Transaksi</p>
                <h2 class="text-2xl font-semibold text-gray-800">{{ formatRupiah(
                    ownerTransactionDetailResult.total_amount) }}</h2>
                <p class="text-xs text-gray-400 mt-1">Dari {{ ownerTransactionDetailResult.total_transaction }}
                    penyewaan</p>
            </div>

            <!-- Total Pendapatan -->
            <div class="bg-blue-100 rounded-2xl p-6 border-2 border-gray-200 shadow-md hover:shadow-lg transition">
                <p class="text-sm text-gray-500 mb-1">Total Pendapatan</p>
                <h2 class="text-2xl font-semibold text-gray-800">{{ formatRupiah(ownerTransactionDetailResult.amount) }}
                </h2>
                <p class="text-xs text-gray-400 mt-1">Sudah dikurangi biaya admin</p>
            </div>

            <!-- Saldo Tersedia -->
            <div class="bg-green-100 rounded-2xl p-6 border-2 border-green-300 shadow-md hover:shadow-lg transition">
                <p class="text-sm text-gray-600 mb-1">Saldo Tersedia</p>
                <h2 class="text-2xl font-semibold text-gray-800">{{
                    formatRupiah(ownerTransactionDetailResult.total_amount_recon_pending) }}</h2>
                <p class="text-xs text-green-600 mt-1">Tersedia untuk ditarik</p>
            </div>

            <!-- Saldo Pencairan -->
            <div class="bg-yellow-100 rounded-2xl p-6 border-2 border-green-300 shadow-md hover:shadow-lg transition">
                <p class="text-sm text-gray-600 mb-1">Saldo Pencairan</p>
                <h2 class="text-2xl font-semibold text-gray-800">{{
                    formatRupiah(ownerTransactionDetailResult.total_amount_disbursement) }}</h2>
                <p class="text-xs text-green-600 mt-1">Total Saldo Pencairan</p>
            </div>

        </div>

        <div class="bg-white border border-gray-200 rounded-2xl shadow p-4 mt-6">
            <button @click="fetchRecon" :disabled="loadingRecon"
                class="w-full bg-blue-600! hover:bg-blue-700! text-white px-4 py-2 rounded-lg shadow transition disabled:opacity-50">
                {{ loadingRecon ? 'Processing...' : '🔄 Rekonsiliasi Data' }}
            </button>
        </div>

        <!-- Informasi Rekening Pencairan -->
        <div class="bg-white border border-gray-200 rounded-2xl shadow p-4 mt-6">

            <p class="text-sm font-semibold text-gray-700 mb-3">
                Informasi Rekening Pencairan
            </p>

            <div class="flex flex-col md:flex-row gap-4 items-center">

                <!-- Info Rekening -->
                <div class="flex-1 bg-gray-50 border rounded-lg p-3 text-sm text-gray-700">
                    <div class="flex justify-between items-start gap-4">

                        <!-- Info Rekening -->
                        <div>
                            <p class="font-medium">
                                {{ ownerTransactionDetailResult.bank.bank_name }}

                            </p>
                            <p>{{ ownerTransactionDetailResult.bank.bank_account }}</p>
                        </div>

                        <!-- Tombol -->
                        <button @click="handleChangeBank"
                            class="text-xs bg-blue-500! hover:bg-blue-600! text-white px-3 py-1 rounded-lg shadow whitespace-nowrap">
                            Ganti Nomor Rekening
                        </button>

                    </div>
                </div>

                <!-- Input Nominal -->
                <div class="flex-1 w-full">
                    <label class="text-xs text-gray-500">Jumlah Penarikan</label>
                    <input type="text" :value="formattedWithdraw" @input="handleInput" @keydown="handleKeydown"
                        placeholder="Rp 0"
                        class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 text-black focus:ring-blue-400"
                        :class="showErrorInputWithDraw ? 'border-red-500!' : 'border-gray-300'" />

                    <p class="text-xs mt-2 min-h-[16px]"
                        :class="withdrawErrorMessage ? 'text-red-500!' : 'text-transparent'">
                        {{ withdrawErrorMessage || '.' }}
                    </p>
                </div>

                <!-- Tombol Tarik Dana -->
                <div class="w-full md:w-auto">
                    <button @click="handleTransfer" :disabled="!isValidWithdraw" :class="[
                        'w-full md:w-auto text-white px-6 py-2 rounded-lg shadow transition',
                        isValidWithdraw
                            ? 'bg-gradient-to-r from-blue-500 to-green-500 hover:opacity-90'
                            : 'bg-gray-400! cursor-not-allowed'
                    ]">
                        Tarik Dana
                    </button>


                </div>

            </div>
        </div>

        <!-- FILTER -->
        <div class="bg-white p-4 rounded-xl shadow mb-4 grid md:grid-cols-5 gap-3 items-end mt-6">

            <!-- SEARCH -->
            <div class="flex flex-col">
                <label class="text-xs text-center text-black mb-1">Filter ID Transaksi</label>
                <input v-model="filters.transaction_id" type="text" placeholder="ID Transaksi..."
                    class="border rounded px-3 py-2 text-black" />
            </div>

            <!-- STATUS -->
            <div class="flex flex-col">
                <label class="text-xs text-center text-black mb-1">Filter Status Pembayaran</label>
                <select v-model="filters.status" class="border rounded px-3 py-2 text-black">
                    <option value="">Semua Status</option>
                    <option value="success">Sukses</option>
                    <option value="pending">Menunggu</option>
                    <option value="failed">Gagal</option>
                </select>
            </div>

            <!-- DATE -->
            <div class="flex flex-col md:col-span-2">
                <label class="text-xs text-center text-black mb-1">Filter Tanggal</label>
                <div class="flex gap-2">
                    <div class="relative w-full">
                        <input ref="startDateRef" v-model="filters.date_start" type="date"
                            class="border rounded px-3 py-2 w-full text-black pr-10 cursor-pointer" />
                        <span @click="openStartDate" class="absolute right-3 top-2.5 cursor-pointer">
                            📅
                        </span>
                    </div>

                    <!-- END DATE -->
                    <div class="relative w-full">
                        <input ref="endDateRef" v-model="filters.date_end" type="date"
                            class="border rounded px-3 py-2 w-full text-black pr-10 cursor-pointer" />
                        <span @click="openEndDate" class="absolute right-3 top-2.5 cursor-pointer">
                            📅
                        </span>
                    </div>
                </div>
            </div>

            <!-- LIMIT -->
            <div class="flex flex-col">
                <label class="text-xs text-center text-black mb-1">Total Data</label>
                <select v-model="filters.limit" class="border rounded px-3 py-2 text-black">
                    <option :value="10">10</option>
                    <option :value="25">25</option>
                    <option :value="50">50</option>
                    <option :value="100">100</option>
                </select>
            </div>

        </div>

        <div class=" rounded-xl shadow overflow-x-auto">
            <!-- TITLE -->
            <div class="flex justify-between items-center mb-1 p-4 bg-red-200">

                <h2 class="text-xl font-semibold text-black!">
                    📄 Histori Berlangganan
                </h2>

                <button @click="clearFilters"
                    class="px-4 py-2 bg-red-500! text-black rounded-lg text-sm font-semibold hover:bg-gray-100 transition">
                    Clear Filter
                </button>

            </div>
            <table class="w-full text-sm text-left p-4">
                <thead class="bg-red-200 ">
                    <tr class="text-black">
                        <th class="p-3">No</th>
                        <th class="p-3">ID Transaksi</th>
                        <th class="p-3">Jumlah</th>
                        <th class="p-3">Tanggal</th>
                        <th class="p-3">Status</th>
                        <th class="p-3">Bank</th>
                        <th class="p-3">Nomor Rekening</th>
                        <th class="p-3">Nama Penerima</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(item, index) in listDisbursment" :key="item.id" class="border-b hover:bg-gray-50">
                        <td class="p-3 text-black">{{ index + 1 }}</td>
                        <td class="p-3 font-medium text-blue-600">
                            {{ item.id }}
                        </td>
                        <td class="p-3 text-black">
                            Rp {{ item.amount.toLocaleString('id-ID') }}
                        </td>
                        <td class="p-3 text-black">{{ formatDate(item.transaction_date) }}</td>

                        <td class="p-3">
                            <span :class="[
                                'px-3 py-1 rounded-full text-xs font-semibold',
                                item.payment_status === 'success'
                                    ? 'bg-green-100 text-green-700'
                                    : item.payment_status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-red-100 text-red-700'
                            ]">
                                {{ item.payment_status }}
                            </span>
                        </td>

                        <td class="p-3 text-black">{{ item.bank_name }}</td>
                        <td class="p-3 text-black">{{ item.bank_account }}</td>
                        <td class="p-3 text-black">{{ item.bank_account_name }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- PAGINATION -->
        <div class="flex justify-between items-center mt-4">

            <button @click="prevPage" :disabled="page === 1"
                class="px-3 py-1 bg-white! text-black rounded disabled:opacity-70">
                Prev
            </button>

            <div class="text-black!">
                <p>Page {{ page }}</p>
            </div>

            <button @click="nextPage" class="px-3 py-1 bg-white! text-black rounded">
                Next
            </button>

        </div>
    </div>



    <ModalEditBankPage :show="showBankModal" :bankList="bankList" @close="showBankModal = false"
        @success="fetchOwnerTransactionDetail" />

    <ModalTransferPage :show="showTransferModal" @close="showTransferModal = false; fetchOwnerTransactionDetail();"
        :withdrawAmount="withdrawAmount" :adminFeeTransfer="adminFeeTransfer" :totalTransfer="totalTransfer"
        :transactionDetail="ownerTransactionDetailResult" />

</template>

<script setup>

import { ref, onMounted, computed, watch } from 'vue'
import { bankListApi, ownerTransactionDetailApi, reconApi, adminTransferFeeApi, disbursementListApi } from '../../../api/funding'
import { useRouter } from 'vue-router'
import ModalEditBankPage from './ModalEditBankPage.vue'
import ModalTransferPage from './ModalTransferPage.vue'
const router = useRouter()

const formatDate = (val) => {
    if (!val) return '-'
    return new Date(val * 1000).toLocaleString('id-ID')
}

const startDateRef = ref(null)
const endDateRef = ref(null)
const page = ref(1)
const total = ref(0)

const clearFilters = () => {
    filters.value = {
        date_start: '',
        date_end: '',
        transaction_id: '',
        limit: 10,
        status: '',
    }

    page.value = 1
    fetchDisbursementList()
}

const nextPage = () => {
    const maxPage = Math.ceil(total.value / filters.value.limit)
    if (page.value < maxPage) {
        page.value++
    }
}

const prevPage = () => {
    if (page.value > 1) page.value--
}

const openStartDate = () => {
    startDateRef.value?.showPicker()
}

const openEndDate = () => {
    endDateRef.value?.showPicker()
}

const toEpoch = (date, isEnd = false) => {
    if (!date) return null

    const d = new Date(date)

    if (isEnd) {
        d.setHours(23, 59, 59, 999)
    } else {
        d.setHours(0, 0, 0, 0)
    }

    return Math.floor(d.getTime() / 1000)
}

const listDisbursment = ref([])

const filters = ref({
    date_start: '',
    date_end: '',
    transaction_id: '',
    limit: 10,
    status: '',
})

const ownerTransactionDetailResult = ref({
    total_transaction: 0,
    total_amount: 0,
    amount: 0,
    total_amount_recon_pending: 0,
    total_amount_disbursement: 0,
    bank: {
        bank_name: "",
        bank_alias: "",
        bank_account: "",
        bank_code: ""
    }
})

const withdrawAmount = ref(0)
const MIN_WITHDRAW = 50000
const studio_uuid = router.currentRoute.value.params.studio_uuid
const loadingRecon = ref(false)
const showBankModal = ref(false)
const bankList = ref([])
const loadingBank = ref(false)
const showTransferModal = ref(false)
const adminFeeTransfer = ref(0)
const totalTransfer = ref(0)

const isValidWithdraw = computed(() => {
    return withdrawAmount.value >= MIN_WITHDRAW && withdrawAmount.value + adminFeeTransfer.value <= ownerTransactionDetailResult.value.total_amount_recon_pending
})

const showErrorInputWithDraw = computed(() => {
    return withdrawAmount.value > 0 && withdrawAmount.value < MIN_WITHDRAW
})

const withdrawErrorMessage = computed(() => {
    if (!withdrawAmount.value || withdrawAmount.value < MIN_WITHDRAW) {
        return `Minimal penarikan Rp ${MIN_WITHDRAW.toLocaleString('id-ID')}`
    }

    if (
        withdrawAmount.value + adminFeeTransfer.value >
        ownerTransactionDetailResult.value.total_amount_recon_pending
    ) {
        return 'Saldo tidak mencukupi'
    }

    return ''
})

const fetchOwnerTransactionDetail = async () => {
    try {
        const payload = {
            studio_uuid
        }

        const response = await ownerTransactionDetailApi(payload)
        const dataResponse = response.data.data
        ownerTransactionDetailResult.value = dataResponse

    } catch (error) {
        console.log(error)
    }
}

const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(val)
}


const formatRupiahv2 = (val) => {
    if (!val) return 'Rp 0'
    return 'Rp ' + Number(val).toLocaleString('id-ID')
}

const formattedWithdraw = computed(() => {
    return formatRupiahv2(withdrawAmount.value)
})

const handleInput = (e) => {
    let value = e.target.value

    value = value.replace(/\D/g, '')

    withdrawAmount.value = value ? Number(value) : 0
}

const handleKeydown = (e) => {
    const allowedKeys = [
        'Backspace',
        'Delete',
        'ArrowLeft',
        'ArrowRight',
        'Tab'
    ]

    if (allowedKeys.includes(e.key)) return
    if (/^[0-9]$/.test(e.key)) return
    e.preventDefault()
}

const handleChangeBank = async () => {
    showBankModal.value = true

    try {
        loadingBank.value = true

        const res = await bankListApi({ search: "" })
        bankList.value = res.data?.data.data || []

    } catch (err) {
        console.log(err)
        alert('Gagal memuat data bank')
    } finally {
        loadingBank.value = false
    }
}

const handleTransfer = async () => {
    await fetchOwnerTransactionDetail()
    await fetchAdminTransferFee()
    totalTransfer.value = withdrawAmount.value + adminFeeTransfer.value
    showTransferModal.value = true
}

const fetchRecon = async () => {
    try {
        loadingRecon.value = true

        const payload = {
            studio_id: studio_uuid
        }

        await reconApi(payload)
        await fetchOwnerTransactionDetail()

    } catch (error) {
        console.log(error)
        alert('Gagal melakukan rekonsiliasi')
    } finally {
        loadingRecon.value = false
    }
}

const fetchAdminTransferFee = async () => {
    try {
        const response = await adminTransferFeeApi()
        const dataResponse = response.data.data
        adminFeeTransfer.value = dataResponse.admin_transfer

    } catch (error) {
        console.log(error)
        alert('Gagal memuat fee transfer')
    }
}

const fetchDisbursementList = async () => {
    try {
        let payload = {
            page: page.value,
            limit: filters.value.limit,
            studio_id: studio_uuid
        }

        if (filters.value.search) {
            payload.search = filters.value.search
        }

        if (filters.value.status) {
            payload.status = filters.value.status
        }

        if (filters.value.date_start) {
            payload.date_start = toEpoch(filters.value.date_start)
        }

        if (filters.value.date_end) {
            payload.date_end = toEpoch(filters.value.date_end)
        }

        if (filters.value.transaction_id) {
            payload.transaction_id = filters.value.transaction_id
        }

        const res = await disbursementListApi(payload)
        listDisbursment.value = res.data.data.data
        page.value = res.data.data.page
        total.value = res.data.data.total

    } catch (error) {
        console.error(err)
    }
}

watch(filters, () => {
    page.value = 1
    fetchDisbursementList()
}, { deep: true })

watch(page, fetchDisbursementList)


onMounted(async () => {
    await Promise.all([fetchOwnerTransactionDetail(), fetchAdminTransferFee(), fetchDisbursementList()])
})

</script>