import * as cheerio from 'cheerio';
import type { ScrapedVacancy } from '@application-finder/shared/src/types.js';
import type { Scraper } from './base-scraper.js';
import { delay, fetchHtml } from './base-scraper.js';
import { extractSalary, extractHours, extractEducationLevel, extractEmploymentType, parseDutchDate } from '../utils/text-extract.js';

const LIST_URL = 'https://www.heerde.nl/Bestuur_en_organisatie/Organisatie/Werken_bij_Heerde/Vacatures';
const BASE_URL = 'https://www.heerde.nl';

export class HeerdeScraper implements Scraper {
  municipalityId = 'heerde';

  async scrapeAll(): Promise<ScrapedVacancy[]> {
    console.log(`[heerde] Fetching vacancy list: ${LIST_URL}`);

    const html = await fetchHtml(LIST_URL);
    const vacancyNames = this.parseList(html);
    console.log(`[heerde] Found ${vacancyNames.length} vacancies`);

    if (vacancyNames.length === 0) return [];

    const vacancies: ScrapedVacancy[] = [];
    for (const name of vacancyNames) {
      const slug = name.replace(/\s+/g, '_');
      const detailUrl = `${LIST_URL}/${slug}`;

      try {
        await delay(500);
        const detailHtml = await fetchHtml(detailUrl);
        const vacancy = this.parseDetail(detailHtml, name, detailUrl);
        vacancies.push(vacancy);
        console.log(`[heerde] Scraped detail: ${name}`);
      } catch (err) {
        // Detail page may not exist; store basic info
        console.warn(`[heerde] Could not fetch detail for "${name}", storing basic info`);
        vacancies.push({
          externalId: detailUrl,
          municipalityId: 'heerde',
          title: name,
          sourceUrl: LIST_URL,
        });
      }
    }

    return vacancies;
  }

  private parseList(html: string): string[] {
    const $ = cheerio.load(html);
    const names: string[] = [];

    // Heerde lists vacancies on their CMS page as text items (li or links)
    // between the intro text and the "Sollicitatieprocedure" heading.
    // Strategy: find all links that point to subpages of the Vacatures path,
    // excluding known non-vacancy pages.
    const skipSlugs = new Set([
      'sollicitatieprocedure', 'inhuurdesk', 'open_sollicitatie',
    ]);

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();

      // Match links to /Werken_bij_Heerde/Vacatures/SomeVacancy
      const match = href.match(/\/Werken_bij_Heerde\/Vacatures\/([^/?#]+)$/i);
      if (match) {
        const slug = match[1].toLowerCase();
        if (!skipSlugs.has(slug) && text.length > 3) {
          names.push(text);
        }
      }
    });

    // Fallback: look for <li> elements in the content area that might be vacancy names
    // These are plain-text items between the intro and "Sollicitatieprocedure"
    if (names.length === 0) {
      const body = $('body').html() || '';
      // Find content between "Bekijk onze vacature" and "Sollicitatieprocedure"
      const contentMatch = body.match(/vacature\(s\)[^<]*<\/[^>]+>([\s\S]*?)(?:<[^>]*>)*\s*Sollicitatieprocedure/i);
      if (contentMatch) {
        const section = cheerio.load(contentMatch[1]);
        section('li').each((_, el) => {
          const text = section(el).text().trim();
          if (text.length > 5 && !text.toLowerCase().includes('sollicit')) {
            names.push(text);
          }
        });
      }
    }

    return names;
  }

  private parseDetail(html: string, title: string, sourceUrl: string): ScrapedVacancy {
    const $ = cheerio.load(html);
    const fullText = $('body').text();

    const result: ScrapedVacancy = {
      externalId: sourceUrl,
      municipalityId: 'heerde',
      title,
      sourceUrl,
    };

    // Build description from heading+content pairs
    const skipPatterns = ['cookie', 'sollicit', 'readspeaker', 'analytisch', 'keuze opslaan', 'accepteer', 'navigat'];
    const descParts: string[] = [];
    $('h2, h3').each((_, heading) => {
      const headingText = $(heading).text().trim().toLowerCase();
      if (skipPatterns.some(p => headingText.includes(p))) return;

      let nextContent = '';
      let next = $(heading).next();
      while (next.length && !next.is('h2, h3')) {
        const text = next.text().trim();
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

    // Closing date
    const closingMatch = fullText.match(/(?:sluitingsdatum|reageren\s+(?:voor|v[oó]{1,2}r)|uiterlijk)[:\s]*(\d{1,2}[\s/-]\w+[\s/-]\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{4})/i);
    if (closingMatch) {
      const parsed = parseDutchDate(closingMatch[1]);
      if (parsed) result.closingDate = parsed;
    }

    // Contact info
    const emailMatch = fullText.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
    if (emailMatch) result.contactEmail = emailMatch[0];

    const phoneMatch = fullText.match(/(?:14\s*0\d{2,3}|06[\s-]?\d{8}|\+31[\s-]?\d[\s-]?\d{7,8}|\(0\d{2,3}\)\s*\d{6,7})/);
    if (phoneMatch) result.contactPhone = phoneMatch[0];

    // Contact name
    $('h2, h3, strong, b').each((_, el) => {
      const text = $(el).text().toLowerCase();
      if (text.includes('informatie') || text.includes('contact')) {
        const nextText = $(el).next().text().trim();
        const nameMatch = nextText.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
        if (nameMatch) result.contactName = nameMatch[1];
      }
    });

    return result;
  }
}
