import type { Vacancy } from '@application-finder/shared/src/types.js';
export declare function useVacancies(): {
    vacancies: import("vue").Ref<{
        id: number;
        externalId: string;
        municipalityId: string;
        municipalityName?: string | undefined;
        title: string;
        department?: string | undefined;
        location?: string | undefined;
        description?: string | undefined;
        descriptionPlain?: string | undefined;
        salaryMin?: number | undefined;
        salaryMax?: number | undefined;
        salaryScale?: string | undefined;
        salaryRaw?: string | undefined;
        hoursPerWeek?: number | undefined;
        educationLevel?: string | undefined;
        employmentType?: string | undefined;
        closingDate?: string | undefined;
        publishedDate?: string | undefined;
        sourceUrl: string;
        contactName?: string | undefined;
        contactEmail?: string | undefined;
        contactPhone?: string | undefined;
        scrapedAt: string;
        updatedAt: string;
        isActive: boolean;
    }[], Vacancy[] | {
        id: number;
        externalId: string;
        municipalityId: string;
        municipalityName?: string | undefined;
        title: string;
        department?: string | undefined;
        location?: string | undefined;
        description?: string | undefined;
        descriptionPlain?: string | undefined;
        salaryMin?: number | undefined;
        salaryMax?: number | undefined;
        salaryScale?: string | undefined;
        salaryRaw?: string | undefined;
        hoursPerWeek?: number | undefined;
        educationLevel?: string | undefined;
        employmentType?: string | undefined;
        closingDate?: string | undefined;
        publishedDate?: string | undefined;
        sourceUrl: string;
        contactName?: string | undefined;
        contactEmail?: string | undefined;
        contactPhone?: string | undefined;
        scrapedAt: string;
        updatedAt: string;
        isActive: boolean;
    }[]>;
    pagination: import("vue").Ref<{
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
    }, {
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
    } | {
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
    }>;
    filters: import("vue").Ref<{
        municipalities: {
            id: string;
            name: string;
            count: number;
        }[];
        educationLevels: {
            value: string;
            count: number;
        }[];
        employmentTypes: {
            value: string;
            count: number;
        }[];
    }, {
        municipalities: {
            id: string;
            name: string;
            count: number;
        }[];
        educationLevels: {
            value: string;
            count: number;
        }[];
        employmentTypes: {
            value: string;
            count: number;
        }[];
    } | {
        municipalities: {
            id: string;
            name: string;
            count: number;
        }[];
        educationLevels: {
            value: string;
            count: number;
        }[];
        employmentTypes: {
            value: string;
            count: number;
        }[];
    }>;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    query: import("vue").ComputedRef<string>;
    municipality: import("vue").ComputedRef<string[]>;
    education: import("vue").ComputedRef<string[]>;
    employmentType: import("vue").ComputedRef<string[]>;
    sort: import("vue").ComputedRef<string>;
    order: import("vue").ComputedRef<string>;
    page: import("vue").ComputedRef<number>;
    activeFilterCount: import("vue").ComputedRef<number>;
    setFilter: (key: string, value: string | string[] | undefined) => void;
    clearFilters: () => void;
    reload: () => Promise<void>;
};
//# sourceMappingURL=useVacancies.d.ts.map