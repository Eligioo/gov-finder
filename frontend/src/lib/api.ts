import type { Vacancy, VacancyListResponse, MunicipalityWithCount, StatsResponse, ScrapeStatus } from '@application-finder/shared/src/types.js';

const BASE = '/api';

async function get<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const url = new URL(path, window.location.origin);
  url.pathname = `${BASE}${path}`;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, value);
      }
    }
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function fetchVacancies(params: Record<string, string | undefined>): Promise<VacancyListResponse> {
  return get('/vacancies', params);
}

export function fetchVacancy(id: number): Promise<Vacancy> {
  return get(`/vacancies/${id}`);
}

export function fetchMunicipalities(): Promise<MunicipalityWithCount[]> {
  return get('/municipalities');
}

export function fetchStats(): Promise<StatsResponse> {
  return get('/stats');
}

export function triggerScrape(municipalities?: string[]): Promise<any> {
  return post('/scrape', municipalities ? { municipalities } : undefined);
}

export function fetchScrapeStatus(): Promise<ScrapeStatus[]> {
  return get('/scrape/status');
}
