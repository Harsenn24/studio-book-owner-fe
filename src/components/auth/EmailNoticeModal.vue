<template>
  <BaseModal :open="!!kind" :icon="content.icon" :title="content.title" @close="emit('close')">
    {{ content.body }}
    <template #actions>
      <BaseButton block @click="emit('close')">Oke, mengerti</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from '../ui/BaseModal.vue'
import BaseButton from '../ui/BaseButton.vue'

// kind: 'sent' (verification email sent) | 'limit' (daily email limit reached) | null
const props = defineProps({ kind: { type: String, default: null } })
const emit = defineEmits(['close'])

const CONTENT = {
  sent: {
    icon: '📬',
    title: 'Cek email kamu',
    body: 'Link verifikasi sudah kami kirim. Buka inbox (atau folder spam), klik link-nya, lalu login lagi.',
  },
  limit: {
    icon: '⏳',
    title: 'Batas email harian tercapai',
    body: 'Email verifikasi sudah dikirim 3 kali hari ini. Silakan coba lagi besok ya, terima kasih atas pengertiannya!',
  },
}

const content = computed(() => CONTENT[props.kind] ?? CONTENT.sent)
</script>
