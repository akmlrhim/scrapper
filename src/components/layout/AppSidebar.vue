<template>
	<!-- On mobile: fixed drawer with transform slide; on desktop: static inline -->
	<aside :class="[
		'flex flex-col bg-gray-900 text-white z-30 transition-all duration-300',
		// Desktop: static, collapsible width
		'lg:relative lg:translate-x-0',
		collapsed ? 'lg:w-16' : 'lg:w-60',
		// Mobile: fixed full-height drawer, always w-64
		'fixed inset-y-0 left-0 w-64',
		mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
	]">
		<!-- Logo -->
		<div class="flex items-center gap-3 px-4 py-5 border-b border-gray-800 flex-shrink-0">
			<div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
				<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			</div>
			<span v-if="!collapsed || mobileOpen" class="font-bold text-lg tracking-tight flex-1">Scrapper</span>
			<!-- Mobile close button -->
			<button class="lg:hidden text-gray-400 hover:text-white p-1" @click="$emit('closeMobile')">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Nav -->
		<nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
			<router-link v-for="item in navItems" :key="item.to" :to="item.to" :class="[
				'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
				$route.path === item.to || ($route.path.startsWith(item.to + '/') && item.to !== '/')
					? 'bg-blue-600 text-white'
					: 'text-white hover:bg-gray-800 hover:text-white'
			]">
				<component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
				<span v-if="!collapsed || mobileOpen">{{ item.label }}</span>
			</router-link>
		</nav>

		<!-- User + Logout -->
		<div class="border-t border-gray-800 p-3 flex-shrink-0">
			<div v-if="!collapsed || mobileOpen" class="flex items-center gap-3 px-2 py-2 mb-2 rounded-lg">
				<div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
					{{ initials }}
				</div>
				<div class="min-w-0">
					<p class="text-sm font-medium text-white truncate">{{ auth.profile?.full_name || auth.user?.email }}</p>
					<AppBadge :color="auth.isAdmin ? 'blue' : 'gray'" class="mt-0.5">{{ auth.profile?.role || 'sales' }}
					</AppBadge>
				</div>
			</div>
			<button @click="auth.logout(); $router.push('/login')"
				class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-gray-800 hover:text-white transition-colors">
				<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
				</svg>
				<span v-if="!collapsed || mobileOpen">Keluar</span>
			</button>

			<!-- Collapse toggle (desktop only) -->
			<button class="hidden lg:flex w-full items-center justify-center py-2 text-gray-500 hover:text-white"
				@click="$emit('toggle')">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						:d="collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'" />
				</svg>
			</button>
		</div>
	</aside>
</template>

<script setup>
import { computed, h } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppBadge from '@/components/ui/AppBadge.vue'

const props = defineProps({
	collapsed: Boolean,
	mobileOpen: Boolean,
})
defineEmits(['toggle', 'closeMobile'])

const auth = useAuthStore()
const $route = useRoute()

const initials = computed(() => {
	const name = auth.profile?.full_name || auth.user?.email || ''
	return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
})

const icon = (paths) => ({
	render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
		paths.map(d => h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': 2, d })))
})

const navItems = [
	{
		to: '/',
		label: 'Dashboard',
		icon: icon(['M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'])
	},
	{
		to: '/scraping',
		label: 'Scraping',
		icon: icon(['M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'])
	},
	{
		to: '/leads',
		label: 'Leads',
		icon: icon(['M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'])
	},
]
</script>
