<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useFavorites } from '@/composables/useFavorites';
import { useComparison } from '@/composables/useComparison';
import { triggerScrape } from '@/lib/api';

const { count: favCount } = useFavorites();
const { count: compareCount } = useComparison();

const scraping = ref(false);

async function handleScrape() {
  scraping.value = true;
  try {
    await triggerScrape();
    window.location.reload();
  } catch {
    // silently fail
  } finally {
    scraping.value = false;
  }
}
</script>

<template>
  <header class="bg-gradient-to-r from-brand-primary to-brand-secondary shadow-sm sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <RouterLink to="/" class="flex items-center gap-3">
          <div class="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span class="text-lg font-bold text-white tracking-tight">Vacature Finder</span>
        </RouterLink>

        <nav class="flex items-center gap-4">
          <RouterLink
            to="/favorites"
            class="relative text-white/80 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span class="hidden sm:inline">Favorieten</span>
            <span
              v-if="favCount > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
            >{{ favCount }}</span>
          </RouterLink>

          <RouterLink
            v-if="compareCount > 0"
            to="/compare"
            class="text-white/80 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span class="hidden sm:inline">Vergelijk ({{ compareCount }})</span>
          </RouterLink>

          <button
            @click="handleScrape"
            :disabled="scraping"
            class="text-sm text-white/60 hover:text-white flex items-center gap-1 transition-colors"
            aria-label="Vacatures vernieuwen"
            title="Vacatures vernieuwen"
          >
            <svg
              class="w-4 h-4"
              :class="{ 'animate-spin': scraping }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </header>
</template>
