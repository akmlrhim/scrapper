<template>
  <div class="space-y-6">
    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-gray-500">{{ stat.label }}</span>
          <span :class="['w-8 h-8 rounded-lg flex items-center justify-center', stat.bg]">
            <span :class="['w-4 h-4 flex-shrink-0', stat.iconColor]" v-html="stat.icon"></span>
          </span>
        </div>
        <p class="text-2xl font-bold text-gray-900">{{ stat.loading ? '...' : stat.value }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ stat.sub }}</p>
      </div>
    </div>

    <!-- Recent Tasks -->
    <div class="bg-white rounded-xl border border-gray-200">
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 class="font-semibold text-gray-800">Task Terbaru</h2>
        <router-link to="/scraping" class="text-sm text-blue-600 hover:underline">Lihat semua</router-link>
      </div>
      <div v-if="tasks.loading" class="p-6 text-center text-gray-400 text-sm">Memuat...</div>
      <div v-else-if="tasks.tasks.length === 0" class="p-8 text-center">
        <div class="flex justify-center mb-3">
          <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="text-gray-500 text-sm">Belum ada task. <router-link to="/scraping" class="text-blue-600 hover:underline">Mulai scraping pertama kamu!</router-link></p>
      </div>
      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="task in tasks.tasks.slice(0, 5)"
          :key="task.id"
          class="flex items-center gap-4 px-5 py-3"
        >
          <AppBadge :color="statusColor(task.status)" dot class="flex-shrink-0">{{ statusLabel(task.status) }}</AppBadge>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800 truncate">{{ task.keyword }}</p>
            <p class="text-xs text-gray-400">{{ task.province }} &rsaquo; {{ task.city }}</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="text-sm font-semibold text-gray-700">{{ task.found_leads }}</p>
            <p class="text-xs text-gray-400">leads</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Start CTA -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-6 flex items-center justify-between">
      <div class="text-white">
        <h3 class="font-semibold text-lg">Mulai scraping leads baru</h3>
        <p class="text-blue-100 text-sm mt-1">Filter berdasarkan wilayah dan industri untuk hasil terbaik.</p>
      </div>
      <router-link to="/scraping">
        <AppButton variant="secondary" size="lg">Mulai Sekarang</AppButton>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useLeadsStore } from '@/stores/leads'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'

const tasks = useTasksStore()
const leads = useLeadsStore()

onMounted(() => {
  tasks.fetchTasks()
  tasks.subscribeRealtime()
  leads.fetchLeads()
})
onUnmounted(() => tasks.unsubscribeRealtime())

const totalLeads      = computed(() => leads.totalCount)
const completedTasks  = computed(() => tasks.tasks.filter(t => t.status === 'completed').length)
const runningTasks    = computed(() => tasks.tasks.filter(t => t.status === 'running').length)
const leadsWithWebsite = computed(() => leads.leads.filter(l => l.has_website).length)

const SVG_USERS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
const SVG_CHECK_CIRCLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
const SVG_ZAP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
const SVG_GLOBE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`

const stats = computed(() => [
  { label: 'Total Leads',   icon: SVG_USERS,        iconColor: 'text-blue-600',   bg: 'bg-blue-50',   value: totalLeads.value.toLocaleString(), sub: 'semua waktu',    loading: leads.loading },
  { label: 'Task Selesai',  icon: SVG_CHECK_CIRCLE, iconColor: 'text-green-600',  bg: 'bg-green-50',  value: completedTasks.value,              sub: 'dari ' + tasks.tasks.length + ' task', loading: tasks.loading },
  { label: 'Task Berjalan', icon: SVG_ZAP,          iconColor: 'text-yellow-600', bg: 'bg-yellow-50', value: runningTasks.value,                sub: 'sedang diproses', loading: tasks.loading },
  { label: 'Punya Website', icon: SVG_GLOBE,        iconColor: 'text-purple-600', bg: 'bg-purple-50', value: leadsWithWebsite.value,            sub: 'sudah digital',   loading: leads.loading },
])

const statusColor = (s) => ({ pending: 'yellow', running: 'blue', completed: 'green', failed: 'red' }[s] ?? 'gray')
const statusLabel = (s) => ({ pending: 'Antri', running: 'Berjalan', completed: 'Selesai', failed: 'Gagal' }[s] ?? s)
</script>
