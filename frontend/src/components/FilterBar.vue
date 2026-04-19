<script setup lang="ts">
import { ref, computed } from 'vue';
import type { VacancyListResponse } from '@application-finder/shared/src/types.js';

const REGIONS: { id: string; label: string; municipalityIds: string[] }[] = [
  {
    id: 'zwolle',
    label: 'Regio Zwolle',
    municipalityIds: [
      'zwolle', 'kampen', 'zwartewaterland', 'dronten', 'noordoostpolder',
      'dalfsen', 'oldebroek', 'hattem', 'heerde',
      'od-ijsselland', 'od-twente', 'od-veluwe', 'od-de-vallei',
      'od-groene-metropool', 'ofgv', 'od-drenthe',
    ],
  },
  {
    id: 'pijnacker-nootdorp',
    label: 'Regio Pijnacker-Nootdorp',
    municipalityIds: [
      'pijnacker-nootdorp', 'lansingerland', 'delft', 'westland',
      'den-haag', 'zoetermeer', 'rijswijk', 'leidschendam-voorburg',
      'dcmr', 'od-haaglanden', 'od-west-holland',
    ],
  },
];

const props = defineProps<{
  filters: VacancyListResponse['filters'];
  municipality: string[];
  education: string[];
  employmentType: string[];
  activeCount: number;
}>();

const emit = defineEmits<{
  setFilter: [key: string, value: string[]];
  clear: [];
}>();

const sections = ref({
  region: true,
  municipality: true,
  education: true,
  employmentType: true,
});

function regionState(regionId: string): 'all' | 'some' | 'none' {
  const region = REGIONS.find(r => r.id === regionId);
  if (!region) return 'none';
  const selected = new Set(props.municipality);
  const hits = region.municipalityIds.filter(id => selected.has(id)).length;
  if (hits === 0) return 'none';
  if (hits === region.municipalityIds.length) return 'all';
  return 'some';
}

function toggleRegion(regionId: string) {
  const region = REGIONS.find(r => r.id === regionId);
  if (!region) return;
  const state = regionState(regionId);
  const current = new Set(props.municipality);
  if (state === 'all') {
    for (const id of region.municipalityIds) current.delete(id);
  } else {
    for (const id of region.municipalityIds) current.add(id);
  }
  emit('setFilter', 'municipality', [...current]);
}

const regionStates = computed(() => ({
  zwolle: regionState('zwolle'),
  'pijnacker-nootdorp': regionState('pijnacker-nootdorp'),
}));

function toggleMunicipality(id: string) {
  const current = [...props.municipality];
  const idx = current.indexOf(id);
  if (idx >= 0) current.splice(idx, 1);
  else current.push(id);
  emit('setFilter', 'municipality', current);
}

function toggleEducation(val: string) {
  const current = [...props.education];
  const idx = current.indexOf(val);
  if (idx >= 0) current.splice(idx, 1);
  else current.push(val);
  emit('setFilter', 'education', current);
}

function toggleEmploymentType(val: string) {
  const current = [...props.employmentType];
  const idx = current.indexOf(val);
  if (idx >= 0) current.splice(idx, 1);
  else current.push(val);
  emit('setFilter', 'employment_type', current);
}

