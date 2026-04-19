<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const input = ref(props.modelValue);

watch(() => props.modelValue, (v) => { input.value = v; });

function handleInput(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  input.value = value;
  emit('update:modelValue', value);
}

function clear() {
  input.value = '';
  emit('update:modelValue', '');
}
</script>

<template>
  <div class="relative group">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg class="h-5 w-5 text-gray-300 group-focus-within:text-brand-secondary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input
      type="text"
      :value="input"
      @input="handleInput"
      placeholder="Zoek vacatures..."
      aria-label="Zoek vacatures"
      class="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-white shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent text-sm"
    />
    <button
      v-if="input"
      @click="clear"
      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full cursor-pointer"
    >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
