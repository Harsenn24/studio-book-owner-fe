<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-white via-gray-50 to-gray-100 p-6">

    <div v-if="isInitialLoading" class="flex-1 flex flex-col items-center justify-center">
      <div class="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-slate-500">Loading studios...</p>
    </div>

    <template v-else>
      <HeadersPage />

      <div class="flex-1">
        <div v-if="studioList.length > 0">
          <div
            class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3 bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl p-4">
            <div class="flex flex-col sm:flex-row items-center gap-4">
              <div class="bg-white shadow-md rounded-2xl px-5 py-3">
                <p class="text-sm text-slate-500">Total Studio</p>
                <p class="text-xl font-bold text-blue-600">{{ totalData }}</p>
              </div>

              <div class="bg-white shadow-md rounded-2xl px-5 py-3">
                <p class="text-sm text-slate-500">Transaksi Hari Ini</p>
                <p class="text-xl font-bold text-green-600">0</p>
              </div>

              <div v-if="checkSubmissionStatus === 'submission'" class="bg-gradient-to-tr from-yellow-500 to-orange-500 
                shadow-xl rounded-2xl px-5 py-3 
                text-white font-medium cursor-pointer transition 
                pulse-shadow animate-pulse transform hover:scale-[1.03] duration-300"
                @click="goToSubmissionStatusPage(subMissionId)">

                <div class="flex items-center justify-between">
                  <p class="text-sm font-semibold uppercase tracking-wider">🔔 Pengajuan Baru</p>
                </div>

              </div>
            </div>
            <div class="flex gap-2 w-full sm:w-1/3 mt-2 sm:mt-0">
              <input v-model="searchQuery" @keyup.enter="fetchStudios(1)" placeholder="Cari nama studio..." type="text"
                class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-black" />
              <button @click="fetchStudios(1)"
                class="px-3 py-2 bg-white! text-black rounded-lg hover:bg-slate-100 transition">Cari</button>
            </div>
          </div>

          <div class="bg-gradient-to-r from-blue-600 to-green-500 py-6 px-6 rounded-2xl">
            <div class="grid justify-center grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <div v-for="studio in studioList" :key="studio.studio_id" @click="openStudioDetail(studio)"
                class="bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">

                <div class="p-5">
                  <div class="flex justify-between items-start">
                    <h3 class="text-lg font-semibold text-slate-800 break-words max-w-[80%]">{{ studio.studio_name }}
                    </h3>
                    <span :class="[
                      'px-3 py-1 text-xs font-semibold rounded-full shadow-md whitespace-nowrap',
                      studio.studio_status === 'active'
                        ? 'bg-green-100 text-green-700 shadow-green-300'
                        : 'bg-red-100 text-red-700 shadow-red-300'
                    ]">
                      {{ studio.studio_status === 'active' ? 'ACTIVE' : 'INACTIVE' }}
                    </span>
                  </div>
                  <p class="text-sm text-slate-500 mt-1">ID: {{ studio.studio_id }}</p>
                </div>


                <div class="px-5 pb-5 border-t border-slate-100">
                  <p class="text-sm text-slate-600 mb-1">📍 {{ studio.studio_city }}, {{ studio.studio_district }}</p>
                  <p class="text-xs text-slate-400">Dibuat: {{ formatDate(studio.studio_created_at * 1000) }}</p>
                </div>

                <div class="px-5 pb-5 border-t border-slate-100">
                  <p class="text-xl font-bold text-black">Rp 20.000</p>
                </div>

                <div class="px-5 py-3 bg-slate-50 flex justify-end items-center border-t border-slate-100">
                  <a :href="studio.studio_gmaps" target="_blank" @click.stop
                    class="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center gap-1 transition">
                    🌐 Lihat di Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="isSubmitted && studioList.length === 0">
          <SubmissionStatusPage :checkSubmissionStatus="checkSubmissionStatus"
            :checkSubmissionStudioName="checkSubmissionStudioName" :checkSubmissionCreatedAt="checkSubmissionCreatedAt"
            @refresh-page="refreshPage" />
        </div>

        <div v-else
          class="flex flex-col lg:flex-row items-center justify-center gap-10 py-20 bg-white rounded-2xl shadow-lg mt-8 mx-4">
          <section class="flex flex-col justify-center px-8 max-w-lg text-center lg:text-left">
            <h2 class="text-4xl lg:text-5xl font-extrabold text-slate-800 leading-tight">
              Kamu belum punya
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">studio</span>
            </h2>
            <p class="mt-4 text-slate-500 text-base">
              Buat listing studiomu agar pengguna bisa menemukan dan menyewa ruangmu.
            </p>
            <div class="mt-8 flex justify-center lg:justify-start items-center gap-5">
              <button @click="openAddStudioPage()"
                class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform">
                + Buat Studiomu
              </button>
            </div>
          </section>
        </div>
      </div>

      <div v-if="studioList.length > 0"
        class="mt-6 py-4 px-6 bg-white! shadow-inner flex justify-center items-center gap-2 sticky bottom-0 z-10 rounded-t-2xl border-t border-slate-200">
        <button @click="changePage(page - 1)" :disabled="page === 1"
          class="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 transition">
          Prev
        </button>
        <button v-for="p in maxPage" :key="p" @click="changePage(p)"
          :class="['px-3 py-1 rounded-lg border text-sm transition', page === p ? 'bg-blue-600! text-white border-blue-600 font-semibold' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700']">
          {{ p }}
        </button>
        <button @click="changePage(page + 1)" :disabled="page === maxPage"
          class="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 transition">
          Next
        </button>
      </div>

    </template>
    <ModalAddStudioPage v-if="addStudioPage === true" @closeModal="addStudioPage = false"/>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HeadersPage from '../HeadersPage/HeadersPage.vue'
