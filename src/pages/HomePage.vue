<template>
  <AppLayout>
    <div v-if="initialLoading" class="space-y-6">
      <div class="card h-28 animate-pulse" />
      <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <div v-for="n in 3" :key="n" class="card h-44 animate-pulse" />
      </div>
    </div>

    <!-- Has studios -->
    <template v-else-if="hasStudios">
      <PageHeader eyebrow="Dashboard" title="Studio kamu" :subtitle="`${totalData} studio terdaftar`">
        <form class="flex w-full gap-2 sm:w-80" @submit.prevent="load(1)">
          <div class="relative flex-1">
            <span class="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-400">🔍</span>
            <input v-model="search" type="search" placeholder="Cari nama studio…"
              class="w-full rounded-xl border border-ink-600 bg-ink-900/80 py-2.5 pl-10 pr-3 text-sm placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15" />
          </div>
          <BaseButton type="submit" variant="secondary" size="sm">Cari</BaseButton>
        </form>
      </PageHeader>

      <router-link v-if="submission?.status === 'submission'" :to="`/home/submission-status/${submission.submission_uuid}`"
        class="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 transition hover:bg-amber-500/15">
        <div class="flex items-center gap-3">
          <span class="relative flex h-3 w-3"><span class="absolute h-full w-full animate-ping rounded-full bg-amber-brand opacity-75" /><span class="h-3 w-3 rounded-full bg-amber-brand" /></span>
          <div>
            <p class="font-semibold text-amber-200">Pengajuan baru sedang diproses</p>
            <p class="text-sm text-ink-300">{{ submission.studio_name }}</p>
          </div>
        </div>
        <span class="text-sm font-semibold text-amber-200">Lihat status →</span>
      </router-link>

      <EmptyState v-if="!studios.length" icon="🔍" title="Studio tidak ditemukan" :description="`Tidak ada studio yang cocok dengan “${search}”.`" />
      <div v-else class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StudioCard v-for="studio in studios" :key="studio.studio_id" :studio="studio" class="animate-fade-up" />
      </div>

      <BasePagination class="mt-8" :page="page" :max-page="maxPage" @update:page="load" />
    </template>

    <!-- Submitted, no studio yet -->
    <SubmissionStatusCard v-else-if="submission" :submission="submission" :refreshing="refreshing"
      @refresh="refreshSubmission" @resubmit="showSubmission = true" />

    <!-- First visit -->
    <section v-else class="card grid items-center gap-8 overflow-hidden p-6 sm:p-10 lg:grid-cols-2">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Mulai di sini</p>
        <h1 class="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          Kamu belum punya <span class="text-brand-gradient">studio</span>
        </h1>
        <p class="mt-4 text-ink-300">Ajukan studiomu agar penyewa bisa menemukan dan booking ruanganmu. Prosesnya cuma beberapa menit.</p>
        <BaseButton class="mt-8" size="lg" @click="showSubmission = true">＋ Buat studiomu</BaseButton>
      </div>
      <ol class="space-y-3 text-sm">
        <li v-for="(step, index) in onboarding" :key="step" class="flex items-center gap-3 rounded-xl bg-ink-900/70 px-4 py-3">
          <span class="bg-brand-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-white">{{ index + 1 }}</span>
          {{ step }}
        </li>
      </ol>
    </section>

    <SubmissionFormModal :open="showSubmission" @close="showSubmission = false" />
  </AppLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import PageHeader from '../components/ui/PageHeader.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BasePagination from '../components/ui/BasePagination.vue'
import StudioCard from '../components/studio/StudioCard.vue'
import SubmissionStatusCard from '../components/studio/SubmissionStatusCard.vue'
import SubmissionFormModal from '../components/studio/SubmissionFormModal.vue'
import { studioApi } from '../api/studio'
import { refreshOverview, useOwnerOverview } from '../composables/useOwnerOverview'
import { toast } from '../composables/useToast'

const PAGE_SIZE = 6
const onboarding = ['Isi data studio, lokasi, dan rekening', 'Tim kami memverifikasi pengajuanmu', 'Atur ruangan, harga, dan jam operasional', 'Aktifkan langganan, studio langsung tayang']

const { submission } = useOwnerOverview()
const studios = ref([])
const page = ref(1)
const maxPage = ref(1)
const totalData = ref(0)
const search = ref('')
const hasStudios = ref(false)
const initialLoading = ref(true)
const refreshing = ref(false)
const showSubmission = ref(false)

async function load(targetPage = page.value) {
  try {
    const result = await studioApi.list(targetPage, search.value, PAGE_SIZE)
    studios.value = result.data ?? []
    page.value = result.page
    maxPage.value = result.maxPage || 1
    totalData.value = result.totalData
    if (result.totalData > 0) hasStudios.value = true
  } catch (error) {
    toast.error(error.message)
  }
}

async function refreshSubmission() {
  refreshing.value = true
  await refreshOverview().catch(() => null)
  refreshing.value = false
  if (submission.value?.status === 'submission') toast.info('Pengajuan masih diproses.')
}

onMounted(async () => {
  await Promise.all([load(1), refreshOverview().catch(() => null)])
  initialLoading.value = false
})
</script>
