<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[baseClass, variantClass, sizeClass, 'transition-all duration-150 font-medium rounded-full inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed']"
    v-bind="$attrs"
  >
    <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
    <slot />
  </button>
</template>

<script setup>
defineOptions({ inheritAttrs: false })
const props = defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  type: { type: String, default: 'button' },
  loading: Boolean,
  disabled: Boolean,
})

const baseClass = 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'

const variantClass = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-600',
}[props.variant] ?? 'bg-blue-600 hover:bg-blue-700 text-white'

const sizeClass = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}[props.size] ?? 'px-4 py-2 text-sm'
</script>
