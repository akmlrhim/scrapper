<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="id" class="text-sm font-medium text-gray-700">{{ label }}</label>
    <div class="relative">
      <div v-if="$slots.prefix" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        <slot name="prefix" />
      </div>
      <input
        :id="id"
        v-bind="$attrs"
        :value="modelValue"
        :placeholder="placeholder"
        :type="type"
        :disabled="disabled"
        @input="$emit('update:modelValue', $event.target.value)"
        :class="[
          'w-full rounded-lg border border-gray-300 bg-white text-gray-900 text-sm placeholder-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          $slots.prefix ? 'pl-9' : 'pl-3',
          'pr-3 py-2'
        ]"
      />
    </div>
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
    <p v-if="hint && !error" class="text-xs text-gray-400">{{ hint }}</p>
  </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false })
const props = defineProps({
  modelValue: { type: String, default: '' },
  label: String,
  placeholder: String,
  type: { type: String, default: 'text' },
  id: String,
  error: String,
  hint: String,
  disabled: Boolean,
})
defineEmits(['update:modelValue'])
</script>
