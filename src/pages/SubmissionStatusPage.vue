<template>
  <AppLayout>
    <PageHeader back="/home" backLabel="Dashboard" eyebrow="Pengajuan" title="Status pengajuan studio" />

    <div v-if="!loaded" class="card h-96 animate-pulse" />
    <EmptyState v-else-if="!submission" icon="📭" title="Belum ada pengajuan" description="Kamu belum pernah mengajukan studio." />
    <SubmissionStatusCard v-else :submission="submission" :refreshing="refreshing" @refresh="refresh" @resubmit="showSubmission = true" />

    <SubmissionFormModal :open="showSubmission" @close="showSubmission = false" />
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import PageHeader from '../components/ui/PageHeader.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import SubmissionStatusCard from '../components/studio/SubmissionStatusCard.vue'
import SubmissionFormModal from '../components/studio/SubmissionFormModal.vue'
import { refreshOverview, useOwnerOverview } from '../composables/useOwnerOverview'
import { toast } from '../composables/useToast'

const { submission, loaded } = useOwnerOverview()
const refreshing = ref(false)
const showSubmission = ref(false)

refreshOverview().catch(() => null)

async function refresh() {
  refreshing.value = true
  await refreshOverview().catch(() => null)
  refreshing.value = false
  if (submission.value?.status === 'submission') toast.info('Pengajuan masih diproses.')
}
</script>
