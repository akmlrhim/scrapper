<template>
  <div class="flex items-center gap-1.5 flex-wrap">
    <span
      v-for="indicator in indicators"
      :key="indicator.label"
      :title="indicator.label"
      :class="[
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
        indicator.active ? indicator.activeClass : 'bg-gray-100 text-gray-400 line-through'
      ]"
    >
      <span class="w-3 h-3 flex-shrink-0" v-html="indicator.icon"></span>
      <span>{{ indicator.label }}</span>
    </span>
    <span
      :class="[
        'ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold',
        score >= 3 ? 'bg-green-100 text-green-700' : score >= 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'
      ]"
    >{{ score }}/4</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  hasWebsite: Boolean,
  hasMetaPixel: Boolean,
  hasGoogleAds: Boolean,
  hasInstagram: Boolean,
})

const score = computed(() => [props.hasWebsite, props.hasMetaPixel, props.hasGoogleAds, props.hasInstagram].filter(Boolean).length)

const SVG_GLOBE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`
const SVG_CHART = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`
const SVG_TARGET = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`
const SVG_CAMERA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`

const indicators = computed(() => [
  { label: 'Website',    icon: SVG_GLOBE,   active: props.hasWebsite,   activeClass: 'bg-blue-100 text-blue-700' },
  { label: 'Meta Pixel', icon: SVG_CHART,   active: props.hasMetaPixel, activeClass: 'bg-purple-100 text-purple-700' },
  { label: 'Google Ads', icon: SVG_TARGET,  active: props.hasGoogleAds, activeClass: 'bg-green-100 text-green-700' },
  { label: 'Instagram',  icon: SVG_CAMERA,  active: props.hasInstagram, activeClass: 'bg-pink-100 text-pink-700' },
])
</script>