import { listStudio, submission } from '../../api/studio.js'
import SubmissionStatusPage from '../SubmissionStatusPage/SubmissionStatusPage.vue'
import ModalAddStudioPage from '../ModalAddStudioPage/ModalAddStudioPage.vue'


// --- REFS ---
const isInitialLoading = ref(true)
const router = useRouter()
const addStudioPage = ref(false)

// Studio List & Pagination
const studioList = ref([])
const page = ref(1)
const maxPage = ref(1)
const totalData = ref(0)
const searchQuery = ref('')

// Submission Check
const checkSubmissionStatus = ref('') // 'submission', 'accepted', 'rejected'
const checkSubmissionStudioName = ref('')
const checkSubmissionNotes = ref('')
const checkSubmissionCreatedAt = ref(0)
const isSubmitted = ref(false) // True if submission data is found
const subMissionId = ref(null)


// --- UTILITY FUNCTIONS ---
function refreshPage() {
  window.location.reload()
}

function openAddStudioPage() {
  addStudioPage.value = true
}

function formatDate(timestamp) {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// --- NAVIGATION & MODAL FUNCTIONS ---

function openStudioDetail(studio) {
  router.push(`/home/${studio.studio_id}`)
}

function logout() {
  localStorage.clear()
  window.location.href = '/login'
}


function goToSubmissionStatusPage(submission_uuid) {
  router.push('/home/submission-status/' + submission_uuid)
}


// --- API CALLS ---
async function fetchStudios(p = page.value) {
  page.value = p
  try {
    const response = await listStudio(page.value, searchQuery.value)

    if (response.data.status) {
      studioList.value = response.data.data.data || []
      maxPage.value = response.data.data.maxPage
      totalData.value = response.data.data.totalData
    }
  } catch (err) {
    console.error('Error fetching studios:', err)
  }
}

function changePage(p) {
  if (p < 1 || p > maxPage.value) return
  fetchStudios(p)
}

async function checkSubmission() {
  try {
    const response = await submission()

    if (response.data.status) {
      checkSubmissionStatus.value = response.data.data.status
      checkSubmissionStudioName.value = response.data.data.studio_name
      checkSubmissionCreatedAt.value = response.data.data.created_at
      checkSubmissionNotes.value = response.data.data.submission_notes
      subMissionId.value = response.data.data.submission_uuid
      isSubmitted.value = true
    } else {
      isSubmitted.value = false // Explicitly set to false if API returns false status (e.g., no pending submission)
    }

  } catch (err) {
    console.error('Error checking submission:', err)
    isSubmitted.value = false
  }
}


// --- LIFECYCLE HOOKS ---
onMounted(async () => {

  try {
    // Run both calls concurrently for faster loading
    await Promise.all([fetchStudios(), checkSubmission()])
  } finally {
    // Ensure loading is finished regardless of success/failure
    isInitialLoading.value = false
  }
})

</script>


<style scoped>
/* Modal Transition Styles */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.995);
}

/* Custom Spin Animation for Submission Loading */
@keyframes spin-slow {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

/* Note: The 'glow-green' and 'glow-red' classes were present in the original template but
   did not have corresponding CSS styles defined here. They have been removed from the
   template for cleanup, or should be added if they are intended to be used. */
</style>