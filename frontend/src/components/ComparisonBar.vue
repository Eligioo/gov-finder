<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useComparison } from '@/composables/useComparison';

const { count, clearCompare } = useComparison();
</script>

<template>
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    leave-active-class="transition-transform duration-200 ease-in"
    enter-from-class="translate-y-full"
    leave-to-class="translate-y-full"
  >
    <div v-if="count > 0" role="status" aria-live="polite" class="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <span class="text-sm text-gray-700">
          <strong class="text-brand-primary">{{ count }}</strong> vacature{{ count > 1 ? 's' : '' }} geselecteerd voor vergelijking
        </span>
        <div class="flex items-center gap-3">
          <button @click="clearCompare" class="text-sm text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
            Wissen
          </button>
          <RouterLink
            to="/compare"
            class="inline-flex items-center px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-xl hover:bg-brand-primary/90 shadow-sm transition-colors"
          >
            Vergelijken
          </RouterLink>
        </div>
      </div>
    </div>
  </Transition>
</template>
