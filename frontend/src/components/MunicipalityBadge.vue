<script setup lang="ts">
import { MUNICIPALITY_HEX } from '@/lib/formatters';

const props = defineProps<{
  municipalityId: string;
  name?: string;
}>();

const dotColor = MUNICIPALITY_HEX[props.municipalityId] || '#94a3b8';
</script>

<template>
  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
    <span
      class="w-2 h-2 rounded-full flex-shrink-0"
      :style="{ backgroundColor: dotColor }"
    ></span>
    {{ name || municipalityId }}
  </span>
</template>
