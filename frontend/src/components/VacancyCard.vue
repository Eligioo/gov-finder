<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import type { Vacancy } from '@application-finder/shared/src/types.js';
import MunicipalityBadge from './MunicipalityBadge.vue';
import { formatSalary, formatDate, deadlineStatus, deadlineLabel, MUNICIPALITY_HEX } from '@/lib/formatters';
import { useFavorites } from '@/composables/useFavorites';
import { useComparison } from '@/composables/useComparison';

const props = defineProps<{
  vacancy: Vacancy;
}>();

const { toggleFavorite, isFavorite } = useFavorites();
const { toggleCompare, isComparing, canAdd } = useComparison();

const fav = computed(() => isFavorite(props.vacancy.id));
const comparing = computed(() => isComparing(props.vacancy.id));
const status = computed(() => deadlineStatus(props.vacancy.closingDate));
const deadlineBadge = computed(() => deadlineLabel(props.vacancy.closingDate));
const borderColor = computed(() => MUNICIPALITY_HEX[props.vacancy.municipalityId] || '#94a3b8');

const statusColors = {
  expired: 'text-gray-400 bg-gray-100',
  urgent: 'text-red-700 bg-red-50',
  soon: 'text-orange-700 bg-orange-50',
  open: 'text-green-700 bg-green-50',
};
</script>

<template>
  <div
    class="group bg-white rounded-xl border border-gray-100 border-l-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out flex flex-col overflow-hidden"
    :style="{ borderLeftColor: borderColor }"
  >
    <div class="p-5 pb-4 flex-1">
      <div class="flex items-start justify-between gap-2 mb-3">
        <RouterLink
          :to="{ name: 'detail', params: { id: vacancy.id } }"
          class="text-base font-semibold text-gray-900 group-hover:text-brand-secondary line-clamp-2 leading-snug transition-colors"
        >
          {{ vacancy.title }}
        </RouterLink>
        <button
          @click.stop="toggleFavorite(vacancy.id)"
          :aria-pressed="fav"
          class="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-300 cursor-pointer"
          :title="fav ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'"
        >
          <svg class="w-5 h-5" :class="fav ? 'text-red-500 fill-current' : 'text-gray-300'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div class="flex items-center gap-2 mb-3">
        <MunicipalityBadge
          :municipality-id="vacancy.municipalityId"
          :name="vacancy.municipalityName"
        />
        <span v-if="deadlineBadge && status" class="text-xs px-2 py-0.5 rounded-full font-medium" :class="statusColors[status]">
          {{ deadlineBadge }}
        </span>
      </div>

      <div class="space-y-1.5 text-sm text-gray-600">
        <div v-if="vacancy.department" class="flex items-center gap-1.5">
          <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {{ vacancy.department }}
        </div>
        <div v-if="vacancy.salaryMin || vacancy.salaryRaw" class="flex items-center gap-1.5">
          <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ formatSalary(vacancy.salaryMin, vacancy.salaryMax, vacancy.salaryRaw) }}
          <span v-if="vacancy.salaryScale" class="text-gray-400">(schaal {{ vacancy.salaryScale }})</span>
        </div>
        <div class="flex items-center gap-3">
          <span v-if="vacancy.hoursPerWeek" class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ vacancy.hoursPerWeek }} uur/week
          </span>
          <span v-if="vacancy.educationLevel" class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            {{ vacancy.educationLevel }}
          </span>
        </div>
        <div v-if="vacancy.closingDate" class="flex items-center gap-1.5 text-gray-500">
          <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Sluit: {{ formatDate(vacancy.closingDate) }}
        </div>
      </div>
    </div>

    <div class="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
      <button
        @click="toggleCompare(vacancy.id)"
        :disabled="!comparing && !canAdd"
        class="text-xs font-medium flex items-center gap-1 px-2 py-1 rounded cursor-pointer"
        :class="comparing ? 'text-brand-primary bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {{ comparing ? 'Vergelijken' : 'Vergelijk' }}
      </button>
      <RouterLink
        :to="{ name: 'detail', params: { id: vacancy.id } }"
        class="text-xs font-semibold text-brand-secondary hover:text-brand-primary transition-colors"
      >
        Bekijk &rarr;
      </RouterLink>
    </div>
  </div>
</template>
