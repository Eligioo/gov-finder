import * as cheerio from 'cheerio';
import type { ScrapedVacancy } from '@application-finder/shared/src/types.js';
import type { Scraper } from './base-scraper.js';
import { delay, fetchHtml } from './base-scraper.js';
import { extractHours, extractEducationLevel, extractEmploymentType, extractSalary } from '../utils/text-extract.js';

export class GemeentebanenScraper implements Scraper {
  constructor(
    public municipalityId: string,
    private listPageUrl: string,
  ) {}

  async scrapeAll(): Promise<ScrapedVacancy[]> {
    console.log(`[${this.municipalityId}] Fetching municipality page: ${this.listPageUrl}`);

    const html = await fetchHtml(this.listPageUrl);
    const links = this.extractGemeentebanenLinks(html);
    console.log(`[${this.municipalityId}] Found ${links.length} gemeentebanen.nl links`);

    if (links.length === 0) return [];

    const vacancies: ScrapedVacancy[] = [];
    for (const link of links) {
      try {
        await delay(500);
        const detailHtml = await fetchHtml(link);
        const vacancy = this.parseDetail(detailHtml, link);
        if (vacancy) {
          vacancies.push(vacancy);
          console.log(`[${this.municipalityId}] Scraped: ${vacancy.title}`);
        }
      } catch (err) {
        console.error(`[${this.municipalityId}] Error scraping ${link}:`, err);
      }
    }

    return vacancies;
  }

  private extractGemeentebanenLinks(html: string): string[] {
    const $ = cheerio.load(html);
    const links: string[] = [];
    const seen = new Set<string>();

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (href.includes('gemeentebanen.nl/vacatures/') && !seen.has(href)) {
        seen.add(href);
        links.push(href.startsWith('http') ? href : `https://www.gemeentebanen.nl${href}`);
      }
    });

    return links;
  }

  private parseDetail(html: string, sourceUrl: string): ScrapedVacancy | null {
    const $ = cheerio.load(html);

    // Extract JSON-LD JobPosting data
    const jsonLd = this.extractJsonLd($);

    if (!jsonLd?.title) {
      console.warn(`[${this.municipalityId}] No JobPosting JSON-LD found at ${sourceUrl}`);
      return null;
    }

    // Extract external ID from URL (e.g. /vacatures/78046/...)
    const idMatch = sourceUrl.match(/\/vacatures\/(\d+)\//);
    const externalId = idMatch ? idMatch[1] : sourceUrl;

    const fullText = $('body').text();

    // Build salary raw string from JSON-LD
    let salaryRaw: string | undefined;
    const baseSalary = jsonLd.baseSalary;
    if (baseSalary?.value) {
      const min = baseSalary.value.minValue;
      const max = baseSalary.value.maxValue;
      const currency = baseSalary.currency || 'EUR';
      if (min && max) {
        salaryRaw = `€${min}–€${max} per ${baseSalary.value.unitText || 'maand'}`;
      } else if (min) {
        salaryRaw = `€${min} per ${baseSalary.value.unitText || 'maand'}`;
      }
    }

    // Map employment type from JSON-LD
    let employmentType: string | undefined;
    if (jsonLd.employmentType) {
      const types = Array.isArray(jsonLd.employmentType) ? jsonLd.employmentType : [jsonLd.employmentType];
      if (types.some((t: string) => t === 'INTERN')) employmentType = 'stage';
      else if (types.some((t: string) => t === 'TEMPORARY')) employmentType = 'tijdelijk';
      else if (types.some((t: string) => t === 'FULL_TIME' || t === 'PART_TIME')) employmentType = extractEmploymentType(fullText) || 'vast';
    }
    if (!employmentType) employmentType = extractEmploymentType(fullText) || undefined;

    // Build description from page content
    const mainContent = $('main, [role="main"], .content, article').first();
    const description = mainContent.length ? mainContent.html() || '' : '';

    return {
      externalId,
      municipalityId: this.municipalityId,
      title: jsonLd.title,
      description: description || undefined,
      salaryRaw,
      hoursPerWeek: extractHours(fullText) || undefined,
      educationLevel: extractEducationLevel(fullText) || undefined,
      employmentType,
      closingDate: jsonLd.validThrough ? jsonLd.validThrough.split('T')[0] : undefined,
      publishedDate: jsonLd.datePosted || undefined,
      sourceUrl,
      contactEmail: fullText.match(/[\w.-]+@[\w.-]+\.\w{2,}/)?.[0],
      contactPhone: fullText.match(/(?:06[\s-]?\d{8}|14\s*0\d{2,3}|\+31[\s-]?\d[\s-]?\d{7,8}|\(0\d{2,3}\)\s*\d{6,7})/)?.[0],
    };
  }

  private extractJsonLd($: cheerio.CheerioAPI): any | null {
    let jobPosting: any = null;

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || '');
        if (data['@type'] === 'JobPosting') {
          jobPosting = data;
        } else if (Array.isArray(data)) {
          const found = data.find((d: any) => d['@type'] === 'JobPosting');
          if (found) jobPosting = found;
        }
      } catch {
        // ignore malformed JSON-LD
      }
    });

    return jobPosting;
  }
}
