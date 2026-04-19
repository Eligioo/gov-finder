import { XMLParser } from 'fast-xml-parser';
import * as cheerio from 'cheerio';
import type { ScrapedVacancy } from '@application-finder/shared/src/types.js';
import type { Scraper } from './base-scraper.js';
import { delay, fetchHtml } from './base-scraper.js';
import { extractSalary, extractHours, extractEducationLevel, extractEmploymentType, parseRfc822Date, parseDutchDate } from '../utils/text-extract.js';

const RSS_URL = 'https://www.zwartewaterland.nl/rss/content-list?type[]=vacancy';

export class ZwartewaterlandScraper implements Scraper {
  municipalityId = 'zwartewaterland';

  async scrapeAll(): Promise<ScrapedVacancy[]> {
    console.log(`[zwartewaterland] Fetching RSS: ${RSS_URL}`);

    const xml = await fetchHtml(RSS_URL);
    const parser = new XMLParser({ ignoreAttributes: false });
    const feed = parser.parse(xml);

    const items = feed?.rss?.channel?.item;
    if (!items) {
      console.log('[zwartewaterland] No items in RSS feed');
      return [];
    }

    const itemList = Array.isArray(items) ? items : [items];
    console.log(`[zwartewaterland] Found ${itemList.length} vacancies in RSS`);

    const vacancies: ScrapedVacancy[] = [];

    for (const item of itemList) {
      const base: ScrapedVacancy = {
        externalId: item.guid?.['#text'] || item.guid || item.link,
        municipalityId: 'zwartewaterland',
        title: item.title,
        sourceUrl: item.link,
        publishedDate: parseRfc822Date(item.pubDate),
      };

      try {
        await delay(500);
        const detailHtml = await fetchHtml(item.link);
        const enriched = this.parseDetail(detailHtml, base);
        vacancies.push(enriched);
        console.log(`[zwartewaterland] Scraped detail: ${base.title}`);
      } catch (err) {
        console.error(`[zwartewaterland] Error scraping detail for ${base.title}:`, err);
        vacancies.push(base);
      }
    }

    return vacancies;
  }

  private parseDetail(html: string, base: ScrapedVacancy): ScrapedVacancy {
    const $ = cheerio.load(html);
    const result = { ...base };

    const fullText = $('body').text();
    const mainContent = $('main, article, .content, [class*="vacancy"], [class*="Vacancy"]').first();
    const contentHtml = mainContent.length ? mainContent.html() || '' : $('body').html() || '';

    // Build description from content sections, skipping cookie/navigation noise
    const skipPatterns = ['cookie', 'sollicit', 'contact', 'informatie', 'readspeaker', 'analytisch', 'keuze opslaan', 'accepteer'];
    const descParts: string[] = [];
    $('h2, h3').each((_, heading) => {
      const headingText = $(heading).text().trim().toLowerCase();
      if (skipPatterns.some(p => headingText.includes(p))) return;

      let nextContent = '';
      let next = $(heading).next();
      while (next.length && !next.is('h2, h3')) {
        const text = next.text().trim();
        // Skip cookie/consent paragraphs
        if (!skipPatterns.some(p => text.toLowerCase().includes(p) && text.length < 200)) {
          nextContent += text + '\n';
        }
        next = next.next();
      }
      if (nextContent.trim() && nextContent.trim().length > 20) {
        descParts.push(`<h3>${$(heading).text().trim()}</h3>\n<p>${nextContent.trim()}</p>`);
      }
    });

    if (descParts.length > 0) {
      result.description = descParts.join('\n');
    } else {
      // Fallback: clean the raw HTML of cookie banners
      const cleanHtml = contentHtml.replace(/Cookie[^<]*?(?:opslaan|accepteer)[^<]*/gi, '');
      result.description = cleanHtml;
    }

    // Extract structured data
    const salary = extractSalary(fullText);
    if (salary.min || salary.scale) {
      result.salaryRaw = fullText.match(/€[^€]*?(?:schaal\s*\d+)?/i)?.[0]?.trim()?.substring(0, 200);
    }

    const hours = extractHours(fullText);
    if (hours) result.hoursPerWeek = hours;

    const education = extractEducationLevel(fullText);
    if (education) result.educationLevel = education;

    const employment = extractEmploymentType(fullText);
    if (employment) result.employmentType = employment;

    // Closing date - look for "sluitingsdatum" or "reageren voor"
    const closingMatch = fullText.match(/(?:sluitingsdatum|reageren\s+(?:voor|v[oó]{1,2}r)|uiterlijk)[:\s]*(\d{1,2}[\s/-]\w+[\s/-]\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{4})/i);
    if (closingMatch) {
      const parsed = parseDutchDate(closingMatch[1]);
      if (parsed) result.closingDate = parsed;
    }

    // Contact info
    const emailMatch = fullText.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
    if (emailMatch) result.contactEmail = emailMatch[0];

    const phoneMatch = fullText.match(/(?:14\s*0\d{2,3}|06[\s-]?\d{8}|\+31[\s-]?\d[\s-]?\d{7,8})/);
    if (phoneMatch) result.contactPhone = phoneMatch[0];

    return result;
  }
}
