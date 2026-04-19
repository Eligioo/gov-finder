import { useLocalStorage } from '@vueuse/core';
import { computed } from 'vue';
export function useFavorites() {
    const favoriteIds = useLocalStorage('vacancy-favorites', []);
    function toggleFavorite(id) {
        const idx = favoriteIds.value.indexOf(id);
        if (idx >= 0) {
            favoriteIds.value.splice(idx, 1);
        }
        else {
            favoriteIds.value.push(id);
        }
    }
    function isFavorite(id) {
        return favoriteIds.value.includes(id);
    }
    const count = computed(() => favoriteIds.value.length);
    return { favoriteIds, toggleFavorite, isFavorite, count };
}
//# sourceMappingURL=useFavorites.js.map