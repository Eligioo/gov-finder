<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue';
import AppHeader from '@/components/AppHeader.vue';
import SearchInput from '@/components/SearchInput.vue';
import FilterBar from '@/components/FilterBar.vue';
import VacancyCard from '@/components/VacancyCard.vue';
import ComparisonBar from '@/components/ComparisonBar.vue';
import StatsBar from '@/components/StatsBar.vue';
import MunicipalityChart from '@/components/MunicipalityChart.vue';
import { useVacancies } from '@/composables/useVacancies';
import { fetchStats } from '@/lib/api';
import type { StatsResponse } from '@application-finder/shared/src/types.js';

const MapView = defineAsyncComponent(() => import('@/components/MapView.vue'));

const {
  vacancies, pagination, filters, loading, error,
  query, municipality, education, employmentType,
  sort, activeFilterCount, setFilter, clearFilters,
} = useVacancies();

const viewMode = ref<'list' | 'map'>('list');
const stats = ref<StatsResponse | null>(null);
const statsLoading = ref(true);

fetchStats()
  .then(s => { stats.value = s; })
  .catch(() => {})
  .finally(() => { statsLoading.value = false; });

function handleSearch(value: string) {
  setFilter('q', value || undefined);
}

function handleSort(value: string) {
  setFilter('sort', value || undefined);
}

function handleFilterSet(key: string, value: string[]) {
  setFilter(key, value.length > 0 ? value : undefined);
}

function goToPage(p: number) {
  setFilter('page', p > 1 ? String(p) : undefined);
}

const sortOptions = [
  { value: '', label: 'Nieuwste eerst' },
  { value: 'closing_date', label: 'Sluitingsdatum' },
  { value: 'salary', label: 'Salaris' },
  { value: 'title', label: 'Titel A-Z' },
];

const pageNumbers = computed(() => {
  const { page, totalPages } = pagination.value;
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});
</script>

<template>
  <div class="min-h-screen bg-brand-bg">
    <AppHeader />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Dashboard hero -->
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-brand-text mb-1">
          Gemeentelijke Vacatures
        </h1>
        <p class="text-gray-500 text-sm">
          Ontdek {{ stats?.totalActive ?? '...' }} openstaande vacatures
          bij {{ stats?.byMunicipality.length ?? '...' }} gemeenten en organisaties
        </p>
      </div>

      <!-- KPI Stats Row -->
      <StatsBar :stats="stats" :loading="statsLoading" />

      <!-- Municipality Chart -->
      <MunicipalityChart
        v-if="stats?.byMunicipality.length"
        :data="stats.byMunicipality"
        :total="stats.totalActive"
      />

      <!-- Search -->
      <div class="mb-4">
        <SearchInput :model-value="query" @update:model-value="handleSearch" />
      </div>

      <!-- View toggle + Sort -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <button
            @click="viewMode = 'list'"
            class="p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 cursor-pointer"
            :class="viewMode === 'list' ? 'bg-blue-100 text-brand-primary' : 'text-gray-400 hover:text-gray-600'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            @click="viewMode = 'map'"
            class="p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 cursor-pointer"
            :class="viewMode === 'map' ? 'bg-blue-100 text-brand-primary' : 'text-gray-400 hover:text-gray-600'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </button>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">{{ pagination.total }} resultaten</span>
          <select
            :value="sort"
            @change="handleSort(($event.target as HTMLSelectElement).value)"
            class="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
          >
            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex gap-6">
        <!-- Sidebar filters (desktop) -->
        <div class="hidden lg:block w-72 flex-shrink-0">
          <FilterBar
            :filters="filters"
            :municipality="municipality"
            :education="education"
            :employment-type="employmentType"
            :active-count="activeFilterCount"
            @set-filter="handleFilterSet"
            @clear="clearFilters"
          />
        </div>

        <!-- Main content -->
        <div class="flex-1 min-w-0">
          <!-- Mobile filters -->
          <div class="lg:hidden mb-4">
            <FilterBar
              :filters="filters"
              :municipality="municipality"
              :education="education"
              :employment-type="employmentType"
              :active-count="activeFilterCount"
              @set-filter="handleFilterSet"
              @clear="clearFilters"
            />
          </div>

          <!-- Loading skeletons -->
          <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div
              v-for="i in 6"
              :key="i"
              class="bg-white rounded-xl border border-gray-100 p-5 space-y-3"
            >
              <div class="h-5 rounded w-3/4 animate-shimmer" style="background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%;"></div>
              <div class="flex gap-2">
                <div class="h-6 rounded-full w-20 animate-shimmer" style="background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%;"></div>
                <div class="h-6 rounded-full w-14 animate-shimmer" style="background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%;"></div>
              </div>
              <div class="h-4 rounded w-full animate-shimmer" style="background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%;"></div>
              <div class="h-4 rounded w-2/3 animate-shimmer" style="background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%;"></div>
              <div class="h-4 rounded w-1/2 animate-shimmer" style="background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%;"></div>
            </div>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="text-center py-12">
            <p class="text-red-600">{{ error }}</p>
          </div>

          <!-- Map view -->
          <div v-else-if="viewMode === 'map'" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <MapView />
          </div>

          <!-- Vacancy grid -->
          <template v-else>
            <div v-if="vacancies.length === 0" class="text-center py-12">
              <p class="text-gray-500 text-lg">Geen vacatures gevonden</p>
              <button
                v-if="activeFilterCount > 0"
                @click="clearFilters"
                class="mt-2 text-brand-secondary hover:text-brand-primary text-sm cursor-pointer"
              >
                Wis alle filters
              </button>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <VacancyCard
                v-for="v in vacancies"
                :key="v.id"
                :vacancy="v"
              />
            </div>

            <!-- Pagination -->
            <div v-if="pagination.totalPages > 1" class="mt-6 flex items-center justify-center gap-1">
              <button
                @click="goToPage(pagination.page - 1)"
                :disabled="pagination.page <= 1"
                class="px-3 py-2 text-sm rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                &larr;
              </button>
              <button
                v-for="p in pageNumbers"
                :key="p"
                @click="goToPage(p)"
                class="px-3 py-2 text-sm rounded-xl border font-medium cursor-pointer"
                :class="p === pagination.page
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'"
              >
                {{ p }}
              </button>
              <button
                @click="goToPage(pagination.page + 1)"
                :disabled="pagination.page >= pagination.totalPages"
                class="px-3 py-2 text-sm rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                &rarr;
              </button>
            </div>
          </template>
        </div>
      </div>
    </main>

    <ComparisonBar />
  </div>
</template>
