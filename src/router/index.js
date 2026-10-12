import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '../composables/useSession'

const auth = { requiresAuth: true }

// Paths are unchanged; pages are lazy-loaded and auth is checked in one guard
const routes = [
  { path: '/', redirect: '/home' },
  { path: '/login', component: () => import('../pages/LoginPage.vue') },
  { path: '/verify/owner/:uuid', component: () => import('../pages/VerifyEmailPage.vue') },
  { path: '/home', component: () => import('../pages/HomePage.vue'), meta: auth },
  { path: '/home/submission-status/:submission_uuid', component: () => import('../pages/SubmissionStatusPage.vue'), meta: auth },
  { path: '/home/create-studio-detail/:studio_uuid', component: () => import('../pages/StudioNumberFormPage.vue'), meta: auth },
  { path: '/home/:studio_uuid', component: () => import('../pages/StudioDetailPage.vue'), meta: auth },
  { path: '/home/:studio_uuid/:studio_number_uuid', component: () => import('../pages/StudioNumberFormPage.vue'), meta: auth },
  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, from, saved) => saved ?? (to.path === from.path ? undefined : { top: 0 }),
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !getToken()) return { path: '/login', query: { redirect: to.fullPath } }
})

export default router
