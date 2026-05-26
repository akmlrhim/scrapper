import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/auth/LoginPage.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/auth/RegisterPage.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/pages/DashboardPage.vue')
      },
      {
        path: 'scraping',
        name: 'Scraping',
        component: () => import('@/pages/ScrapingPage.vue')
      },
      {
        path: 'leads',
        name: 'Leads',
        component: () => import('@/pages/LeadsPage.vue')
      },
      {
        path: 'admin',
        name: 'Admin',
        component: () => import('@/pages/AdminPage.vue'),
        meta: { requiresAdmin: true }
      }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.init() // only awaits getSession() now — fast

  if (to.meta.requiresAuth && !auth.user) return '/login'
  if (to.meta.guest && auth.user) return '/'

  // Only block on profile for admin routes
  if (to.meta.requiresAdmin) {
    await auth.ensureProfile()
    if (auth.profile?.role !== 'admin') return '/'
  }
})

export default router
