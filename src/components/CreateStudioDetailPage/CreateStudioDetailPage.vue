<template>
    <div class="min-h-screen bg-gradient-to-b from-white to-gray-50 py-10 px-6 flex flex-col gap-10">
        <HeadersPage />

        <div class="w-full h-1 bg-gradient-to-r from-green-600 to-blue-500 rounded"></div>

        <h1
            class="text-3xl font-bold text-center bg-gradient-to-r from-green-600 to-blue-500 bg-clip-text text-transparent">
            {{ editPageFlag ? 'Edit Detail Studio' : 'Register Detail Studio' }}</h1>

        <!-- STEP 1: Pilih Equipment -->
        <section class="bg-gradient-to-r from-green-600 to-blue-500 shadow rounded-2xl p-6">

            <h2 class="text-xl font-semibold text-white mb-4">
                {{ editPageFlag ? "1️⃣ Edit Jumlah Alat Musik" : "1️⃣ Pilih & Atur Jumlah Alat Musik" }}
            </h2>

            <div v-if="editPageFlag">
                <div v-if="studio_number_detail?.studio_equipment?.length"
                    class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

                    <div v-for="eq in studio_number_detail.studio_equipment" :key="eq.equipment_id"
                        class="p-4 border rounded-xl flex justify-between items-center hover:shadow-md transition bg-white">

                        <p class="font-medium text-slate-800">{{ eq.name }}</p>

                        <input type="number" min="0" v-model.number="selectedEquipments[eq.equipment_id]"
                            class="w-20 rounded-lg border px-2 py-1 text-center text-sm border-gray-400 text-black" />
                    </div>
                </div>

                <p v-else class="text-gray-500 italic text-sm">Loading equipment...</p>
            </div>

            <div v-else>
                <div v-if="equipments.length" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

                    <div v-for="eq in equipments" :key="eq.equipment_id"
                        class="p-4 border rounded-xl flex justify-between items-center hover:shadow-md transition bg-white">

                        <p class="font-medium text-slate-800">{{ eq.equipment_name }}</p>

                        <input type="number" min="0" v-model.number="selectedEquipments[eq.equipment_id]"
                            class="w-20 rounded-lg border px-2 py-1 text-center text-sm border-gray-400 text-black" />
                    </div>
                </div>

                <p v-else class="text-gray-500 italic text-sm">Loading equipment...</p>
            </div>

        </section>


        <!-- STEP 2: Harga Weekend/Weekday -->
        <section class="bg-gradient-to-r from-green-600 to-blue-500 shadow rounded-2xl p-6">
            <h2 class="text-xl font-semibold mb-4 text-white"> {{ editPageFlag ? `2️⃣ Edit Harga Sewa` : `2️⃣ Atur Harga
                Sewa` }}</h2>
            <div class="flex flex-col md:flex-row gap-6">
                <div class="flex-1 bg-white rounded-lg p-4">
                    <label class="block text-sm font-medium text-black">Harga Weekday</label>
                    <input type="number" v-model.number="prices.weekday"
                        class="mt-2 w-full rounded-lg border px-3 py-2 text-sm border-gray-400 text-black"
                        :placeholder="editPageFlag ? studio_number_detail?.price_weekday : 'Contoh: 50000'" />
                </div>
                <div class="flex-1 bg-white rounded-lg p-4">
                    <label class="block text-sm font-medium text-black">Harga Weekend</label>
                    <input type="number" v-model.number="prices.weekend"
                        class="mt-2 w-full rounded-lg border px-3 py-2 text-sm border-gray-400 text-black"
                        :placeholder="editPageFlag ? studio_number_detail?.price_weekend : 'Contoh: 50000'" />
                </div>
            </div>
        </section>

        <!-- STEP 3: Jam Operasional -->
        <section class="bg-gradient-to-r from-green-600 to-blue-500 shadow rounded-2xl p-6">
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-white mb-4">3️⃣ Atur Jam Operasional</h2>
            </div>

            <div v-for="(op, index) in operationalList" :key="op.uid" class="space-y-4 mb-6">

                <div class="flex items-center gap-4">

                    <button v-if="(op.delete_able)" @click="removeOperational(index)"
                        class="text-xs bg-red-500! text-white ml-2">
                        Hapus
                    </button>

                    <div v-if="editPageFlag" class="rounded-lg p-4">
                        <label class="block text-sm font-medium text-white">Operasional ?</label>

                        <label class="mt-3 inline-flex items-center cursor-pointer">
                            <input type="checkbox" v-model="op.is_operational" class="sr-only peer"
                                :checked="op.is_operational" />

                            <!-- Track -->
                            <div class="relative w-12 h-7 
                    bg-gray-400 rounded-full 
                    peer-checked:bg-blue-500
                    transition-colors duration-300">

                                <!-- Knob -->
                                <div class="absolute top-0.5 left-0.5 
                       w-6 h-6 rounded-full
                       !bg-white
                       shadow-md
                       transition-all duration-300
                       peer-checked:translate-x-5">
                                </div>
                            </div>

                            <span class="ml-3 text-sm text-white">
                                {{ op.is_operational ? 'Beroperasi' : 'Tidak Beroperasi' }}
                            </span>
                        </label>
                    </div>

                </div>


                <div class="flex flex-col md:flex-row gap-4 items-start">

                    <!-- Tanggal -->
                    <div class="flex-1 bg-white rounded-lg p-4">
                        <label class="block text-sm font-medium text-slate-600">Tanggal</label>


                        <select v-model="op.date" :disabled="!op.delete_able"
                            :class="!op.delete_able ? 'opacity-50 pointer-events-none' : ''"
                            class="mt-2 w-full rounded-lg border px-3 py-2 text-sm border-gray-400 text-black">
                            <option disabled value="">Pilih tanggal</option>
                            <option v-for="d in filteredDates(index)" :key="d.id" :value="d.date">
                                {{ d.date }}
                            </option>
                        </select>

                        <p v-if="op.date && usedDateCount(op.date) > 1" class="text-xs text-red-600 mt-1">
                            Tanggal sudah dipakai.
                        </p>
                    </div>

                    <!-- Jam Buka -->
                    <div class="flex-1 bg-white rounded-lg p-4">
                        <label class="block text-sm font-medium text-slate-600">Jam Buka</label>

                        <select v-model="op.open" :disabled="!op.delete_able"
                            :class="!op.delete_able ? 'opacity-50 pointer-events-none' : ''"
                            class="mt-2 w-full rounded-lg border px-3 py-2 text-sm border-gray-400 text-black">
                            <option disabled value="">Pilih Jam Buka</option>
                            <option v-for="h in hours" :key="h.id" :value="h.hour_time">
                                {{ h.hour_time }}
                            </option>
                        </select>

                    </div>

                    <!-- Jam Tutup -->
                    <div class="flex-1 bg-white rounded-lg p-4">
                        <label class="block text-sm font-medium text-slate-600">Jam Tutup</label>

                        <select v-model="op.close" :disabled="!op.delete_able"
                            :class="!op.delete_able ? 'opacity-50 pointer-events-none' : ''"
                            class="mt-2 w-full rounded-lg border px-3 py-2 text-sm border-gray-400 text-black">
                            <option disabled value="">Pilih Jam Tutup</option>
                            <option v-for="h in hours" :key="h.id" :value="h.hour_time">
                                {{ h.hour_time }}
                            </option>
                        </select>


                        <p v-if="op.open && op.close && !validTime(op)" class="text-xs text-red-600 mt-1">
                            Jam buka harus lebih kecil dari jam tutup.
                        </p>
                    </div>


                </div>
            </div>

            <!-- Tombol Download + Upload -->
            <div class="flex justify-between">
                <div class="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">

                    <!-- Download Template -->
                    <button @click="downloadTemplate"
                        class="bg-white! text-green-700! font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition">
                        📥 Download Template Jam Operasional
                    </button>

                    <!-- Upload Template -->
                    <div>
                        <label
                            class="bg-white text-blue-700 font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer">
                            ⬆️ Upload Template Jam Operasional
                            <input type="file" accept=".xlsx" class="hidden" @change="handleUpload">
                        </label>

                    </div>
                    <p v-if="uploadStatus" class="text-xs text-white mt-1">
                        {{ uploadStatus }}
                    </p>
                </div>
                <button class="text-xl font-semibold text-white bg-red-500! mb-4 px-3 py-1 rounded"
                    :class="{ 'opacity-50 cursor-not-allowed': !canAddOperational }" :disabled="!canAddOperational"
                    @click="addOperational" aria-disabled="!canAddOperational">
                    + Tambah Jam Operasional
                </button>
            </div>

            <p class="text-sm font-bold text-white mt-1">
                CATATAN : <br></br>
                1. pastikan jam buka dan tutup sesuai dengan jam operasional studio. <br>
                2. jam buka harus lebih kecil dari jam tutup. <br>
                3. setiap tanggal hanya bisa dipilih sekali saja. <br>
                4. jika ingin menambah jam operasional, klik tombol "Tambah Jam Operasional". <br>
                5. jika ingin menghapus jam operasional, klik tombol "Hapus". <br>
                6. jam operasional yang sudah diatur tidak bisa diubah setelah disimpan. <br>
                7. Jika jam buka pukul 09:00 dan jam tutup pukul 18:00, maka penyewaan dibagi per 1 Jam.
            </p>

        </section>

        <!-- STEP 4: Pilih Gambar Studio -->
        <section class="bg-white shadow rounded-2xl p-6 items-center">
            <div v-if="editPageFlag">
                <h2 class="text-xl font-semibold text-slate-700 mb-4">4️⃣ Review & Ganti Foto Studio</h2>

                <div class="flex justify-center bg-gradient-to-r from-green-600 to-blue-500 p-5">
                    <!-- Wrapper untuk clickable image -->
                    <div class="relative w-96 h-60 group cursor-pointer">
                        <!-- Hidden input file -->
                        <input type="file" accept="image/*" ref="imageInput" class="hidden"
                            @change="handleImageUpload" />

                        <!-- Gambar -->
                        <img :src="previewImage || `${BE_BASE_URL}uploads/${studio_number_detail?.file_name}`"
                            class="w-full h-full object-cover rounded-xl border" @click="triggerFilePicker" />

                        <!-- Overlay “Change Photo” -->
                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                   flex items-center justify-center text-white font-semibold 
                   text-xl rounded-xl transition" @click="triggerFilePicker">
                            Change Photo
                        </div>
                    </div>
                </div>

                <div class="my-4 h-px bg-gray-300"></div>

            </div>

            <div v-else>
                <h2 class="text-xl font-semibold text-slate-700 mb-4">4️⃣ Pilih Foto Studio</h2>
                <div v-if="documents.length" class="grid md:grid-cols-3 gap-4">
                    <div v-for="doc in documents" :key="doc.id"
                        class="relative rounded-xl overflow-hidden border-2 transition cursor-pointer"
                        :class="doc.id === selectedDocumentId ? 'border-blue-500 shadow-lg' : 'border-gray-300'"
                        @click="selectedDocumentId = doc.id">
                        <img :src="`${BE_BASE_URL}uploads/${doc.file_name}`" class="w-full h-40 object-cover" />
                    </div>
                </div>
                <p v-else class="text-gray-500 italic text-sm">Menunggu data gambar...</p>
            </div>

        </section>

        <!-- Submit -->
        <div class="text-center">
            <button @click="submit(editPageFlag)" :disabled="loading"
                class="px-6 py-3 bg-blue-400! hover:bg-blue-500! text-white font-medium rounded-xl shadow">
                {{ loading ? 'Menyimpan...' : '💾 Simpan Detail Studio' }}
            </button>
        </div>

        <ModalStudioNumberSuccessPage v-if="showModalStudioNumberSuccessPage" :studio_uuid="studio_uuid" />
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'vue-router'
import { getIpAdresses } from '../../services/axios/ip-adress.services.js'
import HeadersPage from '../HeadersPage/HeadersPage.vue'
import ModalStudioNumberSuccessPage from '../ModalStudioNumberSuccessPage/ModalStudioNumberSuccessPage.vue'
import { editStudioNumber, studioNumberDetail } from '../../api/studio.js'

