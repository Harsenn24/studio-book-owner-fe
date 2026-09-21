<template>
    <div class="min-h-screen fixed inset-0 z-50 flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal"></div>
        <div class="max-h-screen overflow-y-auto relative bg-white rounded-2xl w-full max-w-2xl p-6 z-50 drop-shadow-2xl border border-white/30 scrollbar-hide">
            <header class="flex items-start justify-between gap-4 mb-4">
                <h3 class="text-lg font-semibold text-black">Form Pengajuan Studio</h3>
                <button @click="closeModal" class="text-slate-400 bg-white! hover:text-slate-600">✖️</button>
            </header>

            <form @submit.prevent="submitForm">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="text-xs font-medium text-slate-600">Nama Studio</label>
                        <input v-model="form.name" @input="handleNameInput" required minlength="5" maxlength="20"
                            class="mt-2 w-full rounded-lg border px-3 py-2 text-sm border-black text-black"
                            placeholder="Contoh: Studio Suara Jakarta" />
                        <p v-if="form.name.length > 0 && (form.name.length < 5 || form.name.length > 20)"
                            class="text-xs text-red-500 mt-1">
                            Nama studio harus antara 5–20 karakter.
                        </p>
                    </div>

                    <div class="relative" ref="provinceContainer">
                        <label class="text-xs font-medium text-slate-600">Provinsi</label>
                        <input type="text" v-model="provinceSearch" @input="fetchProvinces" @focus="fetchProvinces"
                            required class="mt-2 w-full rounded-lg border px-3 py-2 text-sm border-black text-black"
                            placeholder="Cari provinsi..." />
                        <ul v-if="provinceList.length"
                            class="absolute w-full max-h-48 overflow-auto border rounded mt-1 bg-white z-50 text-black py-2 shadow-lg">
                            <li v-for="province in provinceList" :key="province.id" @click="selectProvince(province)"
                                class="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                {{ province.name }}
                            </li>
                        </ul>
                    </div>
                    <div class="relative" ref="cityContainer">
                        <label class="text-xs font-medium text-slate-600">Kota</label>
                        <input type="text" v-model="citySearch" @input="fetchCities()" @focus="fetchCities()"
                            :disabled="!form.province" required
                            class="mt-2 w-full rounded-lg border px-3 py-2 text-sm border-black text-black disabled:bg-gray-50 disabled:cursor-not-allowed"
                            placeholder="Cari kota..." />
                        <ul v-if="cityList.length"
                            class="absolute w-full max-h-48 overflow-auto border rounded mt-1 bg-white z-50 text-black py-2 shadow-lg">
                            <li v-for="city in cityList" :key="city.id" @click="selectCities(city)"
                                class="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                {{ city.name }}
                            </li>
                        </ul>
                    </div>
                    <div class="relative" ref="districtContainer">
                        <label class="text-xs font-medium text-slate-600">Kecamatan</label>
                        <input type="text" v-model="districtSearch" @input="fetchDistricts()" @focus="fetchDistricts()"
                            :disabled="!form.city" required
                            class="mt-2 w-full rounded-lg border px-3 py-2 text-sm border-black text-black disabled:bg-gray-50 disabled:cursor-not-allowed"
                            placeholder="Cari kecamatan..." />
                        <ul v-if="districtList.length"
                            class="absolute w-full max-h-48 overflow-auto border rounded mt-1 bg-white z-50 text-black py-2 shadow-lg">
                            <li v-for="district in districtList" :key="district.id" @click="selectDistrict(district)"
                                class="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                {{ district.name }}
                            </li>
                        </ul>
                    </div>
                    <div class="relative" ref="villageContainer">
                        <label class="text-xs font-medium text-slate-600">Kelurahan</label>
                        <input type="text" v-model="villageSearch" @input="fetchVillages()" @focus="fetchVillages()"
                            :disabled="!form.district" required
                            class="mt-2 w-full rounded-lg border px-3 py-2 text-sm border-black text-black disabled:bg-gray-50 disabled:cursor-not-allowed"
                            placeholder="Cari kelurahan..." />
                        <ul v-if="villageList.length"
                            class="absolute w-full max-h-48 overflow-auto border rounded mt-1 bg-white z-50 text-black py-2 shadow-lg">
                            <li v-for="village in villageList" :key="village.id" @click="selectVillage(village)"
                                class="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                {{ village.name }}
                            </li>
                        </ul>
                    </div>
                    <div class="relative" ref="postalCodeContainer">
                        <label class="text-xs font-medium text-slate-600">Kode Pos</label>
                        <input type="text" v-model="postalCodeSearch" @input="fetchPostalCode()"
                            @focus="fetchPostalCode()" :disabled="!form.village" required
                            class="mt-2 w-full rounded-lg border px-3 py-2 text-sm border-black text-black disabled:bg-gray-50 disabled:cursor-not-allowed"
                            placeholder="Cari kode pos..." />
                        <ul v-if="postalCodeList.length"
                            class="absolute w-full max-h-48 overflow-auto border rounded mt-1 bg-white z-50 text-black py-2 shadow-lg">
                            <li v-for="postal_code in postalCodeList" :key="postal_code.id"
                                @click="selectPostalCode(postal_code)"
                                class="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                {{ postal_code.postal_code }}
                            </li>
                        </ul>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-slate-600">Tautan Google Maps</label>
                        <input v-model="form.gmaps" @input="handleGmapsInput" required
                            class="mt-2 w-full rounded-lg border px-3 py-2 text-sm border-black text-black"
                            placeholder="https://maps.app.goo.gl/..." />
                        <p v-if="form.gmaps && form.gmaps.length < 5" class="text-xs text-red-500 mt-1">
                            Tautan minimal 5 karakter.
                        </p>
                        <p v-else-if="form.gmaps && !isValidUrl(form.gmaps)" class="text-xs text-red-500 mt-1">
                            Harus berupa tautan (URL) yang valid.
                        </p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-slate-600">Estimasi Jumlah Studio</label>

                        <input type="text" inputmode="numeric" v-model="form.estimatedStudioNumber" required @input="
                            form.estimatedStudioNumber = form.estimatedStudioNumber.replace(/[^0-9]/g, '');
                        if (form.estimatedStudioNumber !== '' && Number(form.estimatedStudioNumber) < 1) {
                            form.estimatedStudioNumber = '1';
                        }
                        " class="mt-2 w-full rounded-lg border px-3 py-2 text-sm border-black text-black"
                            placeholder="1" />

                        <p v-if="form.estimatedStudioNumber !== '' && Number(form.estimatedStudioNumber) < 1"
                            class="text-xs text-red-500 mt-1">
                            Estimasi jumlah studio minimal 1.
                        </p>
                    </div>
                </div>

                <div class="mt-4">
                    <label class="text-xs font-medium text-slate-600">Alamat Lengkap</label>
                    <textarea v-model="form.address" @input="handleAddressInput" required rows="3"
                        class="mt-2 w-full rounded-lg border px-3 py-2 text-sm border-black text-black resize-none overflow-hidden"
                        placeholder="Contoh: Jalan Sukmajaya 1 No. 23, Depok"></textarea>

                    <p v-if="form.address && form.address.length < 10" class="text-xs text-red-500 mt-1">
                        Alamat minimal 10 karakter.
                    </p>
                </div>


                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label class="text-xs font-medium text-slate-600">Contact Person Name</label>
                        <input v-model="form.contactName" @input="handleContactNameInput" required minlength="5"
                            maxlength="20"
                            class="mt-2 w-full rounded-lg border px-3 py-2 text-sm border-black text-black"
                            placeholder="Contoh: Dhimas" />
                        <p v-if="form.contactName.length > 0 && (form.contactName.length < 5 || form.contactName.length > 20)"
                            class="text-xs text-red-500 mt-1">
                            Nama contact person harus antara 5–20 karakter.
                        </p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-slate-600">Contact Person Phone</label>
                        <input v-model="form.contactPhone" @input="handlePhoneInput" required maxlength="15"
                            class="mt-2 w-full rounded-lg border px-3 py-2 text-sm border-black text-black"
                            placeholder="Contoh: 08135115415" />

                        <p v-if="phoneError" class="text-xs text-red-500 mt-1">
                            {{ phoneError }}
                        </p>
                    </div>

                    <div class="relative" ref="bankContainer">
                        <label class="text-xs font-medium text-slate-600">Bank</label>
                        <input type="text" v-model="bankSearch" @input="fetchBank" @focus="fetchBank" required
                            class="mt-2 w-full rounded-lg border px-3 py-2 text-sm border-black text-black"
                            placeholder="nama bank..." />
                        <ul v-if="bankList.length"
                            class="absolute w-full max-h-48 overflow-auto border rounded mt-1 bg-white z-50 text-black py-2 shadow-lg">
                            <li v-for="bank in bankList" :key="bank.id" @click="selectBank(bank)"
                                class="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                {{ bank.name }}
                            </li>
                        </ul>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-slate-600">Nomor Rekening Bank</label>
                        <input v-model="form.bankAccount" @input="handleBankAccountInput" required minlength="5"
                            maxlength="20"
                            class="mt-2 w-full rounded-lg border px-3 py-2 text-sm border-black text-black"
                            placeholder="Contoh: 5544512536" />
                        <p v-if="form.bankAccount && form.bankAccount.length < 5" class="text-xs text-red-500 mt-1">
                            Nomor Rekening minimal 5 karakter.
                        </p>
                    </div>

                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div>
                        <label class="text-sm font-medium text-slate-700">Upload KTP</label>

                        <input v-if="!previewFile.ktp" type="file" accept="image/*" required
                            @change="handleFileUpload($event, 'ktp')"
                            class="mt-2 w-full rounded-lg border px-3 py-3 text-sm border-black text-black cursor-pointer" />

                        <div v-else class="mt-3 relative rounded-lg overflow-hidden border border-gray-300 shadow-md">
                            <img :src="previewFile.ktp" alt="Preview KTP" class="w-full aspect-[16/9] object-cover" />
                            <button type="button" @click="removeFile('ktp')"
                                class="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 text-xs font-medium px-2 py-1 rounded shadow">
                                Ganti Foto
                            </button>
                        </div>

                        <p v-if="errorsFile.ktp" class="text-xs text-red-500 mt-1">{{ errorsFile.ktp }}</p>
                    </div>

                    <div v-for="n in Number(form.estimatedStudioNumber)" :key="n">
                        <label class="text-sm font-medium text-slate-700">
                            Upload Foto Studio {{ n }}
                        </label>

                        <!-- Input file -->
                        <input v-if="!previewFile[`studio${n}`]" type="file" accept="image/*" required
                            @change="handleFileUpload($event, `studio${n}`)"
                            class="mt-2 w-full rounded-lg border px-3 py-3 text-sm border-black text-black cursor-pointer" />

                        <!-- Preview file -->
                        <div v-else class="mt-3 relative rounded-lg overflow-hidden border border-gray-300 shadow-md">
                            <img :src="previewFile[`studio${n}`]" :alt="`Preview Studio ${n}`"
                                class="w-full aspect-[16/9] object-cover" />
                            <button type="button" @click="removeFile(`studio${n}`)"
                                class="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 text-xs font-medium px-2 py-1 rounded shadow">
                                Ganti Foto
                            </button>
                        </div>

                        <!-- Error message -->
                        <p v-if="errorsFile[`studio${n}`]" class="text-xs text-red-500 mt-1">
                            {{ errorsFile[`studio${n}`] }}
                        </p>
                    </div>
                </div>


                <div class="md:col-span-2 flex justify-end gap-3 mt-8">
                    <button type="button" @click="closeModal"
                        class="px-4 py-2 rounded-lg border bg-white! text-black border-slate-200 hover:bg-slate-50">Batal</button>
                    <button type="submit"
                        class="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 transition-opacity">Kirim
                        Pengajuan</button>
                </div>
            </form>

        </div>
        <ModalSubmissionSuccessPage v-if="ModalSubmissionSuccessPageVisible" />
    </div>
