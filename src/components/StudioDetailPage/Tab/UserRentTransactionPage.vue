<template>
    <div class="max-w-8xl mx-auto p-6 bg-gradient-to-r from-green-600 to-blue-500 rounded-2xl py-5 mt-5">
        <!-- TITLE -->
        <div class="flex justify-between items-center mb-4">

            <h2 class="text-xl font-semibold text-white">
                📄 Histori Penyewaaan
            </h2>

            <button @click="clearFilters"
                class="px-4 py-2 bg-green-300! text-black rounded-lg text-sm font-semibold hover:bg-gray-100 transition">
                Clear Filter
            </button>

        </div>

        <!-- FILTER -->
        <div class="bg-white p-4 rounded-xl shadow mb-4 flex justify-center gap-3 overflow-x-auto">            <!-- SEARCH -->
            <div class="flex flex-col w-48">
                <label class="text-xs text-center text-black mb-1">ID Transaksi</label>
                <input v-model="filters.search" type="text" placeholder="ID Transaksi..."
                    class="border rounded px-3 py-2 text-black" />
            </div>

            <!-- STATUS -->
            <div class="flex flex-col">
                <label class="text-xs text-center text-black mb-1">Status Sewa</label>
                <select v-model="filters.status" class="border rounded px-3 py-2 text-black">
                    <option value="">Semua Status</option>
                    <option value="booked">Sukses</option>
                    <option value="cancelled">Batal</option>
                    <option value="pending">Menunggu</option>
                </select>
            </div>

            <!-- STATUS SETTLEMENT -->
            <div class="flex flex-col">
                <label class="text-xs text-center text-black mb-1">Status Settlement</label>
                <select v-model="filters.settled" class="border rounded px-3 py-2 text-black">
                    <option value="">Semua</option>
                    <option value="1">Selesai</option>
                    <option value="2">Menunggu</option>
                </select>
            </div>

            <!-- NAMA PENYEWA -->
            <div class="flex flex-col">
                <label class="text-xs text-center text-black mb-1">Nama Penyewa</label>
                <input v-model="filters.user_name_rental" type="text" placeholder="Nama Penyewa..."
                    class="border rounded px-3 py-2 text-black" />
            </div>

            <!-- DATE -->
            <div class="flex flex-col md:col-span-2">
                <label class="text-xs text-center text-black mb-1">Filter Tanggal Sewa</label>
                <div class="flex gap-2">
                    <div class="relative w-full">
                        <input ref="startDateRef" v-model="filters.start_date" type="date"
                            class="border rounded px-3 py-2 w-full text-black pr-10 cursor-pointer" />
                        <span @click="openStartDate" class="absolute right-3 top-2.5 cursor-pointer">
                            📅
                        </span>
                    </div>

                    <!-- END DATE -->
                    <div class="relative w-full">
                        <input ref="endDateRef" v-model="filters.end_date" type="date"
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

        <!-- TABLE -->
        <div class="bg-white rounded-xl shadow overflow-x-auto">
            <table class="w-full text-sm text-left">

                <thead class="bg-green-200 ">
                    <tr class="text-black">
                        <th class="p-3">No</th>
                        <th class="p-3">Nama Penyewa</th>
                        <th class="p-3">ID Transaksi</th>
                        <th class="p-3">Studio Nomor</th>
                        <th class="p-3">Tanggal Sewa</th>
                        <th class="p-3">Jam Sewa</th>
                        <th class="p-3">Biaya Sewa</th>
                        <th class="p-3">Biaya Admin</th>
                        <th class="p-3">Total Biaya</th>
                        <th class="p-3">Status Sewa</th>
                        <th class="p-3">Status Pencairan Dana</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(item, index) in transactions" :key="item.transaction_id" class="border-t">

                        <td class="p-3 text-black">{{ index + 1 + (page - 1) * filters.limit }}</td>

                        <td class="p-3 text-black">{{ item.user }}</td>

                        <td class="p-3 text-black">{{ item.id }}</td>

                        <td class="p-3 text-black">{{ item.studio }}</td>

                        <td class="p-3 text-black">{{ item.date }}</td>

                        <td class="p-3 text-black">{{ item.time }}</td>

                        <td class="p-3 text-black">{{ formatRupiah(item.amount) }}</td>

                        <td class="p-3 text-black">{{ formatRupiah(item.admin_fee) }}</td>

                        <td class="p-3 text-black">{{ formatRupiah(item.total_amount) }}</td>


                        <td class="p-3 ">
                            <span :class="getStatusClass(item.payment_status)">
                                {{ getStatusOutput(item.payment_status) }}
                            </span>
                        </td>

                        <td class="p-3 text-black">{{ item.recon_status ? 'Selesai' : 'Menunggu' }}</td>

                    </tr>

                    <tr v-if="transactions.length === 0">
                        <td colspan="12" class="text-center p-4 text-gray-500">
                            Tidak ada data
                        </td>
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

            <p>Page {{ page }}</p>

            <button @click="nextPage" class="px-3 py-1 bg-white! text-black rounded">
                Next
            </button>

        </div>

    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { rentList } from '../../../api/funding'