const router = useRouter()
// ---------- CONFIG ----------
const BE_BASE_URL = import.meta.env.VITE_STUDIO_BAND_BE_BASE_URL || '/'
// ---------- STATE ----------
const equipments = ref([])
const selectedEquipments = reactive({})
const prices = reactive({ weekday: '', weekend: '' })
const dates = ref([])
const documents = ref([])
const selectedDocumentId = ref(null)
const hours = ref([])
const loading = ref(false)
const showModalStudioNumberSuccessPage = ref(false)
const studio_uuid = ref("");
const studio_number_detail = ref(null);
const editPageFlag = ref(false);


// operational rows
const operationalList = ref([]);
const uploadStatus = ref("");
const imageInput = ref(null);
const previewImage = ref(null);
const formUploadImageEdit = ref(null);

// ---------- HELPERS ----------

function triggerFilePicker() {
    imageInput.value?.click();
}

function downloadTemplate() {
    console.log(BE_BASE_URL)
    window.open(`${BE_BASE_URL}owner/file/operation-time/download`, "_blank");
}

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("module", "studio.photo");

    previewImage.value = URL.createObjectURL(file);

    formUploadImageEdit.value = formData;


    event.target.value = "";

}

async function handleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("excel_file", file);
    formData.append("module", "upload.excel");

    uploadStatus.value = "Uploading...";

    try {
        const res = await axios.post(`${BE_BASE_URL}owner/file/upload/excel`, formData);

        uploadStatus.value = "Upload berhasil!";

        let data = res.data.data.data;


        operationalList.value = [];

        operationalList.value = data.map(item => ({
            uid: uuidv4(),
            date: item.date,
            open: item.open,
            close: item.close,
            is_operational: true
        }));


    } catch (error) {
        console.log(error);
        uploadStatus.value = "Upload gagal!";
    }

    event.target.value = "";
}

