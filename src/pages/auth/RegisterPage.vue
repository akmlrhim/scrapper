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
        <p class="text-sm text-gray-500 mt-1">Buat akun baru</p>
      </div>

      <!-- Success state -->
      <div v-if="success" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center space-y-4">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <div>
          <p class="font-semibold text-gray-900">Pendaftaran berhasil!</p>
          <p class="text-sm text-gray-500 mt-1">
            Cek email <strong>{{ email }}</strong> untuk verifikasi akun, lalu login.
          </p>
        </div>
        <RouterLink to="/login" class="block">
          <AppButton class="w-full justify-center" variant="primary">Ke Halaman Login</AppButton>
        </RouterLink>
      </div>

      <!-- Form -->
      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
          {{ error }}
        </div>

        <AppInput
          v-model="fullName"
          label="Nama Lengkap"
          type="text"
          placeholder="John Doe"
          id="fullName"
          :disabled="loading"
        >
          <template #prefix>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </template>
        </AppInput>

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
          placeholder="Min. 8 karakter"
          id="password"
          :disabled="loading"
        >
          <template #prefix>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </template>
        </AppInput>

        <AppInput
          v-model="confirmPassword"
          label="Konfirmasi Password"
          type="password"
          placeholder="Ulangi password"
          id="confirmPassword"
          :disabled="loading"
          @keyup.enter="handleRegister"
        >
          <template #prefix>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </template>
        </AppInput>

        <AppButton
          class="w-full justify-center"
          :loading="loading"
          @click="handleRegister"
        >
          Daftar Sekarang
        </AppButton>

        <p class="text-center text-sm text-gray-500">
          Sudah punya akun?
          <RouterLink to="/login" class="text-blue-600 font-medium hover:underline">Masuk</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const success = ref(false)
const auth = useAuthStore()

async function handleRegister() {
  error.value = ''

  if (!fullName.value.trim()) {
    error.value = 'Nama lengkap wajib diisi.'
    return
  }
  if (!email.value || !password.value) {
    error.value = 'Email dan password wajib diisi.'
    return
  }
  if (password.value.length < 8) {
    error.value = 'Password minimal 8 karakter.'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Konfirmasi password tidak cocok.'
    return
  }

  loading.value = true
  try {
    await auth.register(email.value, password.value, fullName.value.trim())
    success.value = true
  } catch (e) {
    error.value = e.message || 'Pendaftaran gagal. Coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>
