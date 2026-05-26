<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="id" class="text-sm font-medium text-gray-700">{{ label }}</label>
    <select
      :id="id"
      v-bind="$attrs"
      :value="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.value)"
      :class="[
        'w-full rounded-lg border border-gray-300 bg-white text-gray-900 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'disabled:bg-gray-100 disabled:cursor-not-allowed',
        'px-3 py-2 pr-8',
        !modelValue ? 'text-gray-400' : 'text-gray-900'
      ]"
    >
      <option value="" disabled>{{ placeholder || 'Pilih...' }}</option>
      <option v-for="opt in options" :key="optValue(opt)" :value="optValue(opt)">
        {{ optLabel(opt) }}
      </option>
    </select>
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false })
const props = defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  label: String,
  placeholder: String,
  id: String,
  error: String,
  disabled: Boolean,
  valueKey: String,
  labelKey: String,
})
defineEmits(['update:modelValue'])

function optValue(opt) {
  return props.valueKey ? opt[props.valueKey] : opt
}
function optLabel(opt) {
  return props.labelKey ? opt[props.labelKey] : opt
}
</script>