function addOperational() {
    if (!canAddOperational.value) return
    operationalList.value.push({ uid: uuidv4(), date: '', open: '', close: '', delete_able: true })
}

function removeOperational(idx) {
    operationalList.value.splice(idx, 1)
}

// return how many rows use the same date
function usedDateCount(dateStr) {
    return operationalList.value.filter(r => r.date === dateStr).length
}

function filteredDates(currentIndex) {
    const usedDates = operationalList.value
        .map((d, i) => (i === currentIndex ? null : d.date))
        .filter(Boolean)
    // dates may be array of objects like { date_id, date }
    return dates.value.filter(d => !usedDates.includes(d.date))
}

function validTime(op) {
    if (!op.open || !op.close) return true
    // compare "HH:MM"
    const [oh, om] = op.open.split(':').map(Number)
    const [ch, cm] = op.close.split(':').map(Number)
    const openMinutes = oh * 60 + om
    const closeMinutes = ch * 60 + cm
    return openMinutes < closeMinutes
}

// ---------- COMPUTED ----------
const canAddOperational = computed(() => {
    if (operationalList.value.length === 0) return true
    const last = operationalList.value[operationalList.value.length - 1]
    return last && last.date && last.open && last.close && validTime(last)
})

// ---------- API ----------
async function fetchEquipment() {
    try {
        const res = await axios.get(`${BE_BASE_URL}owner/studio/equipment/list`)
        equipments.value = res.data?.data || []
        equipments.value.forEach(e => {
            if (!(e.equipment_id in selectedEquipments)) selectedEquipments[e.equipment_id] = 0
        })
    } catch (err) {
        console.error(err)
        alert('Gagal memuat equipment')
    }
}

