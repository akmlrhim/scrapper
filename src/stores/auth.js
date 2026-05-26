import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(false)
  let initialized = false
  let profilePromise = null

  const isAdmin = computed(() => profile.value?.role === 'admin')

  async function init() {
    if (initialized) return
    initialized = true

    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null

    // Start profile fetch without blocking navigation
    if (user.value) profilePromise = fetchProfile()

    supabase.auth.onAuthStateChange(async (_, session) => {
      const newUser = session?.user ?? null
      const userChanged = newUser?.id !== user.value?.id
      user.value = newUser
      if (user.value && userChanged) {
        profilePromise = fetchProfile()
      } else if (!user.value) {
        profile.value = null
        profilePromise = null
      }
    })
  }

  // Only needed for admin route guard — non-admin routes skip this
  async function ensureProfile() {
    if (profilePromise) await profilePromise
  }

  async function fetchProfile() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()
    if (error) {
      console.error('fetchProfile error:', error.message)
      return
    }
    profile.value = data
  }

  async function login(email, password) {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
    } finally {
      loading.value = false
    }
  }

  async function register(email, password, fullName) {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) throw error
      return data
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
    profilePromise = null
  }

  return { user, profile, loading, isAdmin, init, ensureProfile, login, register, logout, fetchProfile }
})
