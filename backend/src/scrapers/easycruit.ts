import * as cheerio from 'cheerio';
import type { ScrapedVacancy } from '@application-finder/shared/src/types.js';
import type { Scraper } from './base-scraper.js';
import { delay, fetchHtml } from './base-scraper.js';
import { extractSalary, extractHours, extractEducationLevel, extractEmploymentType, parseDutchDate } from '../utils/text-extract.js';

export class EasyCruitScraper implements Scraper {
  constructor(
    public municipalityId: string,
    private baseUrl: string,
  ) {}

  async scrapeAll(): Promise<ScrapedVacancy[]> {
    const listUrl = `${this.baseUrl}/vacancy/list/`;
    console.log(`[${this.municipalityId}] Fetching list: ${listUrl}`);

    const html = await fetchHtml(listUrl);
    const vacancies = this.parseList(html);
    console.log(`[${this.municipalityId}] Found ${vacancies.length} vacancies`);

    const enriched: ScrapedVacancy[] = [];
    for (const v of vacancies) {
      try {
        await delay(500);
        const detailHtml = await fetchHtml(v.sourceUrl);
        const detail = this.parseDetail(detailHtml, v);
        enriched.push(detail);
        console.log(`[${this.municipalityId}] Scraped detail: ${v.title}`);
      } catch (err) {
        console.error(`[${this.municipalityId}] Error scraping detail for ${v.title}:`, err);
        enriched.push(v); // keep list-only data
      }
    }

    return enriched;
  }

  private parseList(html: string): ScrapedVacancy[] {
    const $ = cheerio.load(html);
    const vacancies: ScrapedVacancy[] = [];

    // EasyCruit uses div-based layout with class "joblist-table" for rows
    // and "joblist-table-cell" for cells. Also try actual table as fallback.
    const rows = $('.joblist-table.joblist-table-collapse');

    if (rows.length > 0) {
      // Div-based layout (Zwolle, Dronten, Noordoostpolder style)
      rows.each((_, row) => {
        const titleCell = $(row).find('.joblist-title a');
        const title = titleCell.text().trim();
        if (!title) return;

        let href = titleCell.attr('href') || '';
        if (href && !href.startsWith('http')) {
          href = `${this.baseUrl}${href}`;
        }

        const idMatch = href.match(/\/vacancy\/(\d+)/);
        const externalId = idMatch ? idMatch[1] : title.replace(/\s+/g, '-').toLowerCase();

        const department = $(row).find('.joblist-departments').text().replace(/^Afdelingen:\s*/i, '').trim() || undefined;
        const location = $(row).find('.joblist-location').text().replace(/^Locatie:\s*/i, '').trim() || undefined;
        const closingRaw = $(row).find('.joblist-deadline').text().replace(/^Sluitingsdatum:\s*/i, '').trim() || undefined;
        const closingDate = closingRaw ? parseDutchDate(closingRaw) : undefined;

        vacancies.push({
          externalId,
          municipalityId: this.municipalityId,
          title,
          department,
          location,
          closingDate,
          sourceUrl: href,
        });
      });
    } else {
      // Fallback: try actual HTML table (Kampen style)
      const headers: string[] = [];
      $('table thead th, table tr:first-child th').each((_, th) => {
        headers.push($(th).text().trim().toLowerCase());
      });

      const titleIdx = Math.max(0, headers.findIndex(h => h.includes('functie') || h.includes('title') || h.includes('vacature')));
      const deptIdx = headers.findIndex(h => h.includes('afdeling') || h.includes('team') || h.includes('department'));
      const locationIdx = headers.findIndex(h => h.includes('locatie') || h.includes('location'));
      const dateIdx = headers.findIndex(h => h.includes('sluitingsdatum') || h.includes('closing') || h.includes('datum'));

      $('table tbody tr, table tr').each((_, tr) => {
        const cells = $(tr).find('td');
        if (cells.length === 0) return;

        const titleCell = cells.eq(titleIdx);
        const link = titleCell.find('a');
        const title = link.text().trim() || titleCell.text().trim();
        if (!title) return;

        let href = link.attr('href') || '';
        if (href && !href.startsWith('http')) {
          href = `${this.baseUrl}${href}`;
        }

        const idMatch = href.match(/\/vacancy\/(\d+)/);
        const externalId = idMatch ? idMatch[1] : title.replace(/\s+/g, '-').toLowerCase();

        const department = deptIdx >= 0 ? cells.eq(deptIdx).text().trim() : undefined;
        const location = locationIdx >= 0 ? cells.eq(locationIdx).text().trim() : undefined;
        const closingRaw = dateIdx >= 0 ? cells.eq(dateIdx).text().trim() : undefined;
        const closingDate = closingRaw ? parseDutchDate(closingRaw) : undefined;

        vacancies.push({
          externalId,
          municipalityId: this.municipalityId,
          title,
          department: department || undefined,
          location: location || undefined,
          closingDate,
          sourceUrl: href,
        });
      });
    }

    // Third fallback: some EasyCruit portals (e.g. Westland) render vacancies
    // as <a href="/vacancy/<id>/<sub>?iso=nl">Title</a> outside of a table.
    if (vacancies.length === 0) {
      const seen = new Set<string>();
      $('a[href*="/vacancy/"]').each((_, a) => {
        const href = $(a).attr('href') || '';
        const m = href.match(/\/vacancy\/(\d+)\/(\d+)/);
        if (!m) return;
        const title = $(a).clone().children('svg,span,img').remove().end().text().trim();
        if (!title || /^lees\s*meer$/i.test(title)) return;
        const externalId = `${m[1]}-${m[2]}`;
        if (seen.has(externalId)) return;
        seen.add(externalId);
        const absoluteHref = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
        vacancies.push({
          externalId,
          municipalityId: this.municipalityId,
          title,
          sourceUrl: absoluteHref,
        });
      });
    }

    return vacancies;
  }

