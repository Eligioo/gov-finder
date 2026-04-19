<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { MUNICIPALITY_HEX } from '@/lib/formatters';

const props = defineProps<{
  data: { id: string; name: string; count: number }[];
  total: number;
}>();

const expanded = ref(false);
const animated = ref(false);

const sorted = computed(() =>
  [...props.data].sort((a, b) => b.count - a.count)
);

const maxCount = computed(() => sorted.value[0]?.count ?? 1);

const visibleData = computed(() =>
  expanded.value ? sorted.value : sorted.value.slice(0, 5)
);

const hasMore = computed(() => sorted.value.length > 5);

onMounted(async () => {
  await nextTick();
  requestAnimationFrame(() => {
    animated.value = true;
  });
});
</script>

<template>
  <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-sm font-semibold text-brand-text">Vacatures per gemeente</h2>
      <button
        v-if="hasMore"
        @click="expanded = !expanded"
        class="text-xs font-medium text-brand-secondary hover:text-brand-primary transition-colors cursor-pointer"
      >
        {{ expanded ? 'Toon minder' : `Toon alle (${sorted.length})` }}
      </button>
    </div>

    <div class="space-y-2">
      <div
        v-for="item in visibleData"
        :key="item.id"
        class="flex items-center gap-3"
      >
        <span class="text-xs text-gray-600 w-32 truncate text-right flex-shrink-0">
          {{ item.name?.replace('Gemeente ', '') }}
        </span>
        <div class="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
          <div
            role="meter"
            :aria-valuenow="item.count"
            aria-valuemin="0"
            :aria-valuemax="maxCount"
            :aria-label="(item.name || item.id) + ': ' + item.count + ' vacatures'"
            class="h-full rounded-full transition-all duration-500 ease-out"
            :style="{
              width: animated ? ((item.count / maxCount) * 100) + '%' : '0%',
              backgroundColor: MUNICIPALITY_HEX[item.id] || '#94a3b8',
            }"
          ></div>
        </div>
        <span class="text-xs font-semibold text-gray-700 w-8 text-right flex-shrink-0">
          {{ item.count }}
        </span>
      </div>
    </div>
  </div>
</template>
