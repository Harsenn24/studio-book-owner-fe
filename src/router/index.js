import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage/HomePage.vue'
import LoginPage from '../components/LoginPage/LoginPage.vue'
import VerifyEmailPage from '../components/VerifyEmailPage/VerifyEmailPage.vue'
import CreateStudioDetailPage from '../components/CreateStudioDetailPage/CreateStudioDetailPage.vue'
import StudioDetailPage from '../components/StudioDetailPage/StudioDetailPage.vue'
import SubmissionStatusPage from '../components/SubmissionStatusPage/SubmissionStatusPage.vue'



const routes = [
  { path: '/home', component: HomePage },
  { path: '/login', component: LoginPage },
  { path: '/verify/owner/:uuid', component: VerifyEmailPage },
  { path: '/home/create-studio-detail/:studio_uuid', component: CreateStudioDetailPage },
  { path: '/home/:studio_uuid', component: StudioDetailPage },
  { path: '/home/:studio_uuid/:studio_number_uuid', component: CreateStudioDetailPage },
  { path: '/home/submission-status/:submission_uuid', component: SubmissionStatusPage },

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
