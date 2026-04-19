import { useLocalStorage } from '@vueuse/core';
import { computed } from 'vue';
const MAX_COMPARE = 4;
export function useComparison() {
    const compareIds = useLocalStorage('vacancy-compare', []);
    function toggleCompare(id) {
        const idx = compareIds.value.indexOf(id);
        if (idx >= 0) {
            compareIds.value.splice(idx, 1);
        }
        else if (compareIds.value.length < MAX_COMPARE) {
            compareIds.value.push(id);
        }
    }
    function isComparing(id) {
        return compareIds.value.includes(id);
    }
    function clearCompare() {
        compareIds.value = [];
    }
    const count = computed(() => compareIds.value.length);
    const canAdd = computed(() => compareIds.value.length < MAX_COMPARE);
    return { compareIds, toggleCompare, isComparing, clearCompare, count, canAdd };
}
//# sourceMappingURL=useComparison.js.map