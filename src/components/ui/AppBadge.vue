<template>
  <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', colorClass]">
    <span v-if="dot" class="w-1.5 h-1.5 rounded-full" :class="dotColor" />
    <slot />
  </span>
</template>

<script setup>
const props = defineProps({
  color: { type: String, default: 'gray' },
  dot: Boolean,
})

const colorMap = {
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-700',
}
const dotMap = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  gray: 'bg-gray-400',
  purple: 'bg-purple-500',
}
const colorClass = colorMap[props.color] ?? colorMap.gray
const dotColor = dotMap[props.color] ?? dotMap.gray
</script>
