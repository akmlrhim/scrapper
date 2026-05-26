<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">GeoLeads</h1>
        <p class="text-sm text-gray-500 mt-1">Platform Scraping Leads Berbasis Lokasi</p>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
          {{ error }}
        </div>

        <AppInput
          v-model="email"
          label="Email"
          type="email"
          placeholder="nama@perusahaan.com"
          id="email"
          :disabled="loading"
        >
          <template #prefix>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
            </svg>
          </template>
        </AppInput>

        <AppInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          id="password"
          :disabled="loading"
          @keyup.enter="handleLogin"
        >
          <template #prefix>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </template>
        </AppInput>

        <AppButton
          class="w-full justify-center"
          :loading="loading"
          @click="handleLogin"
        >
          Masuk
        </AppButton>

        <p class="text-center text-sm text-gray-500">
          Belum punya akun?
          <RouterLink to="/register" class="text-blue-600 font-medium hover:underline">Daftar</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const auth = useAuthStore()
const router = useRouter()

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Email dan password wajib diisi.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = e.message || 'Login gagal. Periksa email dan password.'
  } finally {
    loading.value = false
  }
}
</script>