</template>

<script setup>
import { ref } from "vue";
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getIpAdresses } from '../../services/axios/ip-adress.services.js'
import ModalSubmissionSuccessPage from "../ModalSubmissionSuccessPage/ModalSubmissionSuccessPage.vue";


const ipAddress = async () => {
    return await getIpAdresses();
};

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};


// Autocomplete State
const provinceSearch = ref('');
const provinceList = ref([]);
const provinceContainer = ref(null);

const citySearch = ref('');
const cityList = ref([]);
const cityContainer = ref(null);

const districtSearch = ref('');
const districtList = ref([]);
const districtContainer = ref(null);

const villageSearch = ref('');
const villageList = ref([]);
const villageContainer = ref(null);

const postalCodeSearch = ref('');
const postalCodeList = ref([]);
const postalCodeContainer = ref(null);

const bankSearch = ref('');
const bankList = ref([]);
const bankContainer = ref(null);

const ModalSubmissionSuccessPageVisible = ref(false);

// Error State
const errorsFile = ref({ ktp: '', studio1: '', studio2: '' });
const phoneError = ref('');

const props = defineProps({
    showModal: Boolean,
});

const emit = defineEmits(["close-modal"]);

function closeModal() {
    emit("close-modal");
}

function handleGmapsInput() {
    form.value.gmaps = form.value.gmaps.trim()
}

