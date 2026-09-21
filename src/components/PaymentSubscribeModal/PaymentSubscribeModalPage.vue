<template>
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl w-[900px] p-6 shadow-xl animate-fadeIn">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-black">Aktivasi Studio</h2>

            </div>

            <div class="grid grid-cols-[1fr_auto_1fr] gap-6">
                <!-- LEFT INFO -->
                <div class="border rounded-lg p-4  hover:bg-green-300 ">
                    <h3 class="font-semibold text-lg mb-3 text-black">Informasi Aktivasi</h3>

                    <div class="space-y-2 text-sm">
                        <p class="font-semibold text-black"><span class="font-semibold text-black">Harga per
                                bulan:</span> Rp {{ format(price) }}</p>
                        <p class="font-semibold text-black"> <span class="font-semibold text-black">Durasi:</span> 1
                            Bulan</p>

                        <div class="mt-4">
                            <p class="font-semibold mb-1 text-black">Tanggal Aktivasi:</p>
                            <p class="font-semibold mb-1 text-black">{{ activationDate }}</p>
                        </div>

                        <div class="mt-4">
                            <p class="font-semibold mb-1 text-black">Aktif sampai:</p>
                            <p class="font-semibold mb-1 text-black">{{ expireDate }}</p>
                        </div>
                    </div>
                </div>

                <!-- SEPARATOR -->
                <div class="border-l-4 border-black"></div>

                <!-- RIGHT ACTION -->
                <div class="border rounded-lg p-4 bg-white flex items-center justify-center hover:bg-blue-300 ">
                    <!-- BUTTON GENERATE -->
                    <div v-if="!qrData" class="w-full flex justify-center">
                        <button @click="generate" :disabled="loadingQr"
                            class="w-64 py-3 rounded-lg font-semibold text-sm shadow text-center transition-all duration-300"
                            :class="loadingQr
                                ? 'bg-gray-400! cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-green-500 hover:scale-105 active:scale-95 text-black'">
                            <span v-if="!loadingQr">Generate Pembayaran</span>

                            <span v-else class="flex items-center justify-center gap-2">
                                <svg class="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4" fill="none" />
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Loading...
                            </span>
                        </button>
                    </div>

                    <!-- LOADING -->
                    <div v-if="loading" class="flex flex-col items-center justify-center py-10">
                        <div class="loader mb-3"></div>
                        <p class="text-sm text-black">Membuat transaksi...</p>
                    </div>

                    <!-- QR -->
                    <div v-if="qrData" class="flex flex-col items-center text-center">

                        <!-- QR NORMAL (BELUM EXPIRED) -->
                        <div v-if="!isExpired">
                            <qrcode-vue :value="qrData.qr" :size="180" level="M"
                                class="rounded-xl border border-gray-300 shadow-sm w-52 h-52 mb-4" />
                        </div>

                        <!-- QR EXPIRED (SIMPOL X / ERROR) -->
                        <div v-else>
                            <div
                                class="w-52 h-52 mb-4 rounded-xl border border-red-600 flex items-center justify-center bg-red-50">
                                <span class="text-red-600 text-6xl font-bold">✕</span>
                            </div>
                            <p class="text-red-600 font-bold text-lg mb-3 flex items-center justify-center">QR EXPIRED
                            </p>
                            <p class="text-xs text-black flex items-center justify-center">Silakan tutup dan lakukan
                                generate ulang</p>

                        </div>

                        <!-- Transaction ID & Amount hanya muncul kalau BELUM EXPIRED -->
                        <div v-if="!isExpired">
                            <p class="text-sm mb-1 text-black"><strong>Transaction ID:</strong> {{ qrData.code }}</p>
                            <p class="text-sm mb-3 text-black"><strong>Expired:</strong> {{ countdownDisplay }}</p>
                            <p class="text-sm mb-3 text-black"><strong></strong>Rp. {{ format(qrData.amount) }}</p>
                            <p class="text-xs text-black">Status pembayaran: <strong>{{ status }}</strong></p>
                        </div>
                    </div>

                </div>
            </div>

            <div class="mt-6 text-right">
                <button @click="close"
                    class="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-500 hover:bg-gray-300 rounded-lg text-sm">Tutup</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onUnmounted, onMounted, computed } from 'vue'
import { checkQrSubscription, checkSubscriptionPayment, subscribeStudio, subscriptionPrice } from '../../api/studio';
import { useRouter } from 'vue-router'
import QrcodeVue from 'qrcode.vue'


const router = useRouter()

