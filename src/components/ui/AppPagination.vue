<template>
  <div class="flex items-center gap-1">
    <button
      @click="$emit('change', current - 1)"
      :disabled="current <= 1"
      class="px-2 py-1 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      ‹
    </button>
    <button
      v-for="p in pages"
      :key="p"
      @click="p !== '...' && $emit('change', p)"
      :class="[
        'min-w-8 px-2 py-1 rounded text-sm',
        p === current ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100',
        p === '...' ? 'cursor-default' : 'cursor-pointer'
      ]"
    >{{ p }}</button>
    <button
      @click="$emit('change', current + 1)"
      :disabled="current >= total"
      class="px-2 py-1 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      ›
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: { type: Number, default: 1 },
  total: { type: Number, default: 1 },
})
defineEmits(['change'])

const pages = computed(() => {
  const p = []
  if (props.total <= 7) {
    for (let i = 1; i <= props.total; i++) p.push(i)
  } else {
    p.push(1)
    if (props.current > 3) p.push('...')
    const start = Math.max(2, props.current - 1)
    const end = Math.min(props.total - 1, props.current + 1)
    for (let i = start; i <= end; i++) p.push(i)
    if (props.current < props.total - 2) p.push('...')
    p.push(props.total)
  }
  return p
})
</script>
