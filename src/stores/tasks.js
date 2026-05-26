import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import { useLeadsStore } from './leads'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref([])
  const loading = ref(false)
  let realtimeChannel = null

  async function fetchTasks() {
    const auth = useAuthStore()
    loading.value = true
    try {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      tasks.value = data ?? []
    } finally {
      loading.value = false
    }
  }

  function subscribeRealtime() {
    const auth = useAuthStore()
    realtimeChannel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${auth.user.id}`
      }, (payload) => {
        const idx = tasks.value.findIndex(t => t.id === payload.new.id)
        if (payload.eventType === 'INSERT') {
          tasks.value.unshift(payload.new)
        } else if (payload.eventType === 'UPDATE') {
          if (idx !== -1) tasks.value[idx] = payload.new
        } else if (payload.eventType === 'DELETE') {
          if (idx !== -1) tasks.value.splice(idx, 1)
        }
      })
      .subscribe()
  }

  function unsubscribeRealtime() {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
  }

  async function startTask(params) {
    let response
    try {
      response = await fetch('/api/scraping/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
    } catch {
      throw new Error('Server backend tidak dapat dihubungi. Jalankan: npm run dev:server')
    }
    const json = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(json.error || `Gagal memulai task (HTTP ${response.status})`)
    return json
  }

  async function cancelTask(taskId) {
    await fetch(`/api/scraping/cancel/${taskId}`, { method: 'POST' })
  }

  async function deleteTask(taskId) {
    // Delete associated leads first, then the task
    const { error: leadsErr } = await supabase
      .from('leads')
      .delete()
      .eq('task_id', taskId)
    if (leadsErr) throw new Error(leadsErr.message)

    const { error: taskErr } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
    if (taskErr) throw new Error(taskErr.message)

    // Realtime will remove it from tasks array, but remove locally too as fallback
    tasks.value = tasks.value.filter(t => t.id !== taskId)

    // Invalidate leads cache so Leads page refetches on next visit
    useLeadsStore().invalidateCache()
  }

  return { tasks, loading, fetchTasks, subscribeRealtime, unsubscribeRealtime, startTask, cancelTask, deleteTask }
})
