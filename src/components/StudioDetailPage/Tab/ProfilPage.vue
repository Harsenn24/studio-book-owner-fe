<!-- Tab/ProfilPage.vue -->
<template>
    <div class="bg-gradient-to-r from-blue-600 to-green-500 py-5 mt-5">

        <!-- STUDIO INFO CARD -->
        <section class="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 max-w-4xl mx-auto backdrop-blur-sm">

            <!-- HEADER -->
            <div class="mb-6">
                <h2 class="text-2xl font-semibold text-blue-800!">{{ studio.studio_name }}</h2>
                <p class="text-sm text-black">ID: {{ studio.studio_id }}</p>
            </div>

            <!-- GRID INFO -->
            <div class="grid md:grid-cols-2 gap-6">

                <div>
                    <h3 class="text-sm font-semibold text-blue-600 mb-2!">Alamat Lengkap</h3>
                    <div class="space-y-1 text-slate-700">
                        <p>{{ studio.studio_address }}</p>
                        <p>{{ studio.studio_district }}, {{ studio.studio_city }}</p>
                        <p>{{ studio.studio_province }}, {{ studio.studio_postal_code }}</p>
                    </div>
                </div>

                <div>
                    <h3 class="text-sm font-semibold text-blue-600 mb-2">Contact Person</h3>
                    <div class="space-y-1 text-slate-700">
                        <p>{{ studio.studio_contact_person_name }}</p>
                        <p>{{ studio.studio_contact_person_phone }}</p>
                    </div>
                </div>

                <div>
                    <h3 class="text-sm font-semibold text-blue-600 mb-2">Rekening Pembayaran</h3>
                    <div class="space-y-1 text-slate-700">
                        <p>{{ studio.studio_bank_name }}</p>
                        <p>No: {{ studio.studio_bank_account_number }}</p>
                    </div>
                </div>

                <!-- STATUS -->
                <div>
                    <h3 class="text-sm font-semibold text-blue-600 mb-2">Status Studio</h3>

                    <template v-if="studio.status === 'active'">
                        <span class="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                            ACTIVE
                        </span>
                        <p class="text-[11px] text-gray-500 mt-1">
                            Aktif sampai: {{ studio.active_until }}
                        </p>
                    </template>

                    <template v-else>
                        <div class="flex items-center gap-3">
                            <span class="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                                INACTIVE
                            </span>

                            <button @click="$emit('open-payment')"
                                class="px-3 py-1 text-xs bg-blue-500! text-white rounded">
                                Aktifkan Studio
                            </button>
                        </div>
                    </template>
                </div>

            </div>
        </section>

        <!-- STUDIO NUMBER LIST -->
        <section class="bg-white rounded-2xl shadow-lg border border-b-black p-6 max-w-4xl mx-auto mt-5">

            <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-slate-800 mb-4">
                    🎧 Daftar Nomor Studio
                </h2>

                <div v-if="studioNumbers.length > 0 && studioNumbers.length < estimatedStudios">
                    <button class="mb-4 bg-green-600! text-white rounded-xl" @click="$emit('add-studio')">
                        + Tambah Nomor Studio
                    </button>
                </div>
            </div>

            <div v-if="studioNumbers.length > 0" class="grid md:grid-cols-2 gap-4">

                <div v-for="sn in studioNumbers" :key="sn.id" class="p-4 rounded-xl border border-black shadow bg-white">

                    <img :src="`${BE_BASE_URL}uploads/${sn.document_file}`"
                        class="w-full h-40 object-cover rounded-lg mb-3" />

                    <div class="flex justify-between items-center mb-3">
                        <p class="font-semibold text-lg">Studio #{{ sn.studio_number }}</p>

                        <button class="px-3 py-1 text-sm rounded-lg bg-blue-600! text-white!"
                            @click="$emit('edit-studio', sn)">
                            Edit
                        </button>
                    </div>

                    <div class="mb-3">
                        <p class="font-semibold text-sm mb-1 text-black">Equipment:</p>
                        <ul class="text-sm space-y-1 text-black">
                            <li v-for="eq in sn.studio_equipment" :key="eq.name">
                                • {{ eq.name }} ({{ eq.quantity }})
                            </li>
                        </ul>
                    </div>

                    <div class="flex justify-between text-sm text-black">
                        <p>Weekday: <b>{{ formatRupiah(sn.price_weekday) }}</b></p>
                        <p>Weekend: <b>{{ formatRupiah(sn.price_weekend) }}</b></p>
                    </div>

                </div>
            </div>

            <div v-else class="text-center py-10">
                <p>📭 Belum ada studio</p>

                <button class="mt-4 px-4 py-2 bg-green-600! text-white rounded-xl" @click="$emit('add-studio')">
                    + Tambah Nomor Studio
                </button>
            </div>

        </section>
    </div>
</template>

<script setup>

defineProps({
    studio: Object,
    studioNumbers: Array,
    estimatedStudios: Number,
    BE_BASE_URL: String,
    formatRupiah: Function
})

defineEmits([
    'open-payment',
    'add-studio',
    'edit-studio'
])


</script>