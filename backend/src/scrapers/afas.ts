import * as cheerio from 'cheerio';
import type { ScrapedVacancy } from '@application-finder/shared/src/types.js';
import type { Scraper } from './base-scraper.js';
import { delay, fetchHtml } from './base-scraper.js';
import { extractSalary, extractHours, extractEducationLevel, extractEmploymentType, parseDutchDate } from '../utils/text-extract.js';

interface AfasVacancyEntry {
  uniqueId: string;
  link: string;
  columns: Record<string, { value?: string }>;
}

export class AfasScraper implements Scraper {
  constructor(
    public municipalityId: string,
    private baseUrl: string,
  ) {}

  async scrapeAll(): Promise<ScrapedVacancy[]> {
    console.log(`[${this.municipalityId}] Fetching AFAS portal: ${this.baseUrl}`);

    const html = await fetchHtml(this.baseUrl);
    const entries = this.parseListFromJson(html);
    console.log(`[${this.municipalityId}] Found ${entries.length} vacancies`);

    if (entries.length === 0) return [];

    const vacancies: ScrapedVacancy[] = [];
    for (const entry of entries) {
      const detailUrl = `${this.baseUrl}${entry.link}`;
      try {
        await delay(500);
        const detailHtml = await fetchHtml(detailUrl);
        const vacancy = this.parseDetail(detailHtml, entry, detailUrl);
        vacancies.push(vacancy);
        console.log(`[${this.municipalityId}] Scraped detail: ${vacancy.title}`);
      } catch (err) {
        console.warn(`[${this.municipalityId}] Could not fetch detail for "${entry.link}", storing basic info`);
        vacancies.push(this.basicFromEntry(entry, detailUrl));
      }
    }

    return vacancies;
  }

  private parseListFromJson(html: string): AfasVacancyEntry[] {
    // AFAS embeds vacancy data as JSON in webview.RegisterWebView() calls
    const entries: AfasVacancyEntry[] = [];
    const pattern = /webview\.RegisterWebView\([^,]+,\s*(\{[\s\S]*?\})\s*\);/g;
    let match;

    while ((match = pattern.exec(html)) !== null) {
      try {
        const json = JSON.parse(match[1]);
        if (json.data && Array.isArray(json.data)) {
          for (const item of json.data) {
            if (item.link && item.columns) {
              // Avoid duplicates (AFAS renders desktop + mobile views)
              if (!entries.some(e => e.uniqueId === item.uniqueId)) {
                entries.push(item);
              }
            }
          }
        }
      } catch {
        // Not all RegisterWebView calls contain vacancy data
      }
    }

    return entries;
  }

  private basicFromEntry(entry: AfasVacancyEntry, detailUrl: string): ScrapedVacancy {
    const title = entry.columns['U012']?.value
      || entry.columns['KnWCITitl']?.value
      || 'Untitled';
    const department = entry.columns['U006']?.value || undefined;
    const publishedRaw = entry.columns['U002']?.value || entry.columns['KnWCIPuDa']?.value;
    const publishedDate = publishedRaw ? publishedRaw.split('T')[0] : undefined;

    return {
      externalId: entry.uniqueId,
      municipalityId: this.municipalityId,
      title,
      department,
      publishedDate,
      sourceUrl: detailUrl,
    };
  }

