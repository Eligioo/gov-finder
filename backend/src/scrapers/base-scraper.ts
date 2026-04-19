import type { ScrapedVacancy } from '@application-finder/shared/src/types.js';

export interface Scraper {
  municipalityId: string;
  scrapeAll(): Promise<ScrapedVacancy[]>;
}

export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'VacatureFinder/1.0 (municipality-vacancy-aggregator)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    redirect: 'follow',
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${url}`);
  }
  return response.text();
}
