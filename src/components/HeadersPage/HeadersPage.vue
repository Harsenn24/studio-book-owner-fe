<template>
    <header class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold cursor-pointer transition 
         bg-gradient-to-r from-green-600 to-blue-500 
         bg-clip-text text-transparent
         hover:from-blue-500 hover:to-green-600" @click="goToHome">
            StudioSpace Owner
        </h1>
        <div class="flex justify-between gap-x-4">

            <div
                v-if="studioList.length > 0 && (checkSubmissionStatus === 'rejected' || checkSubmissionStatus === 'accepted')">
                <button @click="openModal()"
                    class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-green-500 text-white font-medium shadow hover:opacity-90 transition-all">
                    + Tambah Studio
                </button>
            </div>

            <button @click="logout()"
                class="px-5 py-2.5 rounded-xl bg-red-500! text-white! font-medium shadow hover:opacity-90 transition-all">
                LogOut
            </button>

        </div>
        <transition name="modal-fade">
            <ModalAddStudioPage v-if="showModal" @close-modal="closeModal" />
        </transition>
    </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { listStudio, submission } from '../../api/studio'
import { ref, onMounted } from 'vue'
import ModalAddStudioPage from '../ModalAddStudioPage/ModalAddStudioPage.vue';

const router = useRouter()

const checkSubmissionStatus = ref('');
const studioList = ref([])

const showModal = ref(false)


function openModal() {
    showModal.value = true
}
function closeModal() {
    showModal.value = false
}
function goToHome() {
    router.push('/home')
}

function logout() {
    localStorage.clear()
    window.location.href = '/login'
}


async function fetchStudio() {
    try {
        const response = await listStudio(1, '')
        studioList.value = response.data.data.data
    } catch (error) {
        console.error(error)
        alert('Gagal memuat data studio. Silakan coba lagi.')
    }
}

async function fetchSubmission() {
    try {
        const response = await submission()
        if (response.data.status) {
            checkSubmissionStatus.value = response.data.data.status
        }
    } catch (error) {
        console.error(error)
        alert('Gagal memuat status pengajuan. Silakan coba lagi.')
    }
}

onMounted(() => {
    fetchStudio()
    fetchSubmission()
})
</script>