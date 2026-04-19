import * as cheerio from 'cheerio';
import type { ScrapedVacancy } from '@application-finder/shared/src/types.js';
import type { Scraper } from './base-scraper.js';
import { delay, fetchHtml } from './base-scraper.js';
import { extractSalary, extractHours, extractEducationLevel, extractEmploymentType, parseDutchDate } from '../utils/text-extract.js';

const LIST_URL = 'https://www.ofgv.nl/werken-bij/vacatures/';
const BASE_URL = 'https://www.ofgv.nl';

export class OfgvScraper implements Scraper {
  municipalityId = 'ofgv';

  async scrapeAll(): Promise<ScrapedVacancy[]> {
    console.log(`[ofgv] Fetching vacancy list: ${LIST_URL}`);

    const html = await fetchHtml(LIST_URL);
    const links = this.parseList(html);
    console.log(`[ofgv] Found ${links.length} vacancies`);

    if (links.length === 0) return [];

    const vacancies: ScrapedVacancy[] = [];
    for (const link of links) {
      try {
        await delay(500);
        const detailHtml = await fetchHtml(link.url);
        const vacancy = this.parseDetail(detailHtml, link);
        vacancies.push(vacancy);
        console.log(`[ofgv] Scraped detail: ${vacancy.title}`);
      } catch (err) {
        console.warn(`[ofgv] Could not fetch detail for "${link.title}", storing basic info`);
        vacancies.push({
          externalId: link.url,
          municipalityId: 'ofgv',
          title: link.title,
          sourceUrl: link.url,
        });
      }
    }

    return vacancies;
  }

  private parseList(html: string): { url: string; title: string }[] {
    const $ = cheerio.load(html);
    const links: { url: string; title: string }[] = [];

    // OFGV uses grid blocks: .grid-title contains <h2> with the job title,
    // and .grid-inside contains a.siteLink with the URL
    $('.grid-blok').each((_, block) => {
      const title = $(block).find('.grid-title h2').text().trim();
      const linkEl = $(block).find('a.siteLink[href*="/werken-bij/vacatures/"]');
      const href = linkEl.attr('href') || '';

      if (!title || !href) return;

      const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
      if (!links.some(l => l.url === fullUrl)) {
        links.push({ url: fullUrl, title });
      }
    });

    return links;
  }

  private parseDetail(html: string, link: { url: string; title: string }): ScrapedVacancy {
    const $ = cheerio.load(html);
    const fullText = $('body').text();

    const result: ScrapedVacancy = {
      externalId: link.url,
      municipalityId: 'ofgv',
      title: link.title,
      sourceUrl: link.url,
    };

    // Build description from content sections
    const descParts: string[] = [];
    const skipPatterns = ['cookie', 'menu', 'footer', 'navigat', 'sidebar'];

    $('h2, h3').each((_, heading) => {
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

    result.hoursPerWeek = extractHours(fullText);
    result.educationLevel = extractEducationLevel(fullText);
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