  private parseDetail(html: string, entry: AfasVacancyEntry, detailUrl: string): ScrapedVacancy {
    const result = this.basicFromEntry(entry, detailUrl);

    // Extract structured data from the DataSet registration
    const dataSetInfo = this.extractDataSet(html);
    if (dataSetInfo) {
      if (dataSetInfo.salary) result.salaryRaw = dataSetInfo.salary;
      if (dataSetInfo.hours) result.hoursPerWeek = dataSetInfo.hours;
      if (dataSetInfo.employmentType) result.employmentType = dataSetInfo.employmentType;
      if (dataSetInfo.contactEmail) result.contactEmail = dataSetInfo.contactEmail;
      if (dataSetInfo.contactPhone) result.contactPhone = dataSetInfo.contactPhone;
    }

    // Extract the HTML description from the "Re" field or rendered content
    const descriptionHtml = this.extractDescription(html);
    if (descriptionHtml) {
      result.description = descriptionHtml;
      const $ = cheerio.load(descriptionHtml);
      const plainText = $.text();

      // Use text extractors on the description
      if (!result.salaryRaw) {
        const salary = extractSalary(plainText);
        if (salary.min || salary.scale) {
          result.salaryRaw = plainText.match(/€[^.]*?(?:schaal\s*\d+[^.]*)?/i)?.[0]?.trim() || salary.raw.substring(0, 200);
        }
      }

      if (!result.hoursPerWeek) {
        result.hoursPerWeek = extractHours(plainText);
      }

      result.educationLevel = extractEducationLevel(plainText);

      if (!result.employmentType) {
        result.employmentType = extractEmploymentType(plainText);
      }

      // Closing date
      const closingMatch = plainText.match(/(?:sluitingsdatum|reageren\s+(?:voor|v[oó]{1,2}r)|uiterlijk|solliciteer\s+voor)[:\s]*(\d{1,2}[\s/-]\w+[\s/-]\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{4})/i);
      if (closingMatch) {
        const parsed = parseDutchDate(closingMatch[1]);
        if (parsed) result.closingDate = parsed;
      }

      // Contact info from description text
      if (!result.contactEmail) {
        const emailMatch = plainText.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
        if (emailMatch) result.contactEmail = emailMatch[0];
      }

      if (!result.contactPhone) {
        const phoneMatch = plainText.match(/(?:06[\s-]?\d{8}|14\s*0\d{2,3}|\+31[\s-]?\d[\s-]?\d{7,8}|\(0\d{2,3}\)\s*\d{6,7})/);
        if (phoneMatch) result.contactPhone = phoneMatch[0];
      }
    }

    return result;
  }

  private extractDataSet(html: string): {
    salary?: string;
    hours?: number;
    employmentType?: string;
    contactEmail?: string;
    contactPhone?: string;
  } | null {
    // Look for data.RegisterDataSet calls containing HrVac table data
    const dataSetMatch = html.match(/data\.RegisterDataSet\([^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*(\{[\s\S]*?\})\s*\)/);
    if (!dataSetMatch) return null;

    const result: Record<string, string | number | undefined> = {};

    try {
      const raw = dataSetMatch[1];

      // Extract salary: "Salary": "3777,00 - 5554,00"
      const salaryMatch = raw.match(/"Salary"\s*:\s*"([^"]+)"/);
      if (salaryMatch) {
        result.salary = `€ ${salaryMatch[1].replace(/\s*-\s*/, ' - € ')}`;
      }

      // Extract hours from the data
      const hoursMatch = raw.match(/"[^"]*":\s*"(\d{1,2}(?:\.\d{2})?)"\s*(?:,|})/) ||
        raw.match(/36\.00|32\.00|40\.00|24\.00/);
      if (hoursMatch) {
        const hours = parseFloat(hoursMatch[1] || hoursMatch[0]);
        if (hours >= 8 && hours <= 40) result.hours = hours;
      }

      // Extract contract type
      if (raw.includes('Onbepaalde tijd') || raw.includes('onbepaalde')) {
        result.employmentType = 'vast';
      } else if (raw.includes('Bepaalde tijd') || raw.includes('bepaalde')) {
        result.employmentType = 'tijdelijk';
      }

      // Extract contact info
      const emailMatch = raw.match(/"(?:Contact|Responsible)KnBcnEmAd"\s*:\s*"([^"]+)"/);
      if (emailMatch) result.contactEmail = emailMatch[1];

      const phoneMatch = raw.match(/"(?:Contact|Responsible)KnBcnTeNr"\s*:\s*"([^"]+)"/);
      if (phoneMatch) result.contactPhone = phoneMatch[1];
    } catch {
      return null;
    }

    return result as any;
  }

  private extractDescription(html: string): string | null {
    // AFAS stores the full vacancy description in the "Re" field as escaped HTML
    const reMatch = html.match(/"Re"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (reMatch) {
      try {
        // Unescape the JSON string
        const unescaped = JSON.parse(`"${reMatch[1]}"`);
        return unescaped;
      } catch {
        // Fall through to cheerio parsing
      }
    }

    // Fallback: parse rendered content areas
    const $ = cheerio.load(html);
    const fullText = $('body').text();

    const descParts: string[] = [];
    const skipPatterns = ['cookie', 'sollicit', 'readspeaker', 'navigat', 'menu', 'footer'];

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

    return descParts.length > 0 ? descParts.join('\n') : null;
  }
}
