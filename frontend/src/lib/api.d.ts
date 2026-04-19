import type { Vacancy, VacancyListResponse, MunicipalityWithCount, StatsResponse, ScrapeStatus } from '@application-finder/shared/src/types.js';
export declare function fetchVacancies(params: Record<string, string | undefined>): Promise<VacancyListResponse>;
export declare function fetchVacancy(id: number): Promise<Vacancy>;
export declare function fetchMunicipalities(): Promise<MunicipalityWithCount[]>;
export declare function fetchStats(): Promise<StatsResponse>;
export declare function triggerScrape(municipalities?: string[]): Promise<any>;
export declare function fetchScrapeStatus(): Promise<ScrapeStatus[]>;
//# sourceMappingURL=api.d.ts.map