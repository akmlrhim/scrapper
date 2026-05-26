import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { getProvinces, getRegencies, getDistricts } from 'idn-area-data'

// Vite plugin: load idn-area-data at build/dev time, expose as virtual module
// Runs in Node.js (no browser fs/path issues), bundled as static JSON in output
function idnAreasPlugin() {
  const VIRTUAL_ID = 'virtual:idn-areas'
  const RESOLVED_ID = '\0' + VIRTUAL_ID
  let cached = null

  return {
    name: 'idn-areas',
    async buildStart() {
      if (cached) return
      const [provinces, regencies, districts] = await Promise.all([
        getProvinces(),
        getRegencies(),
        getDistricts(),
      ])
      cached = { provinces, regencies, districts }
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id) {
      if (id === RESOLVED_ID && cached) {
        return `export default ${JSON.stringify(cached)}`
      }
    },
  }
}

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    idnAreasPlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
