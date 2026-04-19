<script setup lang="ts">
import type { StatsResponse } from '@application-finder/shared/src/types.js';
import { relativeTime, MUNICIPALITY_HEX } from '@/lib/formatters';
import { computed } from 'vue';

const props = defineProps<{
  stats: StatsResponse | null;
  loading: boolean;
}>();

const lastUpdated = computed(() => relativeTime(props.stats?.lastScrape));

const distributionSegments = computed(() => {
  if (!props.stats) return [];
  return props.stats.byMunicipality
    .filter(m => m.count > 0)
    .map(m => ({
      id: m.id,
      name: m.name,
      pct: (m.count / props.stats!.totalActive) * 100,
      color: MUNICIPALITY_HEX[m.id] || '#94a3b8',
    }));
});
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <!-- Total Vacancies -->
    <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div v-if="loading" class="space-y-3">
        <div class="w-10 h-10 rounded-lg bg-gray-200 animate-shimmer" style="background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%;"></div>
        <div class="h-8 w-16 rounded bg-gray-200 animate-shimmer" style="background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%;"></div>
        <div class="h-4 w-24 rounded bg-gray-100 animate-shimmer" style="background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%;"></div>
      </div>
      <template v-else>
        <div class="bg-blue-50 text-brand-primary rounded-lg p-2.5 w-10 h-10 flex items-center justify-center mb-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div class="text-3xl font-bold text-brand-text">{{ stats?.totalActive ?? 0 }}</div>
        <div class="text-sm text-gray-500 mt-1">Actieve Vacatures</div>
      </template>
    </div>

    <!-- Municipalities Count -->
    <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div v-if="loading" class="space-y-3">
        <div class="w-10 h-10 rounded-lg bg-gray-200 animate-shimmer" style="background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%;"></div>
        <div class="h-8 w-12 rounded bg-gray-200 animate-shimmer" style="background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%;"></div>
        <div class="h-4 w-20 rounded bg-gray-100 animate-shimmer" style="background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%;"></div>
      </div>
      <template v-else>
        <div class="bg-emerald-50 text-emerald-600 rounded-lg p-2.5 w-10 h-10 flex items-center justify-center mb-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div class="text-3xl font-bold text-brand-text">{{ stats?.byMunicipality.length ?? 0 }}</div>
        <div class="text-sm text-gray-500 mt-1">Gemeenten</div>
      </template>
    </div>

    <!-- Last Updated -->
    <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div v-if="loading" class="space-y-3">
        <div class="w-10 h-10 rounded-lg bg-gray-200 animate-shimmer" style="background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%;"></div>
        <div class="h-8 w-28 rounded bg-gray-200 animate-shimmer" style="background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%;"></div>
        <div class="h-4 w-24 rounded bg-gray-100 animate-shimmer" style="background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%;"></div>
      </div>
      <template v-else>
        <div class="bg-amber-50 text-amber-600 rounded-lg p-2.5 w-10 h-10 flex items-center justify-center mb-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="text-xl font-bold text-brand-text">{{ lastUpdated }}</div>
        <div class="text-sm text-gray-500 mt-1">Laatst bijgewerkt</div>
      </template>
    </div>

    <!-- Distribution Mini Bar -->
    <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div v-if="loading" class="space-y-3">
        <div class="w-10 h-10 rounded-lg bg-gray-200 animate-shimmer" style="background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%;"></div>
        <div class="h-8 w-full rounded bg-gray-200 animate-shimmer" style="background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%;"></div>
        <div class="h-4 w-16 rounded bg-gray-100 animate-shimmer" style="background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%;"></div>
      </div>
      <template v-else>
        <div class="bg-purple-50 text-purple-600 rounded-lg p-2.5 w-10 h-10 flex items-center justify-center mb-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div class="h-2.5 rounded-full overflow-hidden flex bg-gray-100 mb-2">
          <div
            v-for="seg in distributionSegments"
            :key="seg.id"
            class="h-full first:rounded-l-full last:rounded-r-full"
            :style="{ width: seg.pct + '%', backgroundColor: seg.color }"
            :title="seg.name + ': ' + Math.round(seg.pct) + '%'"
          ></div>
        </div>
        <div class="text-sm text-gray-500 mt-1">Verdeling</div>
      </template>
    </div>
  </div>
</template>
