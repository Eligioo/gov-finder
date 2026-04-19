<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import VacancyCard from '@/components/VacancyCard.vue';
import { useFavorites } from '@/composables/useFavorites';
import { fetchVacancies } from '@/lib/api';
import type { Vacancy } from '@application-finder/shared/src/types.js';

const { favoriteIds } = useFavorites();
const vacancies = ref<Vacancy[]>([]);
const loading = ref(true);

onMounted(async () => {
  if (favoriteIds.value.length === 0) {
    loading.value = false;
    return;
  }
  try {
    const result = await fetchVacancies({ ids: favoriteIds.value.join(','), per_page: '100' });
    vacancies.value = result.data;
  } catch {
    // silently fail
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Favorieten</h1>
        <RouterLink to="/" class="text-sm text-blue-600 hover:text-blue-800">&larr; Terug</RouterLink>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="favoriteIds.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <p class="text-gray-500 text-lg">Geen favorieten opgeslagen</p>
        <RouterLink to="/" class="mt-2 inline-block text-blue-600 hover:text-blue-800 text-sm">
          Bekijk alle vacatures
        </RouterLink>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <VacancyCard
          v-for="v in vacancies"
          :key="v.id"
          :vacancy="v"
        />
      </div>
    </main>
  </div>
</template>
