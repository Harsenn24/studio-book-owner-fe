<template>
  <AuthLayout>
    <div class="py-4 text-center">
      <template v-if="state === 'loading'">
        <div class="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-4 border-ink-600 border-t-brand-500" />
        <h2 class="text-xl font-extrabold">Memverifikasi email kamu…</h2>
      </template>

      <template v-else-if="state === 'success'">
        <div class="mx-auto mb-5 flex h-16 w-16 animate-pop items-center justify-center rounded-2xl bg-emerald-500/15 text-3xl">✅</div>
        <h2 class="text-xl font-extrabold">Email berhasil diverifikasi!</h2>
        <p class="mt-2 text-sm text-ink-300">Akunmu sudah aktif. Ajukan studio pertamamu sekarang.</p>
        <BaseButton class="mt-8" size="lg" block :to="isLoggedIn ? '/home' : '/login'">{{ isLoggedIn ? 'Ke dashboard' : 'Login sekarang' }}</BaseButton>
      </template>

      <template v-else>
        <div class="mx-auto mb-5 flex h-16 w-16 animate-pop items-center justify-center rounded-2xl bg-rose-500/15 text-3xl">⚠️</div>
        <h2 class="text-xl font-extrabold">Link verifikasi tidak valid</h2>
        <p class="mt-2 text-sm text-ink-300">{{ errorMessage }} Login lagi untuk menerima link verifikasi baru.</p>
        <BaseButton class="mt-8" size="lg" block to="/login">Kirim ulang lewat login</BaseButton>
      </template>
    </div>
  </AuthLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AuthLayout from '../components/layout/AuthLayout.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { authApi } from '../api/auth'
import { messageOf } from '../api/http'
import { useSession } from '../composables/useSession'

const route = useRoute()
const { isLoggedIn, setToken } = useSession()
const state = ref('loading')
const errorMessage = ref('')

const MESSAGES = {
  'Token expired': 'Link-nya sudah kedaluwarsa.',
  'Email already verified': 'Email ini sudah pernah diverifikasi.',
}

onMounted(async () => {
  try {
    const result = await authApi.verifyEmail(route.query.token)
    if (result.status) {
      // The token sits in data.token (it was read from the wrong place before)
      if (result.data?.token) setToken(result.data.token)
      state.value = 'success'
    } else {
      errorMessage.value = MESSAGES[result.message] ?? messageOf(result, 'Link tidak dikenali.')
      state.value = 'error'
    }
  } catch (error) {
    errorMessage.value = error.message
    state.value = 'error'
  }
})
</script>