// ------------------------
// STATE FORM
// ------------------------
const form = ref({
    name: '',
    address: '', // Tambahkan kembali address
    province: null, // Ubah ke null untuk ID
    city: null, // Ubah ke null untuk ID
    district: null, // Ubah ke null untuk ID
    village: null, // Tambahkan village ID
    postalCode: null, // Ubah ke null untuk ID
    gmaps: '',
    bank: null, // Ubah ke null untuk ID
    bankAccount: '',
    contactName: '',
    contactPhone: '',
    document_ids: [],
    estimatedStudioNumber: null
});


// ------------------------
// HANDLERS
// ------------------------
function handleNameInput(e) {
    let value = e.target.value

    value = value
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase())

    form.value.name = value
}
function handleContactNameInput(e) { // Fungsi yang hilang
    let value = e.target.value

    value = value
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase())

    form.value.contactName = value
}
function handleAddressInput(e) {
    const textarea = e.target

    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
}
function handlePhoneInput() {
    const value = form.value.contactPhone

    form.value.contactPhone = value.replace(/\D/g, '') // Hanya angka

    if (!form.value.contactPhone.startsWith('08')) {
        phoneError.value = 'Nomor harus diawali dengan 08.'
    } else if (form.value.contactPhone.length < 10) {
        phoneError.value = 'Nomor minimal 10 digit.'
    } else if (form.value.contactPhone.length > 15) {
        phoneError.value = 'Nomor maksimal 15 digit.'
    } else {
        phoneError.value = ''
    }
}
function handleBankAccountInput() {
    form.value.bankAccount = form.value.bankAccount.replace(/\D/g, '') // Hanya angka
}

