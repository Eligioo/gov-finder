import * as cheerio from 'cheerio';
import type { ScrapedVacancy } from '@application-finder/shared/src/types.js';
import type { Scraper } from './base-scraper.js';
import {
  extractSalary,
  extractHours,
  extractEducationLevel,
  extractEmploymentType,
  parseDutchDate,
} from '../utils/text-extract.js';

interface WpRestItem {
  id: number;
  date?: string;
  link: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  excerpt?: { rendered?: string };
}

export class WpRestProjectScraper implements Scraper {
  constructor(
    public municipalityId: string,
    private baseUrl: string,
    private postTypeRestBase: string = 'project',
  ) {}

  async scrapeAll(): Promise<ScrapedVacancy[]> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/wp-json/wp/v2/${this.postTypeRestBase}?per_page=100`;
    console.log(`[${this.municipalityId}] Fetching WP REST: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VacatureFinder/1.0 (municipality-vacancy-aggregator)',
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching ${url}`);
    }
    const items = await response.json() as WpRestItem[];
    console.log(`[${this.municipalityId}] Found ${items.length} items`);

    return items.map(item => this.mapItem(item));
  }

  private mapItem(item: WpRestItem): ScrapedVacancy {
    const title = decodeHtml(item.title?.rendered || '(Untitled)');
    const description = item.content?.rendered || '';
    const plainText = description ? cheerio.load(description).text() : '';

    const result: ScrapedVacancy = {
      externalId: String(item.id),
      municipalityId: this.municipalityId,
      title,
      description: description || undefined,
      publishedDate: item.date?.slice(0, 10),
      sourceUrl: item.link,
    };

    const salary = extractSalary(plainText);
    if (salary.min || salary.scale) {
      result.salaryRaw = plainText.match(/€[^€.]*?(?:schaal\s*\d+)?/i)?.[0]?.trim()?.substring(0, 200);
    }
    const hours = extractHours(plainText);
    if (hours) result.hoursPerWeek = hours;

    const edu = extractEducationLevel(plainText);
    if (edu) result.educationLevel = edu;

    const emp = extractEmploymentType(plainText);
    if (emp) result.employmentType = emp;

    const closingMatch = plainText.match(/(?:sluitingsdatum|reageren\s+(?:voor|v[oó]{1,2}r)|uiterlijk|solliciteer\s+voor)[:\s]*(\d{1,2}[\s/-]\w+[\s/-]\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{4})/i);
    if (closingMatch) {
      const parsed = parseDutchDate(closingMatch[1]);
      if (parsed) result.closingDate = parsed;
    }

    const emailMatch = plainText.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
    if (emailMatch) result.contactEmail = emailMatch[0];

    const phoneMatch = plainText.match(/(?:14\s*0\d{2,3}|06[\s-]?\d{8}|\+31[\s-]?\d[\s-]?\d{7,8})/);
    if (phoneMatch) result.contactPhone = phoneMatch[0];

    return result;
  }
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}
