<template>
	<div class="flex h-screen overflow-hidden bg-gray-50">
		<!-- Mobile backdrop -->
		<transition name="fade">
			<div v-if="mobileOpen" class="fixed inset-0 z-20 bg-black/50 lg:hidden" @click="mobileOpen = false" />
		</transition>

		<AppSidebar :collapsed="collapsed" :mobile-open="mobileOpen" @toggle="collapsed = !collapsed"
			@close-mobile="mobileOpen = false" />

		<div class="flex-1 flex flex-col overflow-hidden min-w-0">
			<!-- Header -->
			<header class="h-14 bg-white border-b border-gray-200 flex items-center gap-3 px-4 lg:px-6 flex-shrink-0">
				<!-- Hamburger (mobile only) -->
				<button class="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 flex-shrink-0"
					@click="mobileOpen = true">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>

				<h1 class="flex-1 text-base font-semibold text-black">{{ pageTitle }}</h1>

				<span class="hidden sm:inline text-xs text-black">{{ formattedDate }}</span>
			</header>

			<!-- Main content -->
			<main class="flex-1 overflow-y-auto p-4 lg:p-6">
				<router-view />
			</main>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'

const collapsed = ref(false)
const mobileOpen = ref(false)
const route = useRoute()

watch(() => route.path, () => { mobileOpen.value = false })

const titles = { '/': 'Dashboard', '/scraping': 'Scraping Leads', '/leads': 'Data Leads', '/admin': 'Admin Panel' }
const pageTitle = computed(() => titles[route.path] ?? 'GeoLeads')
const formattedDate = computed(() =>
	new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