import { useRouter } from 'vue-router'


const transactions = ref([])
const page = ref(1)
const total = ref(0)

const filters = ref({
    search: '',
    status: '',
    start_date: '',
    end_date: '',
    limit: 10,
    settled: '',
    user_name_rental: ''
})

const router = useRouter()


const studio_uuid = router.currentRoute.value.params.studio_uuid

const startDateRef = ref(null)
const endDateRef = ref(null)

const openStartDate = () => {
    startDateRef.value?.showPicker()
}

const openEndDate = () => {
    endDateRef.value?.showPicker()
}


// FETCH API
const fetchSubscriptionList = async () => {
    try {
        let payload = {
            page: page.value,
            limit: filters.value.limit,
            studio_id: studio_uuid
        }

        // conditional fields
        if (filters.value.search) {
            payload.transaction_id = filters.value.search
        }

        if (filters.value.status) {
            payload.payment_status = filters.value.status
        }

        if (filters.value.settled) {
            payload.recon_status = +filters.value.settled
        }

        if (filters.value.user_name_rental) {
            payload.user_name = +filters.value.user_name_rental
        }

        if (filters.value.start_date) {
            payload.start_date = toEpoch(filters.value.start_date)
        }

        if (filters.value.end_date) {
            payload.end_date = toEpoch(filters.value.end_date, true)
        }


        const response = await rentList(payload)

        transactions.value = response.data.data.data || []
        total.value = response.data.data.total
        page.value = response.data.data.page
    } catch (err) {
        console.error(err)
    }
}

const clearFilters = () => {
    filters.value = {
        search: '',
        status: '',
        start_date: '',
        end_date: '',
        limit: 10
    }

    page.value = 1
    fetchSubscriptionList()
}

const toEpoch = (date, isEnd = false) => {
    if (!date) return null

    const d = new Date(date)

    // kalau end_date → set ke jam 23:59:59
    if (isEnd) {
        d.setHours(23, 59, 59, 999)
    } else {
        d.setHours(0, 0, 0, 0)
    }

    return Math.floor(d.getTime() / 1000)
}

// WATCH FILTER
watch(filters, () => {
    page.value = 1
    fetchSubscriptionList()
}, { deep: true })

// WATCH PAGE
watch(page, fetchSubscriptionList)

// INIT
onMounted(fetchSubscriptionList)

// PAGINATION
const nextPage = () => {
    const maxPage = Math.ceil(total.value / filters.value.limit)
    if (page.value < maxPage) {
        page.value++
    }
}

const prevPage = () => {
    if (page.value > 1) page.value--
}

// FORMAT
const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(val)
}

const formatDate = (val) => {
    if (!val) return '-'
    return new Date(val * 1000).toLocaleString('id-ID')
}

// STATUS COLOR
const getStatusClass = (status) => {
    switch (status) {
        case 'booked':
            return 'text-green-600! font-semibold'
        case 'pending':
            return 'text-yellow-600! font-semibold'
        case 'cancelled':
            return 'text-red-600! font-semibold'
        default:
            return ''
    }
}

const getStatusOutput = (status) => {
    switch (status) {
        case 'booked':
            return 'Sukses'
        case 'pending':
            return 'Menunggu'
        case 'cancelled':
            return 'Batal'
        default:
            return ''
    }
}
</script>