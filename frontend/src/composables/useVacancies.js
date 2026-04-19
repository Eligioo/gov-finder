import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchVacancies } from '@/lib/api';
import { useDebounceFn } from '@vueuse/core';
export function useVacancies() {
    const route = useRoute();
    const router = useRouter();
    const vacancies = ref([]);
    const pagination = ref({ page: 1, perPage: 20, total: 0, totalPages: 0 });
    const filters = ref({
        municipalities: [],
        educationLevels: [],
        employmentTypes: [],
    });
    const loading = ref(false);
    const error = ref(null);
    // Read filters from URL
    const query = computed(() => route.query.q || '');
    const municipality = computed(() => (route.query.municipality || '').split(',').filter(Boolean));
    const education = computed(() => (route.query.education || '').split(',').filter(Boolean));
    const employmentType = computed(() => (route.query.employment_type || '').split(',').filter(Boolean));
    const sort = computed(() => route.query.sort || '');
    const order = computed(() => route.query.order || '');
    const page = computed(() => Number(route.query.page) || 1);
    async function load() {
        loading.value = true;
        error.value = null;
        try {
            const params = {
                q: query.value || undefined,
                municipality: municipality.value.length ? municipality.value.join(',') : undefined,
                education: education.value.length ? education.value.join(',') : undefined,
                employment_type: employmentType.value.length ? employmentType.value.join(',') : undefined,
                sort: sort.value || undefined,
                order: order.value || undefined,
                page: page.value > 1 ? String(page.value) : undefined,
            };
            const result = await fetchVacancies(params);
            vacancies.value = result.data;
            pagination.value = result.pagination;
            filters.value = result.filters;
        }
        catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to load vacancies';
        }
        finally {
            loading.value = false;
        }
    }
    function setFilter(key, value) {
        const newQuery = { ...route.query };
        if (!value || (Array.isArray(value) && value.length === 0) || value === '') {
            delete newQuery[key];
        }
        else {
            newQuery[key] = Array.isArray(value) ? value.join(',') : value;
        }
        // Reset page when changing filters
        if (key !== 'page')
            delete newQuery.page;
        router.push({ query: newQuery });
    }
    function clearFilters() {
        router.push({ query: {} });
    }
    const debouncedLoad = useDebounceFn(load, 300);
    // Watch route changes and reload
    watch(() => route.query, () => {
        if (route.name === 'home')
            debouncedLoad();
    }, { immediate: true });
    const activeFilterCount = computed(() => {
        let count = 0;
        if (query.value)
            count++;
        if (municipality.value.length)
            count++;
        if (education.value.length)
            count++;
        if (employmentType.value.length)
            count++;
        return count;
    });
    return {
        vacancies,
        pagination,
        filters,
        loading,
        error,
        query,
        municipality,
        education,
        employmentType,
        sort,
        order,
        page,
        activeFilterCount,
        setFilter,
        clearFilters,
        reload: load,
    };
}
//# sourceMappingURL=useVacancies.js.map