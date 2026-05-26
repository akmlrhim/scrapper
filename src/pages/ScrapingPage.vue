<template>
  <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
    <!-- Form Panel -->
    <div class="lg:col-span-2 space-y-4">
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="font-semibold text-gray-800 mb-4">Parameter Scraping</h2>

        <div class="space-y-3">
          <!-- Province -->
          <AppSelect
            v-model="selectedProvince"
            label="Provinsi"
            :options="regions.provinces"
            placeholder="Pilih provinsi..."
            @update:modelValue="handleProvinceChange($event)"
          />

          <!-- City -->
          <AppSelect
            v-model="selectedCity"
            label="Kota / Kabupaten"
            :options="regions.cities"
            placeholder="Pilih kota..."
            :disabled="!selectedProvince"
            @update:modelValue="handleCityChange($event)"
          />

          <!-- District -->
          <AppSelect
            v-model="selectedDistrict"
            label="Kecamatan (opsional)"
            :options="regions.districts"
            placeholder="Pilih kecamatan..."
            :disabled="!selectedCity"
            @update:modelValue="regions.selectDistrict($event)"
          />

          <!-- Keywords -->
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">Kata Kunci Industri</label>
            <div class="flex flex-wrap gap-1.5 mb-2">
              <span
                v-for="kw in keywords"
                :key="kw"
                class="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
              >
                {{ kw }}
                <button @click="removeKeyword(kw)" class="hover:text-blue-900">×</button>
              </span>
            </div>
            <div class="flex gap-2">
              <input
                v-model="keywordInput"
                placeholder="Contoh: restoran, salon, bengkel..."
                class="flex-1 rounded-lg border border-gray-300 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                @keyup.enter="addKeyword"
              />
              <button
                @click="addKeyword"
                class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
              >+</button>
            </div>
            <p class="text-xs text-gray-400 mt-1">Tekan Enter atau klik + untuk tambah kata kunci</p>
          </div>

          <!-- Max Results -->
          <AppSelect
            v-model="maxResults"
            label="Maks. Hasil"
            :options="['20', '50', '100', '200']"
            placeholder="Pilih jumlah..."
          />

          <!-- Options -->
          <div class="space-y-2 pt-1">
            <label class="text-sm font-medium text-gray-700">Analisis Digital</label>
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input v-model="checkWebsite" type="checkbox" class="rounded text-blue-600" />
              Cek keberadaan website
            </label>
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input v-model="checkPixel" type="checkbox" class="rounded text-blue-600" />
              Cek Meta Pixel
            </label>
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input v-model="checkGoogleAds" type="checkbox" class="rounded text-blue-600" />
              Cek Google Ads
            </label>
          </div>

          <AppButton
            class="w-full justify-center mt-2"
            size="lg"
            :loading="starting"
            :disabled="!canStart"
            @click="handleStart"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Mulai Scraping
          </AppButton>

          <p v-if="startError" class="text-xs text-red-500 text-center">{{ startError }}</p>
        </div>
      </div>

      <!-- Tips -->
      <div class="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p class="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1.5">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <line x1="9" y1="18" x2="15" y2="18" stroke-width="2" stroke-linecap="round"/>
            <line x1="10" y1="22" x2="14" y2="22" stroke-width="2" stroke-linecap="round"/>
            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Tips
        </p>
        <ul class="text-xs text-blue-700 space-y-1">
          <li>• Kata kunci lebih spesifik = hasil lebih relevan</li>
          <li>• Pilih kecamatan untuk area lebih sempit</li>
          <li>• Aktifkan semua cek digital untuk analisis lengkap</li>
        </ul>
      </div>
    </div>

    <!-- Task Monitor Panel -->
    <div class="lg:col-span-3 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-gray-800">Monitor Task</h2>
        <AppBadge v-if="runningCount > 0" color="blue" dot>{{ runningCount }} berjalan</AppBadge>
      </div>

      <div v-if="tasks.loading" class="text-center py-10 text-gray-400 text-sm">Memuat task...</div>
      <div v-else-if="tasks.tasks.length === 0" class="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <div class="flex justify-center mb-3">
          <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="text-gray-500 text-sm">Belum ada task. Isi form di kiri dan mulai scraping!</p>
      </div>
      <div v-else class="space-y-3">
        <TaskCard
          v-for="task in tasks.tasks"
          :key="task.id"
          :task="task"
          @cancel="tasks.cancelTask($event)"
          @delete="tasks.deleteTask($event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useRegionsStore } from '@/stores/regions'
import { useAuthStore } from '@/stores/auth'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import TaskCard from '@/components/features/scraping/TaskCard.vue'

const tasks = useTasksStore()
const regions = useRegionsStore()
const auth = useAuthStore()

const selectedProvince = ref('')
const selectedCity = ref('')
const selectedDistrict = ref('')
const keywords = ref([])
const keywordInput = ref('')
const maxResults = ref('50')
const checkWebsite = ref(true)
const checkPixel = ref(true)
const checkGoogleAds = ref(false)
const starting = ref(false)
const startError = ref('')

const runningCount = computed(() => tasks.tasks.filter(t => t.status === 'running').length)
const canStart = computed(() =>
  selectedProvince.value && selectedCity.value && keywords.value.length > 0 && !!auth.user?.id
)

onMounted(async () => {
  await regions.loadRegions()
  tasks.fetchTasks()
  tasks.subscribeRealtime()
})
onUnmounted(() => tasks.unsubscribeRealtime())

function addKeyword() {
  const kw = keywordInput.value.trim()
  if (kw && !keywords.value.includes(kw)) keywords.value.push(kw)
  keywordInput.value = ''
}

function removeKeyword(kw) {
  keywords.value = keywords.value.filter(k => k !== kw)
}

function handleProvinceChange(val) {
  regions.selectProvince(val)
  selectedCity.value = ''
  selectedDistrict.value = ''
}

function handleCityChange(val) {
  regions.selectCity(val)
  selectedDistrict.value = ''
}

async function handleStart() {
  if (!canStart.value) return
  if (!auth.user?.id) {
    startError.value = 'Sesi tidak valid. Silakan login ulang.'
    return
  }
  starting.value = true
  startError.value = ''
  try {
    await tasks.startTask({
      province: selectedProvince.value,
      city: selectedCity.value,
      district: selectedDistrict.value || null,
      keywords: keywords.value,
      max_results: parseInt(maxResults.value),
      check_website: checkWebsite.value,
      check_pixel: checkPixel.value,
      check_google_ads: checkGoogleAds.value,
      user_id: auth.user.id,
    })
    startError.value = ''
  } catch (e) {
    startError.value = e.message || 'Gagal memulai scraping.'
  } finally {
    starting.value = false
  }
}
</script>
