import { MUNICIPALITIES } from '@application-finder/shared/src/types.js';
import { EasyCruitScraper } from './easycruit.js';
import { ZwartewaterlandScraper } from './zwartewaterland.js';
import { GemeentebanenScraper } from './gemeentebanen.js';
import { HeerdeScraper } from './heerde.js';
import { AfasScraper } from './afas.js';
import { WerkenbijGoScraper } from './werkenbijgo.js';
import { OfgvScraper } from './ofgv.js';
import { OdDrentheScraper } from './od-drenthe.js';
import { RecruiteeScraper } from './recruitee.js';
import { DenHaagScraper } from './denhaag.js';
import { WpRestProjectScraper } from './wp-rest-project.js';
import { HtmlListScraper } from './html-list.js';
import type { Scraper } from './base-scraper.js';
import { upsertVacancy, deactivateMissing, logScrapeStart, logScrapeEnd } from '../db/repository.js';
import { extractSalary } from '../utils/text-extract.js';

function createScraper(municipalityId: string): Scraper | null {
  const m = MUNICIPALITIES.find(m => m.id === municipalityId);
  if (!m) return null;

  switch (m.sourceType) {
    case 'easycruit':
      return new EasyCruitScraper(m.id, m.sourceUrl);
    case 'rss_drupal':
      return new ZwartewaterlandScraper();
    case 'gemeentebanen':
      return new GemeentebanenScraper(m.id, m.sourceUrl);
    case 'municipal_cms':
      return new HeerdeScraper();
    case 'afas':
      return new AfasScraper(m.id, m.sourceUrl);
    case 'werkenbijgo':
      return new WerkenbijGoScraper(m.id, m.name);
    case 'ofgv_cms':
      return new OfgvScraper();
    case 'od_drenthe':
      return new OdDrentheScraper();
    case 'recruitee':
      return new RecruiteeScraper(m.id, m.sourceUrl);
    case 'denhaag_wp':
      return new DenHaagScraper();
    case 'wp_rest_project':
      return new WpRestProjectScraper(m.id, m.sourceUrl);
    case 'html_list':
      return new HtmlListScraper(m.id);
    default:
      return null;
  }
}

export interface ScrapeResult {
  municipalityId: string;
  status: 'success' | 'error';
  found: number;
  new: number;
  updated: number;
  error?: string;
}

export async function scrapeAll(municipalityIds?: string[]): Promise<ScrapeResult[]> {
  const ids = municipalityIds || MUNICIPALITIES.map(m => m.id);
  const results: ScrapeResult[] = [];

  // Run all municipalities in parallel
  const promises = ids.map(async (id) => {
    const scraper = createScraper(id);
    if (!scraper) {
      return { municipalityId: id, status: 'error' as const, found: 0, new: 0, updated: 0, error: 'Unknown municipality' };
    }

    const logId = logScrapeStart(id);

    try {
      const vacancies = await scraper.scrapeAll();
      let newCount = 0;
      let updatedCount = 0;

      for (const v of vacancies) {
        const salaryParsed = v.salaryRaw ? extractSalary(v.salaryRaw) : undefined;
        const action = upsertVacancy(v, salaryParsed);
        if (action === 'inserted') newCount++;
        else updatedCount++;
      }

      // Mark vacancies that are no longer listed as inactive
      const activeIds = vacancies.map(v => v.externalId);
      deactivateMissing(id, activeIds);

      logScrapeEnd(logId, 'success', vacancies.length, newCount, updatedCount);
      return { municipalityId: id, status: 'success' as const, found: vacancies.length, new: newCount, updated: updatedCount };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`[${id}] Scrape failed:`, errorMsg);
      logScrapeEnd(logId, 'error', 0, 0, 0, errorMsg);
      return { municipalityId: id, status: 'error' as const, found: 0, new: 0, updated: 0, error: errorMsg };
    }
  });

  return Promise.all(promises);
}
