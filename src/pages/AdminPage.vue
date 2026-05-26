<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl border border-gray-200 p-5">
      <h2 class="font-semibold text-gray-800 mb-4">Manajemen Pengguna</h2>

      <div v-if="loading" class="text-center py-6 text-gray-400 text-sm">Memuat...</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nama</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Bergabung</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="u in users" :key="u.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-900">{{ u.full_name || '-' }}</td>
              <td class="px-4 py-3 text-gray-600">{{ u.email }}</td>
              <td class="px-4 py-3">
                <AppBadge :color="u.role === 'admin' ? 'blue' : 'gray'">{{ u.role }}</AppBadge>
              </td>
              <td class="px-4 py-3 text-gray-400 text-xs">{{ formatDate(u.created_at) }}</td>
              <td class="px-4 py-3">
                <select
                  :value="u.role"
                  @change="updateRole(u.id, $event.target.value)"
                  class="rounded border border-gray-300 text-xs px-2 py-1"
                >
                  <option value="sales">sales</option>
                  <option value="admin">admin</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import AppBadge from '@/components/ui/AppBadge.vue'

const users = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  const { data } = await supabase.from('profiles').select('*').order('created_at')
  users.value = data ?? []
  loading.value = false
})

async function updateRole(userId, role) {
  await supabase.from('profiles').update({ role }).eq('id', userId)
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
