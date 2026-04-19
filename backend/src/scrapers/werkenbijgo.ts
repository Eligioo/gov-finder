import * as cheerio from 'cheerio';
import type { ScrapedVacancy } from '@application-finder/shared/src/types.js';
import type { Scraper } from './base-scraper.js';
import { delay, fetchHtml } from './base-scraper.js';
import { extractSalary, extractHours, extractEducationLevel, extractEmploymentType, parseDutchDate } from '../utils/text-extract.js';

const BASE_URL = 'https://www.werkenbijgo.nl';

// Map municipality names to FacetWP search_regio filter values
const OD_FILTER_MAP: Record<string, string> = {
  'OD Veluwe': 'veluwe',
  'OD de Vallei': 'de-vallei',
  'OD Groene Metropool': 'groene-metropool',
};

export class WerkenbijGoScraper implements Scraper {
  private filterValue: string;

  constructor(
    public municipalityId: string,
    private organizationName: string,
  ) {
    this.filterValue = OD_FILTER_MAP[organizationName] || '';
  }

  async scrapeAll(): Promise<ScrapedVacancy[]> {
    console.log(`[${this.municipalityId}] Fetching werkenbijgo.nl vacancies (filter: ${this.filterValue})`);

    const vacancyLinks = await this.fetchAllPages();
    console.log(`[${this.municipalityId}] Found ${vacancyLinks.length} vacancies`);

    if (vacancyLinks.length === 0) return [];

    const vacancies: ScrapedVacancy[] = [];
    for (const link of vacancyLinks) {
      try {
        await delay(500);
        const detailHtml = await fetchHtml(link.url);
        const vacancy = this.parseDetail(detailHtml, link);
        vacancies.push(vacancy);
        console.log(`[${this.municipalityId}] Scraped detail: ${vacancy.title}`);
      } catch (err) {
        console.warn(`[${this.municipalityId}] Could not fetch detail for "${link.title}"`);
        vacancies.push({
          externalId: link.url,
          municipalityId: this.municipalityId,
          title: link.title,
          location: link.location,
          educationLevel: link.education,
          hoursPerWeek: link.hours,
          sourceUrl: link.url,
        });
      }
    }

    return vacancies;
  }

  private async fetchAllPages(): Promise<VacancyLink[]> {
    const allLinks: VacancyLink[] = [];

    // Use FacetWP URL params for filtering and pagination
    // ?_search_regio=veluwe&_paged=1
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const params = new URLSearchParams();
      if (this.filterValue) {
        params.set('_search_regio', this.filterValue);
      }
      if (page > 1) {
        params.set('_paged', String(page));
      }

      const url = `${BASE_URL}/vacatures/${params.toString() ? '?' + params.toString() : ''}`;
      const html = await fetchHtml(url);
      const links = this.parseVacancyLinks(html);

      if (links.length === 0) {
        hasMore = false;
      } else {
        allLinks.push(...links);
        page++;
        // FacetWP default is 10 per page
        if (links.length < 10) hasMore = false;
        await delay(300);
      }
    }

    return allLinks;
  }

  private parseVacancyLinks(html: string): VacancyLink[] {
    const $ = cheerio.load(html);
    const links: VacancyLink[] = [];

    // Vacancy cards use class "card-vacancy" with "a-linkable-area" links
    $('.card-vacancy, .vacancy-card-wrapper').each((_, card) => {
      const linkEl = $(card).find('a.a-linkable-area');
      const href = linkEl.attr('href') || '';
      if (!href || href === `${BASE_URL}/vacatures/`) return;

      const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
      const title = linkEl.text().trim();

      if (!title || title.length < 3) return;
      if (links.some(l => l.url === fullUrl)) return;

      // Extract metadata from card list items
      const cardItems = $(card).find('.card-list-item');
      let location: string | undefined;
      let education: string | undefined;
      let hours: number | undefined;

      cardItems.each((_, item) => {
        const icon = $(item).find('i').attr('class') || '';
        const text = $(item).find('p').text().trim();

        if (icon.includes('map-marker')) {
          location = text;
        } else if (icon.includes('graduation')) {
          education = text || undefined;
        } else if (icon.includes('hourglass')) {
          hours = extractHours(text);
        }
      });

      links.push({ url: fullUrl, title, location, education, hours });
    });

    return links;
  }

  private parseDetail(html: string, link: VacancyLink): ScrapedVacancy {
    const $ = cheerio.load(html);
    const fullText = $('body').text();

    const result: ScrapedVacancy = {
      externalId: link.url,
      municipalityId: this.municipalityId,
      title: link.title,
      location: link.location,
      educationLevel: link.education,
      hoursPerWeek: link.hours,
      sourceUrl: link.url,
    };

    // Build description from content sections
    const descParts: string[] = [];
    const skipPatterns = ['cookie', 'menu', 'footer', 'header', 'navigat', 'sidebar'];

    $('article, .entry-content, .wp-block-group, main').find('h2, h3').each((_, heading) => {
      const headingText = $(heading).text().trim().toLowerCase();
      if (skipPatterns.some(p => headingText.includes(p))) return;

      let nextContent = '';
      let next = $(heading).next();
      while (next.length && !next.is('h2, h3')) {
        const text = next.text().trim();
        if (text.length > 10) nextContent += text + '\n';
        next = next.next();
      }
      if (nextContent.trim().length > 20) {
        descParts.push(`<h3>${$(heading).text().trim()}</h3>\n<p>${nextContent.trim()}</p>`);
      }
    });

    if (descParts.length > 0) {
      result.description = descParts.join('\n');
    }

    // Extract structured data
    const salary = extractSalary(fullText);
    if (salary.min || salary.scale) {
      result.salaryRaw = fullText.match(/€[^.]*?(?:schaal\s*\d+[^.]*)?/i)?.[0]?.trim() || salary.raw.substring(0, 200);
    }

    if (!result.hoursPerWeek) {
      result.hoursPerWeek = extractHours(fullText);
    }

    if (!result.educationLevel) {
      result.educationLevel = extractEducationLevel(fullText);
    }

    result.employmentType = extractEmploymentType(fullText);

    // Closing date
    const closingMatch = fullText.match(/(?:sluitingsdatum|reageren\s+(?:voor|v[oó]{1,2}r)|solliciteren\s+(?:voor|tot)|uiterlijk)[:\s]*(\d{1,2}[\s/-]\w+[\s/-]\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{4})/i);
    if (closingMatch) {
      const parsed = parseDutchDate(closingMatch[1]);
      if (parsed) result.closingDate = parsed;
    }

    // Contact info
    const emailMatch = fullText.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
    if (emailMatch) result.contactEmail = emailMatch[0];

    const phoneMatch = fullText.match(/(?:06[\s-]?\d{8}|14\s*0\d{2,3}|\+31[\s-]?\d[\s-]?\d{7,8}|\(0\d{2,3}\)\s*\d{6,7})/);
    if (phoneMatch) result.contactPhone = phoneMatch[0];

    // Contact name
    $('h2, h3, strong, b').each((_, el) => {
      const text = $(el).text().toLowerCase();
      if (text.includes('informatie') || text.includes('contact')) {
        const nextText = $(el).next().text().trim();
        const nameMatch = nextText.match(/^([A-Z][a-z]+(?:\s+(?:van\s+(?:de\s+)?|de\s+)?[A-Z][a-z]+)+)/);
        if (nameMatch) result.contactName = nameMatch[1];
      }
    });

    return result;
  }
}

interface VacancyLink {
  url: string;
  title: string;
  location?: string;
  education?: string;
  hours?: number;
}
