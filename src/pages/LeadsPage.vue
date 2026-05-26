<template>
	<div class="space-y-4">
		<!-- Toolbar -->
		<div class="bg-white rounded-xl border border-gray-200 p-4">
			<div class="flex flex-wrap items-center gap-3">
				<!-- Search -->
				<div class="flex-1 min-w-48">
					<AppInput v-model="searchInput" placeholder="Cari nama, alamat, telepon..." @input="debouncedSearch">
						<template #prefix>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</template>
					</AppInput>
				</div>

				<!-- Filter: Website -->
				<select v-model="filterWebsite" @change="applyFilters"
					class="rounded-lg border border-gray-300 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
					<option value="">Semua</option>
					<option value="true">Ada Website</option>
					<option value="false">Tanpa Website</option>
				</select>

				<!-- Filter: Pixel -->
				<select v-model="filterPixel" @change="applyFilters"
					class="rounded-lg border border-gray-300 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
					<option value="">Meta Pixel</option>
					<option value="true">Ada Pixel</option>
					<option value="false">Tanpa Pixel</option>
				</select>

				<div class="flex items-center gap-2 ml-auto">
					<!-- Subtle refresh indicator -->
					<svg v-if="leads.refreshing" class="w-4 h-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
					</svg>
					<span class="text-sm text-black">{{ leads.totalCount.toLocaleString() }} leads</span>
					<AppButton variant="secondary" size="sm" @click="leads.exportCSV">
						<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
								d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
						</svg>
						CSV
					</AppButton>
					<AppButton variant="secondary" size="sm" @click="leads.exportExcel">
						<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
								d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
						</svg>
						Excel
					</AppButton>
				</div>
			</div>
		</div>

		<!-- Table -->
		<div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
			<div v-if="leads.loading" class="p-10 text-center">
				<div class="flex justify-center mb-3">
					<svg class="w-8 h-8 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
					</svg>
				</div>
				<p class="text-gray-400 text-sm">Memuat data leads...</p>
			</div>
			<div v-else-if="leads.error && leads.leads.length === 0" class="p-10 text-center">
				<div class="flex justify-center mb-3">
					<svg class="w-10 h-10 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<circle cx="12" cy="12" r="10" stroke-width="1.5" />
						<line x1="12" y1="8" x2="12" y2="12" stroke-width="2" stroke-linecap="round" />
						<line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2" stroke-linecap="round" />
					</svg>
				</div>
				<p class="text-red-500 text-sm mb-3">{{ leads.error }}</p>
				<button @click="leads.fetchLeads()"
					class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">Coba
					Lagi</button>
			</div>
			<div v-else-if="!leads.loading && leads.leads.length === 0" class="p-10 text-center">
				<div class="flex justify-center mb-3">
					<svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
							d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
						<rect x="9" y="3" width="6" height="4" rx="1" stroke-width="1.5" />
						<line x1="9" y1="12" x2="15" y2="12" stroke-width="1.5" stroke-linecap="round" />
						<line x1="9" y1="16" x2="13" y2="16" stroke-width="1.5" stroke-linecap="round" />
					</svg>
				</div>
				<p class="text-black text-sm">Tidak ada leads ditemukan.</p>
			</div>
			<!-- Table always visible — dims during background refresh (pagination/filter) -->
			<div v-else class="overflow-x-auto transition-opacity duration-150" :class="{ 'opacity-50': leads.refreshing }">
				<table class="w-full text-sm">
					<thead class="bg-gray-50 border-b border-gray-200">
						<tr>
							<th class="text-left px-4 py-3 text-xs font-semibold text-black uppercase tracking-wide">Bisnis</th>
							<th class="text-left px-4 py-3 text-xs font-semibold text-black uppercase tracking-wide">Kontak</th>
							<th class="text-left px-4 py-3 text-xs font-semibold text-black uppercase tracking-wide">Lokasi</th>
							<th class="text-left px-4 py-3 text-xs font-semibold text-black uppercase tracking-wide">Rating</th>
							<th class="text-left px-4 py-3 text-xs font-semibold text-black uppercase tracking-wide">Media</th>
							<th class="text-left px-4 py-3 text-xs font-semibold text-black uppercase tracking-wide">Aksi</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						<tr v-for="lead in leads.leads" :key="lead.id" class="hover:bg-gray-50 transition-colors">
							<td class="px-4 py-3">
								<p class="font-medium text-black">{{ lead.business_name }}</p>
								<p class="text-xs text-black mt-0.5">{{ lead.category }}</p>
							</td>
							<td class="px-4 py-3">
								<p v-if="lead.phone" class="text-black">{{ lead.phone }}</p>
								<p v-if="lead.email" class="text-xs text-black">{{ lead.email }}</p>
								<a v-if="lead.website" :href="lead.website" target="_blank"
									class="text-xs text-blue-600 hover:underline truncate block max-w-32">{{ lead.website }}</a>
							</td>
							<td class="px-4 py-3">
								<p class="text-black text-xs">{{ lead.city }}</p>
								<p v-if="lead.district" class="text-xs text-black">{{ lead.district }}</p>
							</td>
							<td class="px-4 py-3">
								<div class="flex items-center gap-1">
									<svg class="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
										<polygon
											points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
									</svg>
									<span class="text-black font-medium">{{ lead.rating ?? '-' }}</span>
									<span v-if="lead.reviews_count" class="text-xs text-black">({{ lead.reviews_count }})</span>
								</div>
							</td>
							<td class="px-4 py-3">
								<DigitalMaturityBadge :hasWebsite="lead.has_website" :hasMetaPixel="lead.has_meta_pixel"
									:hasGoogleAds="lead.has_google_ads" :hasInstagram="lead.has_instagram" />
							</td>
							<td class="px-4 py-3">
								<a v-if="lead.maps_url" :href="lead.maps_url" target="_blank"
									class="text-xs text-blue-600 hover:underline">Google Maps</a>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			<div v-if="leads.totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
				<p class="text-xs text-gray-400">
					Menampilkan {{ ((leads.page - 1) * leads.pageSize) + 1 }}–{{ Math.min(leads.page * leads.pageSize,
						leads.totalCount) }} dari {{ leads.totalCount.toLocaleString() }}
				</p>
				<AppPagination :current="leads.page" :total="leads.totalPages" @change="leads.setPage" />
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLeadsStore } from '@/stores/leads'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import DigitalMaturityBadge from '@/components/features/leads/DigitalMaturityBadge.vue'

const leads = useLeadsStore()
const searchInput = ref('')
const filterWebsite = ref('')
const filterPixel = ref('')

let searchTimer = null
function debouncedSearch() {
	clearTimeout(searchTimer)
	searchTimer = setTimeout(() => leads.setSearch(searchInput.value), 400)
}

function applyFilters() {
	leads.setFilters({
		hasWebsite: filterWebsite.value === '' ? null : filterWebsite.value === 'true',
		hasPixel: filterPixel.value === '' ? null : filterPixel.value === 'true',
	})
}

onMounted(() => {
	if (!leads.leads.length) {
		leads.fetchLeads()
	} else if (!leads.isFresh) {
		leads.fetchLeads({ silent: true })
	}
})
</script>
