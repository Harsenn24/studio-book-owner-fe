<template>
  <AppLayout>
    <PageHeader back="/home" backLabel="Semua studio" eyebrow="Kelola studio" :title="studio?.studio_name || 'Memuat…'"
      :subtitle="studio ? `${studio.studio_district}, ${studio.studio_city}` : ''">
      <StatusBadge v-if="studio" :status="studio.status" class="text-sm" />
    </PageHeader>

    <!-- Tabs: scrollable row on phones -->
    <nav class="no-scrollbar -mx-4 mb-6 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Menu studio">
      <div class="flex gap-1 rounded-2xl border border-ink-600/60 bg-ink-800/60 p-1">
        <button v-for="item in TABS" :key="item.key" type="button"
          class="whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition"
          :class="tab === item.key ? 'bg-ink-600 text-ink-100' : 'text-ink-300 hover:text-ink-100'"
          @click="setTab(item.key)">{{ item.icon }} {{ item.label }}</button>
      </div>
    </nav>

    <div v-if="loading" class="card h-96 animate-pulse" />
    <template v-else-if="studio">
      <ProfileTab v-if="tab === 'profil'" :studio="studio" :rooms="rooms" @activate="showSubscription = true" />
      <SubscriptionTab v-else-if="tab === 'subscription'" :studio-uuid="studioUuid" />
      <RentTab v-else-if="tab === 'rent'" :studio-uuid="studioUuid" />
      <WithdrawalTab v-else-if="tab === 'withdrawal'" :studio-uuid="studioUuid" />
    </template>

    <SubscriptionModal v-if="studio" :open="showSubscription" :studio-uuid="studioUuid" @close="showSubscription = false" @paid="onPaid" />
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../components/layout/AppLayout.vue'
import PageHeader from '../components/ui/PageHeader.vue'
import StatusBadge from '../components/ui/StatusBadge.vue'
import ProfileTab from '../components/studio/ProfileTab.vue'
import SubscriptionModal from '../components/studio/SubscriptionModal.vue'
import SubscriptionTab from '../components/funding/SubscriptionTab.vue'
import RentTab from '../components/funding/RentTab.vue'
import WithdrawalTab from '../components/funding/WithdrawalTab.vue'
import { studioApi } from '../api/studio'
import { toast } from '../composables/useToast'

const TABS = [
  { key: 'profil', label: 'Profil', icon: '🏠' },
  { key: 'subscription', label: 'Transaksi Berlangganan', icon: '🧾' },
  { key: 'rent', label: 'Transaksi Sewa', icon: '🎸' },
  { key: 'withdrawal', label: 'Penarikan Dana', icon: '🏦' },
]

const route = useRoute()
const router = useRouter()
const studioUuid = route.params.studio_uuid

// The tab lives in the URL so a reload keeps it
const tab = computed(() => (TABS.some((item) => item.key === route.query.tab) ? route.query.tab : 'profil'))
const setTab = (key) => router.replace({ query: { ...route.query, tab: key } })

const studio = ref(null)
const rooms = ref([])
const loading = ref(true)
const showSubscription = ref(false)

async function load() {
  try {
    const [detail, roomList] = await Promise.all([studioApi.detail(studioUuid), studioApi.rooms(studioUuid)])
    studio.value = detail
    rooms.value = roomList.data ?? []
  } catch (error) {
    toast.error(error.message)
  } finally {
    loading.value = false
  }
}

function onPaid() {
  showSubscription.value = false
  toast.success('Pembayaran diterima. Studio kamu sekarang aktif! 🎉')
  load()
}

onMounted(load)
</script>