async function fetchDate() {
    try {
        const res = await axios.get(`${BE_BASE_URL}user/time/date/list-three-months`)
        dates.value = res.data?.data || []
    } catch (err) {
        console.error(err)
        alert('Gagal memuat tanggal')
    }
}

async function fetchHours() {
    try {
        const res = await axios.get(`${BE_BASE_URL}user/time/hour/list`)
        hours.value = res.data?.data || []
    } catch (err) {
        console.error(err)
        alert('Gagal memuat jam')
    }
}

async function fetchDocuments() {
    try {

        const token = localStorage.getItem('token')
        const deviceId = localStorage.getItem('device_id')
        const ip = await getIpAdresses()

        const studio_uuid = router.currentRoute.value.params.studio_uuid
        const res = await axios({
            method: "POST",
            headers: {
                'authorization': `Bearer ${token}`,
                'x-device-id': deviceId,
                'x-ip-address': ip,
                'x-request-id': uuidv4()
            },
            url: `${BE_BASE_URL}owner/file/images`,
            data: {
                studio_uuid
            }
        })
        // console.log(res.data?.data)
        documents.value = res.data?.data || []
    } catch (err) {
        console.error(err)
        alert('Gagal memuat dokumen')
    }
}



// ---------- SUBMIT ----------
async function submit(editPageFlag) {
    // basic client-side checks
    for (const r of operationalList.value) {
        if (!r.date) return alert('Semua baris operasional harus memiliki tanggal.')
        if (!r.open || !r.close) return alert('Isi jam buka dan tutup semua baris.')
        if (!validTime(r)) return alert('Pastikan jam buka < jam tutup untuk setiap baris.')
    }

    loading.value = true
    try {
        // Map equipments

        const equipmentList = Object.entries(selectedEquipments)
            .filter(([_, qty]) => qty > 0)
            .map(([id, qty]) => ({ equipment_id: Number(id), quantity: qty }))

        // Map operational -> date_id
        const operationalTimes = operationalList.value.map(op => {
            const found = dates.value.find(d => d.date === op.date)
            return {
                date_id: found?.id || null,
                open_hour: op.open,
                close_hour: op.close,
                is_operational: op.is_operational
            }
        })

        const payload = {
            equipments: equipmentList,
            prices: [
                { day_type: 'weekday', price: prices.weekday },
                { day_type: 'weekend', price: prices.weekend }
            ],
            operational_times: operationalTimes,
            document_photo_id: selectedDocumentId.value,
            studio_uuid: router.currentRoute.value.params.studio_uuid
        }

        if (editPageFlag) {
            payload['studio_uuid'] = router.currentRoute.value.params.studio_uuid
            payload['studio_number_uuid'] = router.currentRoute.value.params.studio_number_uuid
            payload['weekday_price'] = prices.weekday
            payload['weekend_price'] = prices.weekend

            if (formUploadImageEdit) {
                const res = await axios.post(`${BE_BASE_URL}owner/file/upload`, formUploadImageEdit.value);
                payload['document_id'] = res.data.data.file_id
            }

            const resultEdit = await editStudioNumber(payload)

            if (resultEdit.data.status) {
                router.push(`/home/${router.currentRoute.value.params.studio_uuid}`)
            }

            return
        }

    } catch (err) {
        console.error(err)
        alert('Gagal menyimpan data studio!')
    } finally {
        loading.value = false
    }
}

