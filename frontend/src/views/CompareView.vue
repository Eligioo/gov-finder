<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import MunicipalityBadge from '@/components/MunicipalityBadge.vue';
import { useComparison } from '@/composables/useComparison';
import { fetchVacancies } from '@/lib/api';
import { formatSalary, formatDate, deadlineLabel } from '@/lib/formatters';
import type { Vacancy } from '@application-finder/shared/src/types.js';

const { compareIds, clearCompare } = useComparison();
const vacancies = ref<Vacancy[]>([]);
const loading = ref(true);

onMounted(async () => {
  if (compareIds.value.length === 0) {
    loading.value = false;
    return;
  }
  try {
    const result = await fetchVacancies({ ids: compareIds.value.join(','), per_page: '100' });
    vacancies.value = result.data;
  } catch {
    // silently fail
  } finally {
    loading.value = false;
  }
});

const rows = [
  { label: 'Gemeente', key: 'municipalityName' },
  { label: 'Afdeling', key: 'department' },
  { label: 'Salaris', key: 'salary', format: (v: Vacancy) => formatSalary(v.salaryMin, v.salaryMax, v.salaryRaw) || '-' },
  { label: 'Schaal', key: 'salaryScale', format: (v: Vacancy) => v.salaryScale || '-' },
  { label: 'Uren/week', key: 'hoursPerWeek', format: (v: Vacancy) => v.hoursPerWeek ? `${v.hoursPerWeek}` : '-' },
  { label: 'Opleiding', key: 'educationLevel', format: (v: Vacancy) => v.educationLevel || '-' },
  { label: 'Dienstverband', key: 'employmentType', format: (v: Vacancy) => v.employmentType || '-' },
  { label: 'Sluitingsdatum', key: 'closingDate', format: (v: Vacancy) => v.closingDate ? `${formatDate(v.closingDate)} (${deadlineLabel(v.closingDate)})` : '-' },
  { label: 'Locatie', key: 'location', format: (v: Vacancy) => v.location || '-' },
] as const;
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Vacatures vergelijken</h1>
        <div class="flex items-center gap-3">
          <button @click="clearCompare" class="text-sm text-gray-500 hover:text-gray-700">Wis selectie</button>
          <RouterLink to="/" class="text-sm text-blue-600 hover:text-blue-800">&larr; Terug</RouterLink>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="vacancies.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">Geen vacatures geselecteerd voor vergelijking</p>
        <RouterLink to="/" class="mt-2 inline-block text-blue-600 hover:text-blue-800 text-sm">
          Selecteer vacatures
        </RouterLink>
      </div>

      <div v-else class="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left p-4 text-sm font-semibold text-gray-500 w-40"></th>
              <th
                v-for="v in vacancies"
                :key="v.id"
                class="text-left p-4 min-w-[200px]"
              >
                <RouterLink
                  :to="{ name: 'detail', params: { id: v.id } }"
                  class="text-sm font-semibold text-gray-900 hover:text-blue-600"
                >
                  {{ v.title }}
                </RouterLink>
                <div class="mt-1">
                  <MunicipalityBadge :municipality-id="v.municipalityId" :name="v.municipalityName" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in rows"
              :key="row.key"
              :class="i % 2 === 0 ? 'bg-gray-50' : 'bg-white'"
            >
              <td class="p-4 text-sm font-medium text-gray-500">{{ row.label }}</td>
              <td
                v-for="v in vacancies"
                :key="v.id"
                class="p-4 text-sm text-gray-900"
              >
                {{ 'format' in row ? row.format(v) : ((v as any)[row.key] || '-') }}
              </td>
            </tr>
            <tr class="border-t border-gray-200">
              <td class="p-4"></td>
              <td v-for="v in vacancies" :key="v.id" class="p-4">
                <a
                  :href="v.sourceUrl"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                >
                  Solliciteer &rarr;
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>