const emit = defineEmits(['close-modal'])
const close = () => {
    if (interval) clearInterval(interval)
    if (timer) clearInterval(timer)

    emit("close-modal")
}
const price = ref(null);
const loading = ref(false)
const qrData = ref(null)
const status = ref('MENUNGGU')
let interval = null
const activationDate = ref('')
const expireDate = ref('')
const isExpired = ref(false)
const loadingQr = ref(false)


let expiryEpoch = null


let timer = null
const countdown = ref(0)


const format = (n) => new Intl.NumberFormat('id-ID').format(n)


// GENERATE PAYMENT
const generate = async () => {

    // await checkQrSubscriptionData()
    loadingQr.value = true

    try {
        await checkQrSubscriptionData() // fungsi API kamu
    } finally {
        loadingQr.value = false
    }
}

const checkStatus = async (transaction_uuid) => {
    try {
        const studio_uuid = router.currentRoute.value.params.studio_uuid
        const res = await checkSubscriptionPayment(studio_uuid, transaction_uuid)

        const paymentStatus = res.data.data?.payment_status // sesuaikan field API

        if (paymentStatus) {
            status.value = paymentStatus
        }

        // STOP kalau sudah selesai
        if (paymentStatus === true) {
            clearInterval(interval)
            interval = null

            setTimeout(() => {
                window.location.reload() // 🔥 refresh full page
            }, 800)
        }

    } catch (err) {
        console.error('Check status error:', err)
    }
}

const countdownDisplay = computed(() => {
    if (countdown.value <= 0) return '0 detik'

    const min = Math.floor(countdown.value / 60)
    const sec = countdown.value % 60

    if (min > 0) {
        return `${min}:${sec.toString().padStart(2, '0')} menit`
    } else {
        return `${countdown.value} detik`
    }
})

async function fetchSubscritionPrice() {
    try {
        const response = await subscriptionPrice()
        price.value = response.data.data.subscriptionPrice
        return response
    } catch (error) {
        console.error(error);
        alert('Gagal memuat data studio. Silakan coba lagi.')
    }
}

async function expiredData() {
    const settingData = await fetchSubscritionPrice()

    const subscriptionDuration = settingData.data.data.subscriptionDuration

    const now = new Date()
    activationDate.value = now.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' })

    const expire = new Date()
    expire.setMonth(expire.getMonth() + subscriptionDuration)
    expireDate.value = expire.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' })

    return
}

async function checkQrSubscriptionData() {
    try {
        const studio_uuid = router.currentRoute.value.params.studio_uuid
        const response = await checkQrSubscription(studio_uuid)
        const qrDataCheck = response.data.data.checkQr

        const currentEpoch = Math.floor(Date.now() / 1000)


        if (qrDataCheck) {
            const { qrContent, transaction_uuid, expiredQris, totalPayment } = response.data.data
            expiryEpoch = expiredQris


            qrData.value = {
                qr: qrContent,
                code: transaction_uuid,
                expired: expiredQris,
                amount: totalPayment
            }

            // START polling
            if (interval) clearInterval(interval)

            interval = setInterval(() => {
                checkStatus(transaction_uuid)
            }, 3000)
        } else {

            const response = await subscribeStudio(studio_uuid)
            if (response.data.status) {
                const { qrContent, transaction_uuid, expiredQris, totalPayment } = response.data.data
                expiryEpoch = expiredQris

                qrData.value = {
                    qr: qrContent,
                    code: transaction_uuid,
                    expired: expiredQris,
                    amount: totalPayment
                }

                // START polling
                if (interval) clearInterval(interval)

                interval = setInterval(() => {
                    checkStatus(transaction_uuid)
                }, 3000)
            }
        }

        countdown.value = expiryEpoch - currentEpoch

        timer = setInterval(() => {
            const now = Math.floor(Date.now() / 1000)
            countdown.value = expiryEpoch - now

            if (countdown.value <= 0) {
                countdown.value = 0
                clearInterval(timer)
                timer = null
                isExpired.value = true

                if (interval) {
                    clearInterval(interval)
                    interval = null
                }
            }
        }, 1000)

        return response
    } catch (error) {
        console.error(error)
        alert("Gagal memuat data studio.")
    }
}


onUnmounted(() => {
    if (interval) clearInterval(interval)
    if (timer) clearInterval(timer)
})
onMounted(async () => {
    await Promise.all([expiredData()])
})
</script>

<style>
.loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.animate-fadeIn {
    animation: fadeIn .2s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>