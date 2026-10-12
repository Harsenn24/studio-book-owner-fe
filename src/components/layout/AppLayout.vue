<template>
  <div class="stage-glow min-h-dvh">
    <header class="sticky top-0 z-40 border-b border-ink-600/50 bg-ink-950/75 backdrop-blur-xl">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <router-link to="/home" class="flex min-w-0 items-center gap-2">
          <span class="bg-brand-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg shadow-lg shadow-brand-500/30">🎸</span>
          <span class="truncate text-lg font-extrabold tracking-tight">Sewa<span class="text-brand-gradient">Studio</span></span>
          <span class="hidden rounded-md border border-ink-600 bg-ink-900/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-300 sm:inline">Owner</span>
        </router-link>

        <div class="flex items-center gap-2">
          <BaseButton v-if="canSubmitAnother" size="sm" @click="showSubmission = true">
            <span aria-hidden="true">＋</span><span class="hidden sm:inline">Tambah Studio</span>
          </BaseButton>
          <BaseButton variant="ghost" size="sm" aria-label="Keluar" @click="showLogout = true">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 17l-5-5 5-5" /><path d="M5 12h11" />
            </svg>
            <span class="hidden sm:inline">Keluar</span>
          </BaseButton>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 sm:pt-10 md:pb-16">
      <slot />
    </main>

    <SubmissionFormModal :open="showSubmission" @close="showSubmission = false" />

    <BaseModal :open="showLogout" icon="👋" title="Yakin mau keluar?" @close="showLogout = false">
      Kamu perlu login lagi untuk mengelola studio.
      <template #actions>
        <BaseButton variant="secondary" @click="showLogout = false">Batal</BaseButton>
        <BaseButton variant="danger" @click="logout">Ya, keluar</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../ui/BaseButton.vue'
import BaseModal from '../ui/BaseModal.vue'
import SubmissionFormModal from '../studio/SubmissionFormModal.vue'
import { useSession } from '../../composables/useSession'
import { resetOverview, useOwnerOverview } from '../../composables/useOwnerOverview'

const router = useRouter()
const { clearSession } = useSession()
const { canSubmitAnother } = useOwnerOverview()
const showLogout = ref(false)
const showSubmission = ref(false)

function logout() {
  showLogout.value = false
  clearSession()
  resetOverview()
  router.push('/login')
}
</script>
