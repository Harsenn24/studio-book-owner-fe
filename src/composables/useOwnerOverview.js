import { computed, ref } from 'vue'
import { studioApi } from '../api/studio'

// Shared by the navbar and the home page: the latest submission and whether the owner has studios.
// Loaded once and reused; `refresh()` after a submission or a new studio.
const submission = ref(null)
const studioCount = ref(0)
const loaded = ref(false)
let pending = null

async function load() {
  const [envelope, studios] = await Promise.all([studioApi.latestSubmission(), studioApi.list(1, '', 1).catch(() => null)])
  submission.value = envelope.status ? envelope.data : null
  studioCount.value = studios?.totalData ?? 0
  loaded.value = true
}

export function refreshOverview() {
  pending = load().finally(() => { pending = null })
  return pending
}

export function useOwnerOverview() {
  if (!loaded.value && !pending) refreshOverview()
  return {
    submission,
    studioCount,
    loaded,
    // Same rule as before: a new submission is possible once the previous one was decided
    canSubmitAnother: computed(() => studioCount.value > 0 && ['accepted', 'rejected'].includes(submission.value?.status)),
  }
}

export function resetOverview() {
  submission.value = null
  studioCount.value = 0
  loaded.value = false
}
