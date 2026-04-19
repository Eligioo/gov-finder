import * as cheerio from 'cheerio';
import type { ScrapedVacancy } from '@application-finder/shared/src/types.js';
import type { Scraper } from './base-scraper.js';
import { extractEducationLevel } from '../utils/text-extract.js';

interface RecruiteeOffer {
  id: number;
  title: string;
  slug: string;
  careers_url: string;
  description?: string;
  requirements?: string;
  department?: string;
  city?: string;
  location?: string;
  employment_type_code?: string;
  min_hours?: number;
  max_hours?: number;
  salary?: { min?: string | number; max?: string | number; currency?: string; period?: string };
  published_at?: string;
  status?: string;
}

export class RecruiteeScraper implements Scraper {
  constructor(
    public municipalityId: string,
    private baseUrl: string,
  ) {}

  async scrapeAll(): Promise<ScrapedVacancy[]> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/api/offers/`;
    console.log(`[${this.municipalityId}] Fetching Recruitee offers: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VacatureFinder/1.0 (municipality-vacancy-aggregator)',
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching ${url}`);
    }
    const data = await response.json() as { offers?: RecruiteeOffer[] };
    const offers = (data.offers || []).filter(o => o.status === 'published');
    console.log(`[${this.municipalityId}] Found ${offers.length} published offers`);

    return offers.map(offer => this.mapOffer(offer));
  }

  private mapOffer(offer: RecruiteeOffer): ScrapedVacancy {
    const descParts: string[] = [];
    if (offer.description) descParts.push(offer.description);
    if (offer.requirements) descParts.push('<h3>Wij vragen</h3>', offer.requirements);
    const description = descParts.join('\n');

    const plainText = description ? cheerio.load(description).text() : '';

    const hoursPerWeek = offer.max_hours ?? offer.min_hours;
    const employmentType = mapEmploymentType(offer.employment_type_code);

    let salaryRaw: string | undefined;
    if (offer.salary?.min && offer.salary?.max) {
      salaryRaw = `€ ${offer.salary.min} - € ${offer.salary.max}`;
    } else if (offer.salary?.min) {
      salaryRaw = `€ ${offer.salary.min}`;
    }

    return {
      externalId: String(offer.id),
      municipalityId: this.municipalityId,
      title: offer.title,
      department: offer.department || undefined,
      location: offer.city || offer.location || undefined,
      description: description || undefined,
      salaryRaw,
      hoursPerWeek,
      educationLevel: extractEducationLevel(plainText),
      employmentType,
      publishedDate: offer.published_at?.slice(0, 10),
      sourceUrl: offer.careers_url,
    };
  }
}

function mapEmploymentType(code?: string): string | undefined {
  if (!code) return undefined;
  if (code.includes('permanent')) return 'vast';
  if (code.includes('temporary') || code.includes('contract')) return 'tijdelijk';
  if (code.includes('intern')) return 'stage';
  return undefined;
}