async function editOrCreatePage() {
    const studio_number_uuid = router.currentRoute.value.params.studio_number_uuid
    const editPage = studio_number_uuid !== undefined
    editPageFlag.value = editPage
    return {
        editPage: editPage,
        studio_number_uuid: studio_number_uuid
    }
}

async function fetchStudioNumberDetail(studio_number_uuid, studio_uuid) {
    try {
        const response = await studioNumberDetail(studio_number_uuid, studio_uuid)
        if (response.data.status) {
            studio_number_detail.value = response.data.data
            if (studio_number_detail.value?.studio_equipment?.length) {

                studio_number_detail.value.studio_equipment.forEach(eq => {
                    selectedEquipments[eq.equipment_id] = eq.quantity
                });
            }
            const studioOperationalData = response.data.data.operational_data
            operationalList.value = studioOperationalData.map(item => ({
                uid: uuidv4(),
                date: item.date,
                open: item.open,
                close: item.close,
                is_operational: item.is_operational === 1 ? true : false,
                delete_able: item.delete_able
            }));

            prices.weekday = response.data.data.price_weekday
            prices.weekend = response.data.data.price_weekend
        }
    } catch (error) {
        console.error(error)
        alert('Gagal memuat data studio number. Silakan coba lagi.')
    }
}

// ---------- LIFECYCLE ----------
onMounted(async () => {
    const isEditPage = await editOrCreatePage()
    const studio_uuid = router.currentRoute.value.params.studio_uuid

    if (isEditPage.editPage) {
        await Promise.all([fetchEquipment(), fetchDate(), fetchDocuments(), fetchHours(), fetchStudioNumberDetail(isEditPage.studio_number_uuid, studio_uuid)])
    } else {
        await Promise.all([fetchEquipment(), fetchDate(), fetchDocuments(), fetchHours()])
    }
})
</script>

<style scoped>
/* kecil saja: kalau mau sembunyikan native picker icon di chrome, uncomment */
/* input[type="time"]::-webkit-calendar-picker-indicator { opacity: 0; } */
</style>
