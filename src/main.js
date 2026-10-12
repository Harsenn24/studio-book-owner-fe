import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { setUnauthorizedHandler } from './api/http'
import { toast } from './composables/useToast'
import { resetOverview } from './composables/useOwnerOverview'

// Expired or revoked token: back to login, once
setUnauthorizedHandler(() => {
  resetOverview()
  if (router.currentRoute.value.path === '/login') return
  toast.info('Sesi kamu sudah berakhir, silakan login lagi.')
  router.push('/login')
})

createApp(App).use(router).mount('#app')
