<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import MunicipalityBadge from '@/components/MunicipalityBadge.vue';
import { fetchVacancy } from '@/lib/api';
import { formatSalary, formatDate, deadlineStatus, deadlineLabel } from '@/lib/formatters';
import { useFavorites } from '@/composables/useFavorites';
import type { Vacancy } from '@application-finder/shared/src/types.js';

const route = useRoute();
const vacancy = ref<Vacancy | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const { toggleFavorite, isFavorite } = useFavorites();
const fav = computed(() => vacancy.value ? isFavorite(vacancy.value.id) : false);
const status = computed(() => deadlineStatus(vacancy.value?.closingDate));
const badge = computed(() => deadlineLabel(vacancy.value?.closingDate));

const statusColors: Record<string, string> = {
  expired: 'text-gray-500 bg-gray-100',
  urgent: 'text-red-700 bg-red-50 border border-red-200',
  soon: 'text-orange-700 bg-orange-50 border border-orange-200',
  open: 'text-green-700 bg-green-50 border border-green-200',
};

onMounted(async () => {
  try {
    const id = Number(route.params.id);
    vacancy.value = await fetchVacancy(id);
  } catch (e) {
    error.value = 'Vacature niet gevonden';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <RouterLink to="/" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Terug naar overzicht
      </RouterLink>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600 text-lg">{{ error }}</p>
      </div>

      <template v-else-if="vacancy">
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <!-- Header -->
          <div class="p-6 sm:p-8 border-b border-gray-100">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <MunicipalityBadge :municipality-id="vacancy.municipalityId" :name="vacancy.municipalityName" />
                  <span v-if="badge && status" class="text-xs px-2 py-0.5 rounded-full font-medium" :class="statusColors[status]">
                    {{ badge }}
                  </span>
                </div>
                <h1 class="text-2xl font-bold text-gray-900">{{ vacancy.title }}</h1>
                <p v-if="vacancy.department" class="text-gray-600 mt-1">{{ vacancy.department }}</p>
              </div>
              <button
                @click="toggleFavorite(vacancy!.id)"
                class="p-2 rounded-lg hover:bg-gray-100"
              >
                <svg class="w-6 h-6" :class="fav ? 'text-red-500 fill-current' : 'text-gray-300'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div class="flex flex-col lg:flex-row">
            <!-- Main content -->
            <div class="flex-1 p-6 sm:p-8">
              <div
                v-if="vacancy.description"
                class="prose prose-gray max-w-none"
                v-html="vacancy.description"
              ></div>
              <p v-else class="text-gray-500 italic">Geen omschrijving beschikbaar.</p>
            </div>

            <!-- Sidebar -->
            <div class="lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-100 p-6 sm:p-8 space-y-6 bg-gray-50">
              <!-- Key facts -->
              <div class="space-y-4">
                <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">Details</h3>

                <div v-if="vacancy.salaryMin || vacancy.salaryRaw" class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ formatSalary(vacancy.salaryMin, vacancy.salaryMax, vacancy.salaryRaw) }}</div>
                    <div v-if="vacancy.salaryScale" class="text-xs text-gray-500">Schaal {{ vacancy.salaryScale }}</div>
                  </div>
                </div>

                <div v-if="vacancy.hoursPerWeek" class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="text-sm font-medium text-gray-900">{{ vacancy.hoursPerWeek }} uur per week</div>
                </div>

                <div v-if="vacancy.educationLevel" class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  <div class="text-sm font-medium text-gray-900">{{ vacancy.educationLevel }}</div>
                </div>

                <div v-if="vacancy.employmentType" class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div class="text-sm font-medium text-gray-900 capitalize">{{ vacancy.employmentType }}</div>
                </div>

                <div v-if="vacancy.closingDate" class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ formatDate(vacancy.closingDate) }}</div>
                    <div class="text-xs text-gray-500">Sluitingsdatum</div>
                  </div>
                </div>

                <div v-if="vacancy.location" class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div class="text-sm font-medium text-gray-900">{{ vacancy.location }}</div>
                </div>
              </div>

              <!-- Contact -->
              <div v-if="vacancy.contactName || vacancy.contactEmail || vacancy.contactPhone" class="border-t border-gray-200 pt-6">
                <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Contact</h3>
                <div class="space-y-2 text-sm">
                  <div v-if="vacancy.contactName" class="text-gray-900 font-medium">{{ vacancy.contactName }}</div>
                  <a v-if="vacancy.contactEmail" :href="`mailto:${vacancy.contactEmail}`" class="block text-blue-600 hover:text-blue-800">
                    {{ vacancy.contactEmail }}
                  </a>
                  <a v-if="vacancy.contactPhone" :href="`tel:${vacancy.contactPhone}`" class="block text-blue-600 hover:text-blue-800">
                    {{ vacancy.contactPhone }}
                  </a>
                </div>
              </div>

              <!-- Apply button -->
              <a
                :href="vacancy.sourceUrl"
                target="_blank"
                rel="noopener"
                class="block w-full text-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Solliciteer op originele site &rarr;
              </a>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>