const municipalityColors: Record<string, string> = {
  zwolle: 'border-municipality-zwolle text-municipality-zwolle bg-blue-50',
  kampen: 'border-municipality-kampen text-municipality-kampen bg-green-50',
  zwartewaterland: 'border-municipality-zwartewaterland text-municipality-zwartewaterland bg-red-50',
  dronten: 'border-municipality-dronten text-municipality-dronten bg-purple-50',
  noordoostpolder: 'border-municipality-noordoostpolder text-municipality-noordoostpolder bg-cyan-50',
  'pijnacker-nootdorp': 'border-municipality-pijnacker-nootdorp text-municipality-pijnacker-nootdorp bg-rose-50',
  lansingerland: 'border-municipality-lansingerland text-municipality-lansingerland bg-green-50',
  delft: 'border-municipality-delft text-municipality-delft bg-blue-50',
  westland: 'border-municipality-westland text-municipality-westland bg-orange-50',
  'den-haag': 'border-municipality-den-haag text-municipality-den-haag bg-fuchsia-50',
  zoetermeer: 'border-municipality-zoetermeer text-municipality-zoetermeer bg-teal-50',
  rijswijk: 'border-municipality-rijswijk text-municipality-rijswijk bg-yellow-50',
  'leidschendam-voorburg': 'border-municipality-leidschendam-voorburg text-municipality-leidschendam-voorburg bg-pink-50',
  dcmr: 'border-municipality-dcmr text-municipality-dcmr bg-slate-50',
  'od-haaglanden': 'border-municipality-od-haaglanden text-municipality-od-haaglanden bg-lime-50',
  'od-west-holland': 'border-municipality-od-west-holland text-municipality-od-west-holland bg-purple-50',
};
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
    <!-- Header -->
    <div class="px-4 py-3 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-brand-text">Filters</h3>
    </div>

    <!-- Regions -->
    <div class="px-4 py-4">
      <button
        @click="sections.region = !sections.region"
        :aria-expanded="sections.region"
        class="flex items-center justify-between w-full text-left cursor-pointer"
      >
        <span class="text-xs font-semibold text-gray-700 uppercase tracking-wider">Regio</span>
        <svg
          class="w-4 h-4 text-gray-400 transition-transform duration-200"
          :class="{ 'rotate-180': sections.region }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-show="sections.region" class="mt-3 flex flex-col gap-2">
        <button
          v-for="r in REGIONS"
          :key="r.id"
          @click="toggleRegion(r.id)"
          :aria-pressed="regionStates[r.id as 'zwolle' | 'pijnacker-nootdorp'] === 'all'"
          class="text-xs px-3 py-2 rounded-lg border font-medium transition-colors cursor-pointer text-left"
          :class="{
            'border-brand-secondary text-brand-primary bg-blue-50 shadow-sm': regionStates[r.id as 'zwolle' | 'pijnacker-nootdorp'] === 'all',
            'border-brand-secondary/50 text-brand-primary bg-blue-50/40': regionStates[r.id as 'zwolle' | 'pijnacker-nootdorp'] === 'some',
            'border-gray-200 text-gray-600 hover:border-gray-300': regionStates[r.id as 'zwolle' | 'pijnacker-nootdorp'] === 'none',
          }"
        >
          {{ r.label }}
          <span class="text-[10px] text-gray-500">({{ r.municipalityIds.length }} gemeenten)</span>
        </button>
      </div>
    </div>

    <!-- Municipalities -->
    <div class="px-4 py-4">
      <button
        @click="sections.municipality = !sections.municipality"
        :aria-expanded="sections.municipality"
        class="flex items-center justify-between w-full text-left cursor-pointer"
      >
        <span class="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
          Gemeente
          <span
            v-if="municipality.length > 0"
            class="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-brand-secondary text-white rounded-full"
          >{{ municipality.length }}</span>
        </span>
        <svg
          class="w-4 h-4 text-gray-400 transition-transform duration-200"
          :class="{ 'rotate-180': sections.municipality }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        v-show="sections.municipality"
        class="mt-3 flex flex-wrap gap-2 overflow-hidden"
      >
        <button
          v-for="m in filters.municipalities"
          :key="m.id"
          @click="toggleMunicipality(m.id)"
          :aria-pressed="municipality.includes(m.id)"
          class="text-xs px-2.5 py-1 rounded-full border font-medium transition-colors cursor-pointer"
          :class="municipality.includes(m.id)
            ? municipalityColors[m.id] || 'border-brand-secondary text-brand-primary bg-blue-50'
            : 'border-gray-200 text-gray-600 hover:border-gray-300'"
        >
          {{ m.name?.replace('Gemeente ', '') }} ({{ m.count }})
        </button>
      </div>
    </div>

    <!-- Education Level -->
    <div v-if="filters.educationLevels.length > 0" class="px-4 py-4">
      <button
        @click="sections.education = !sections.education"
        :aria-expanded="sections.education"
        class="flex items-center justify-between w-full text-left cursor-pointer"
      >
        <span class="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
          Opleidingsniveau
          <span
            v-if="education.length > 0"
            class="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-brand-secondary text-white rounded-full"
          >{{ education.length }}</span>
        </span>
        <svg
          class="w-4 h-4 text-gray-400 transition-transform duration-200"
          :class="{ 'rotate-180': sections.education }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        v-show="sections.education"
        class="mt-3 flex flex-wrap gap-2 overflow-hidden"
      >
        <button
          v-for="e in filters.educationLevels"
          :key="e.value"
          @click="toggleEducation(e.value)"
          :aria-pressed="education.includes(e.value)"
          class="text-xs px-2.5 py-1 rounded-full border font-medium transition-colors cursor-pointer"
          :class="education.includes(e.value)
            ? 'border-brand-secondary text-brand-primary bg-blue-50 shadow-sm'
            : 'border-gray-200 text-gray-600 hover:border-gray-300'"
        >
          {{ e.value }} ({{ e.count }})
        </button>
      </div>
    </div>

    <!-- Employment Type -->
    <div v-if="filters.employmentTypes.length > 0" class="px-4 py-4">
      <button
        @click="sections.employmentType = !sections.employmentType"
        :aria-expanded="sections.employmentType"
        class="flex items-center justify-between w-full text-left cursor-pointer"
      >
        <span class="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
          Dienstverband
          <span
            v-if="employmentType.length > 0"
            class="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-brand-secondary text-white rounded-full"
          >{{ employmentType.length }}</span>
        </span>
        <svg
          class="w-4 h-4 text-gray-400 transition-transform duration-200"
          :class="{ 'rotate-180': sections.employmentType }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        v-show="sections.employmentType"
        class="mt-3 flex flex-wrap gap-2 overflow-hidden"
      >
        <button
          v-for="t in filters.employmentTypes"
          :key="t.value"
          @click="toggleEmploymentType(t.value)"
          :aria-pressed="employmentType.includes(t.value)"
          class="text-xs px-2.5 py-1 rounded-full border font-medium transition-colors capitalize cursor-pointer"
          :class="employmentType.includes(t.value)
            ? 'border-brand-secondary text-brand-primary bg-blue-50 shadow-sm'
            : 'border-gray-200 text-gray-600 hover:border-gray-300'"
        >
          {{ t.value }} ({{ t.count }})
        </button>
      </div>
    </div>

    <!-- Clear Filters -->
    <button
      v-if="activeCount > 0"
      @click="emit('clear')"
      class="w-full py-2.5 px-4 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
    >
      Wis alle filters ({{ activeCount }})
    </button>
  </div>
</template>