// ------------------------
// FILE UPLOAD & MANAGEMENT
// ------------------------
const previewFile = ref({
    ktp: null,
    studio1: null,
    studio2: null,
});
async function handleFileUpload(event, type) {
    const file = event.target.files[0]
    if (!file) return

    errorsFile.value[type] = ''

    if (file.size > 500 * 1024) {
        errorsFile.value[type] = 'Ukuran file maksimal 500 KB.'
        return
    }

    // Preview langsung
    const fileUrl = URL.createObjectURL(file)
    previewFile.value[type] = fileUrl

    // Tentukan module name
    const moduleName = type === 'ktp' ? 'studio.ktp' : 'studio.photo'

    try {
        // Hapus file_id lama jika ada, untuk diganti dengan yang baru
        // Logika ini butuh perubahan untuk menargetkan file_id spesifik.
        // Untuk saat ini, kita akan push saja dan biarkan BE yang handle.

        const BE_BASE_URL = import.meta.env.VITE_STUDIO_BAND_BE_BASE_URL
        const token = localStorage.getItem('token')
        const deviceId = localStorage.getItem('device_id')
        const ip = await ipAddress() // Menggunakan fungsi dummy/impor

        const formData = new FormData()
        formData.append('image', file)
        formData.append('module', moduleName)

        const response = await axios.post(`${BE_BASE_URL}owner/file/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'authorization': `Bearer ${token}`,
                'x-device-id': deviceId,
                'x-ip-address': ip,
                'x-request-id': uuidv4() // Menggunakan fungsi impor
            }
        })

        if (!response.data.status) {
            errorsFile.value[type] = 'Upload gagal. Silakan coba lagi.'
        } else {
            // Tambahkan file_id ke array, perlu diperhatikan jika ada file_id lama untuk tipe yang sama
            form.value.document_ids.push(response.data.data.file_id)
        }
    } catch (err) {
        console.error(err)
        errorsFile.value[type] = 'Terjadi kesalahan saat upload.'
    }
}
function removeFile(type) {
    // CATATAN: Hapus juga file_id terkait dari form.value.document_ids jika Anda ingin BE menghapus dokumennya.
    // Karena Anda tidak menyimpan map (type -> file_id), ini akan rumit.
    // Asumsi: Saat ini, kita hanya menghapus preview dan membiarkan file_id yang sudah diupload di BE.
    previewFile.value[type] = null
    errorsFile.value[type] = ''
}


// ------------------------
// ADDRESS FETCHING
// ------------------------
async function fetchProvinces() {
    try {
        const BE_BASE_URL = import.meta.env.VITE_STUDIO_BAND_BE_BASE_URL
        const response = await axios.post(`${BE_BASE_URL}owner/address/province-pagination`, {
            page: 1,
            limit: 10000,
            search: provinceSearch.value
        })

        if (response.data.status) {
            provinceList.value = response.data.data.data
        }
    } catch (error) {
        console.error(error)
        // alert('Gagal memuat data provinsi. Silakan coba lagi.') // Hindari alert di fungsi utilitas
    }
}

function selectProvince(province) {
    form.value.province = province.id
    provinceSearch.value = province.name
    form.value.city = null; citySearch.value = ''; cityList.value = [];
    form.value.district = null; districtSearch.value = ''; districtList.value = [];
    form.value.village = null; villageSearch.value = ''; villageList.value = [];
    form.value.postalCode = null; postalCodeSearch.value = ''; postalCodeList.value = [];

    fetchCities(province.id)
    provinceList.value = []
}

async function fetchCities(province_id = form.value.province) {
    try {
        if (!province_id) return
        const BE_BASE_URL = import.meta.env.VITE_STUDIO_BAND_BE_BASE_URL
        const response = await axios.post(`${BE_BASE_URL}owner/address/city-pagination`, {
            page: 1,
            limit: 10000,
            search: citySearch.value,
            province_id
        })

        if (response.data.status) {
            cityList.value = response.data.data.data
        }
    } catch (error) {
        console.error(error)
    }
}

function selectCities(city) {
    form.value.city = city.id
    citySearch.value = city.name
    form.value.district = null; districtSearch.value = ''; districtList.value = [];
    form.value.village = null; villageSearch.value = ''; villageList.value = [];
    form.value.postalCode = null; postalCodeSearch.value = ''; postalCodeList.value = [];

    fetchDistricts(city.id)
    cityList.value = []
}

async function fetchDistricts(city_id = form.value.city) {
    try {
        if (!city_id) return
        const BE_BASE_URL = import.meta.env.VITE_STUDIO_BAND_BE_BASE_URL
        const response = await axios.post(`${BE_BASE_URL}owner/address/district-pagination`, {
            page: 1,
            limit: 10000,
            search: districtSearch.value,
            city_id
        })

        if (response.data.status) {
            districtList.value = response.data.data.data
        }
    } catch (error) {
        console.error(error)
    }
}

function selectDistrict(district) {
    form.value.district = district.id
    districtSearch.value = district.name
    form.value.village = null; villageSearch.value = ''; villageList.value = [];
    form.value.postalCode = null; postalCodeSearch.value = ''; postalCodeList.value = [];

    fetchVillages(district.id)
    districtList.value = []
}

async function fetchVillages(district_id = form.value.district) {
    try {
        if (!district_id) return
        const BE_BASE_URL = import.meta.env.VITE_STUDIO_BAND_BE_BASE_URL
        const response = await axios.post(`${BE_BASE_URL}owner/address/village-pagination`, {
            page: 1,
            limit: 10000,
            search: villageSearch.value,
            district_id
        })

        if (response.data.status) {
            villageList.value = response.data.data.data
        }
    } catch (error) {
        console.error(error)
    }
}

function selectVillage(village) {
    form.value.village = village.id
    villageSearch.value = village.name
    form.value.postalCode = null; postalCodeSearch.value = ''; postalCodeList.value = [];

    // Cukup panggil fetchPostalCode di sini karena kelurahan sudah terpilih
    fetchPostalCode(form.value.province, form.value.city, form.value.district, village.id)
    villageList.value = []
}

async function fetchPostalCode(province_id = form.value.province, city_id = form.value.city, district_id = form.value.district, village_id = form.value.village) {
    try {
        // Kode pos harusnya sudah bisa dicari jika kelurahan/village sudah ada ID-nya
        if (!village_id) return

        const BE_BASE_URL = import.meta.env.VITE_STUDIO_BAND_BE_BASE_URL
        const response = await axios.post(`${BE_BASE_URL}owner/address/postal-code-pagination`, {
            page: 1,
            limit: 10000,
            search: postalCodeSearch.value,
            province_id,
            city_id,
            district_id,
            village_id
        })

        if (response.data.status) {
            postalCodeList.value = response.data.data.data
        }
    } catch (error) {
        console.error(error)
    }
}

function selectPostalCode(postalCode) {
    form.value.postalCode = postalCode.id
    postalCodeSearch.value = postalCode.postal_code
    postalCodeList.value = []
}

// ------------------------
// BANK FETCHING
// ------------------------
async function fetchBank() { // Fungsi yang hilang
    try {
        const BE_BASE_URL = import.meta.env.VITE_STUDIO_BAND_BE_BASE_URL
        const response = await axios.post(`${BE_BASE_URL}owner/funding/bank-list`, { // Asumsi endpoint
            search: bankSearch.value
        })

        if (response.data.status) {
            bankList.value = response.data.data.data
        }
    } catch (error) {
        console.error(error)
    }
}

function selectBank(bank) { // Fungsi yang hilang
    form.value.bank = bank.prima_code
    bankSearch.value = bank.name
    bankList.value = []
}


// ------------------------
// SUBMIT LANGSUNG DI MODAL
// ------------------------
async function submitForm() {
    // 1. Validasi Minimum Form
    if (!form.value.name || form.value.name.length < 5 || form.value.name.length > 20) {
        return alert("Nama studio harus antara 5–20 karakter");
    }
    if (phoneError.value) {
        return alert("Mohon perbaiki format nomor telepon.");
    }
    if (!form.value.province || !form.value.city || !form.value.district || !form.value.village || !form.value.postalCode) {
        return alert("Mohon lengkapi alamat secara berurutan (Provinsi hingga Kode Pos).");
    }
    if (!form.value.bank || !form.value.bankAccount) {
        return alert("Mohon lengkapi detail bank.");
    }
    if (form.value.document_ids.length < 3) {
        return alert("Mohon unggah KTP dan kedua foto studio.");
    }

    try {
        const BE_BASE_URL = import.meta.env.VITE_STUDIO_BAND_BE_BASE_URL
        const token = localStorage.getItem('token')
        const deviceId = localStorage.getItem('device_id')
        const ip = await ipAddress() // Menggunakan fungsi dummy/impor

        const payload = {
            name: form.value.name,
            address_data: {
                province_id: form.value.province,
                city_id: form.value.city,
                district_id: form.value.district,
                village_id: form.value.village,
                postal_code_id: form.value.postalCode,
                address: form.value.address,
                gmaps: form.value.gmaps,
            },
            contact_person_data: {
                name: form.value.contactName,
                phone: form.value.contactPhone
            },
            account_number_data: {
                bank_code: form.value.bank,
                bank_account_number: form.value.bankAccount
            },
            document_ids: form.value.document_ids, // Semua file_id yang sudah diupload
            estimated_studio_number: form.value.estimatedStudioNumber
        };

        const response = await axios.post(`${BE_BASE_URL}owner/studio/submission`, payload, { // Asumsi endpoint submit
            headers: {
                'authorization': `Bearer ${token}`,
                'x-device-id': deviceId,
                'x-ip-address': ip,
                'x-request-id': uuidv4()
            }
        });

        if (!response.data.status) {
            return alert("Gagal mengirim pengajuan: " + (response.data.message || "Terjadi kesalahan."));
        }


        ModalSubmissionSuccessPageVisible.value = true;

    } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan server saat mengirim pengajuan.");
    }
}
</script>