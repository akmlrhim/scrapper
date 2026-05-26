<template>
  <div class="w-full">
    <div v-if="showLabel" class="flex justify-between text-xs text-gray-500 mb-1">
      <span>{{ label }}</span>
      <span>{{ value }}%</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full overflow-hidden" :class="sizeClass">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="colorClass"
        :style="{ width: `${Math.min(value, 100)}%` }"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  value: { type: Number, default: 0 },
  label: { type: String, default: '' },
  showLabel: { type: Boolean, default: true },
  size: { type: String, default: 'md' },
  color: { type: String, default: 'blue' },
})

const sizeClass = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }[props.size] ?? 'h-2.5'
const colorClass = {
  blue: 'bg-blue-600',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
}[props.color] ?? 'bg-blue-600'
</script>