  private parseDetail(html: string, base: ScrapedVacancy): ScrapedVacancy {
    const $ = cheerio.load(html);
    const result = { ...base };

    // Get the main content area
    const content = $('.vacancy-details, .vacancy-body, .content-area, main, #content, article').first();
    const fullText = (content.length ? content.text() : $('body').text());
    const fullHtml = content.length ? content.html() || '' : '';

    // Description: try to get the main body text
    const descParts: string[] = [];
    $('h2, h3').each((_, heading) => {
      const headingText = $(heading).text().trim().toLowerCase();
      // Skip contact/apply sections for description
      if (headingText.includes('sollicit') || headingText.includes('contact')) return;

      let nextContent = '';
      let next = $(heading).next();
      while (next.length && !next.is('h2, h3')) {
        nextContent += next.text().trim() + '\n';
        next = next.next();
      }
      if (nextContent) {
        descParts.push(`<h3>${$(heading).text().trim()}</h3>\n<p>${nextContent.trim()}</p>`);
      }
    });

    if (descParts.length > 0) {
      result.description = descParts.join('\n');
    } else if (fullHtml) {
      result.description = fullHtml;
    }

    // Extract structured data from full text
    const salary = extractSalary(fullText);
    if (salary.min || salary.scale) {
      result.salaryRaw = fullText.match(/€[^.]*?(?:schaal\s*\d+[^.]*)?/i)?.[0]?.trim() || salary.raw.substring(0, 200);
    }

    const hours = extractHours(fullText);
    if (hours) result.hoursPerWeek = hours;

    const education = extractEducationLevel(fullText);
    if (education) result.educationLevel = education;

    const employment = extractEmploymentType(fullText);
    if (employment) result.employmentType = employment;

    // Contact info
    const emailMatch = fullText.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
    if (emailMatch) result.contactEmail = emailMatch[0];

    const phoneMatch = fullText.match(/(?:06[\s-]?\d{8}|14\s*0\d{2,3}|\+31[\s-]?\d[\s-]?\d{7,8}|\(0\d{2,3}\)\s*\d{6,7})/);
    if (phoneMatch) result.contactPhone = phoneMatch[0];

    // Look for contact name near "informatie" or "contact" headings
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
