<template>
  <AuthLayout>
    <!-- Login / register switch (same page, as before) -->
    <div class="mb-6 grid grid-cols-2 rounded-xl border border-ink-600/70 bg-ink-900/70 p-1">
      <button v-for="tab in tabs" :key="tab.key" type="button" class="rounded-lg py-2 text-sm font-semibold transition"
        :class="mode === tab.key ? 'bg-ink-600 text-ink-100' : 'text-ink-400 hover:text-ink-100'"
        :disabled="loading" @click="mode = tab.key">{{ tab.label }}</button>
    </div>

    <h2 class="text-2xl font-extrabold tracking-tight">{{ isLogin ? 'Masuk ke akunmu' : 'Buat akun pemilik studio' }}</h2>
    <p class="mt-2 text-sm text-ink-300">
      {{ isLogin ? 'Masukkan email dan password untuk mengelola studio.' : 'Daftar gratis, lalu ajukan studiomu untuk diverifikasi.' }}
    </p>

    <form class="mt-7 space-y-5" @submit.prevent="submit">
      <BaseInput v-if="!isLogin" v-model="form.name" label="Nama lengkap" placeholder="Contoh: Ahmad Nidjam" icon="👤" autocomplete="name"
        maxlength="50" required :error="touched ? nameError : ''" />
      <BaseInput v-model="form.email" type="email" label="Email" placeholder="nama@email.com" icon="✉️" autocomplete="email" required />
      <BaseInput v-model="form.password" type="password" label="Password" placeholder="••••••••" icon="🔒"
        :autocomplete="isLogin ? 'current-password' : 'new-password'" maxlength="50" required
        :error="!isLogin && touched ? passwordError : ''" :hint="isLogin ? '' : 'Minimal 6 karakter, ada huruf besar, huruf kecil, dan angka.'" />
      <BaseButton type="submit" size="lg" block :loading="loading">{{ isLogin ? 'Masuk sekarang' : 'Daftar sekarang' }}</BaseButton>
    </form>

    <p class="mt-8 text-center text-xs text-ink-400">© {{ new Date().getFullYear() }} SewaStudio. All rights reserved.</p>

    <EmailNoticeModal :kind="notice" @close="closeNotice" />
  </AuthLayout>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '../components/layout/AuthLayout.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import EmailNoticeModal from '../components/auth/EmailNoticeModal.vue'
import { authApi } from '../api/auth'
import { messageOf } from '../api/http'
import { useSession } from '../composables/useSession'
import { refreshOverview } from '../composables/useOwnerOverview'
import { toast } from '../composables/useToast'

const route = useRoute()
const router = useRouter()
const { setToken } = useSession()

const tabs = [{ key: 'login', label: 'Masuk' }, { key: 'register', label: 'Daftar' }]
const mode = ref('login')
const isLogin = computed(() => mode.value === 'login')
const form = reactive({ name: '', email: '', password: '' })
const loading = ref(false)
const touched = ref(false)
const notice = ref(null)

watch(mode, () => { touched.value = false })

// Same rules as the backend register validator
const nameError = computed(() => (form.name.trim().length < 4 ? 'Nama minimal 4 karakter.' : ''))
const passwordError = computed(() => {
  if (form.password.length < 6) return 'Password minimal 6 karakter.'
  if (!/[a-z]/.test(form.password) || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) return 'Harus ada huruf besar, huruf kecil, dan angka.'
  return ''
})

async function login() {
  const result = await authApi.login(form.email, form.password)
  if (result.message === 'Verification email re-sent') return (notice.value = 'sent')
  if (result.message === 'Email has been limited') return (notice.value = 'limit')
  if (!result.status) return toast.error(messageOf(result, 'Login gagal'))

  setToken(result.data.token)
  refreshOverview()
  router.push(route.query.redirect?.startsWith('/') ? route.query.redirect : '/home')
}

async function register() {
  touched.value = true
  if (nameError.value || passwordError.value) return

  const result = await authApi.register(form.name.trim(), form.email, form.password)
  if (result.message === 'Email has been limited') return (notice.value = 'limit')
  if (!result.status) return toast.error(messageOf(result, 'Registrasi gagal'))
  notice.value = 'sent'
}

async function submit() {
  if (loading.value) return
  loading.value = true
  try {
    await (isLogin.value ? login() : register())
  } catch (error) {
    toast.error(error.message)
  } finally {
    loading.value = false
  }
}

function closeNotice() {
  notice.value = null
  mode.value = 'login'
}
</script>
