<template>
  <div class="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="font-medium text-gray-900 text-sm truncate">{{ task.keyword }}</p>
        <p class="text-xs text-gray-500 mt-0.5">{{ task.province }} › {{ task.city }}<span v-if="task.district"> › {{ task.district }}</span></p>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <AppBadge :color="statusColor" dot>{{ statusLabel }}</AppBadge>
        <!-- Delete button — only for finished tasks -->
        <button
          v-if="task.status !== 'running' && task.status !== 'pending'"
          @click="confirmDelete = true"
          class="text-gray-300 hover:text-red-400 transition-colors"
          title="Hapus task"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 11v6M14 11v6" stroke-width="2" stroke-linecap="round"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <AppProgress
      :value="task.progress"
      :color="progressColor"
      :label="`${task.found_leads} leads ditemukan`"
    />

    <div class="flex items-center justify-between text-xs text-gray-400">
      <span>{{ formatTime(task.created_at) }}</span>
      <button
        v-if="task.status === 'running'"
        @click="$emit('cancel', task.id)"
        class="text-red-500 hover:text-red-700 font-medium"
      >Batalkan</button>
      <span v-if="task.status === 'completed'" class="text-green-600 font-medium inline-flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ task.found_leads }} leads
      </span>
      <span v-if="task.status === 'failed'" class="text-red-500">Gagal</span>
    </div>

    <!-- Inline delete confirmation -->
    <div
      v-if="confirmDelete"
      class="flex items-center justify-between gap-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
    >
      <p class="text-xs text-red-600 font-medium">Hapus task beserta semua leads-nya?</p>
      <div class="flex gap-2">
        <button
          @click="confirmDelete = false"
          class="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
        >Batal</button>
        <button
          @click="handleDelete"
          :disabled="deleting"
          class="text-xs text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 px-3 py-1 rounded-md font-medium transition-colors"
        >{{ deleting ? 'Menghapus...' : 'Ya, Hapus' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppProgress from '@/components/ui/AppProgress.vue'

const props = defineProps({ task: Object })
const emit = defineEmits(['cancel', 'delete'])

const confirmDelete = ref(false)
const deleting = ref(false)

const statusColor = computed(() => ({
  pending: 'yellow', running: 'blue', completed: 'green', failed: 'red'
}[props.task.status] ?? 'gray'))

const statusLabel = computed(() => ({
  pending: 'Antri', running: 'Berjalan', completed: 'Selesai', failed: 'Gagal'
}[props.task.status] ?? props.task.status))

const progressColor = computed(() => props.task.status === 'failed' ? 'red' : props.task.status === 'completed' ? 'green' : 'blue')

function formatTime(iso) {
  return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

async function handleDelete() {
  deleting.value = true
  try {
    await emit('delete', props.task.id)
  } finally {
    deleting.value = false
    confirmDelete.value = false
  }
}
</script>
