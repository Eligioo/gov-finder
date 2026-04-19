import * as cheerio from 'cheerio';
import type { ScrapedVacancy } from '@application-finder/shared/src/types.js';
import type { Scraper } from './base-scraper.js';
import { delay, fetchHtml } from './base-scraper.js';
import {
  extractSalary,
  extractHours,
  extractEducationLevel,
  extractEmploymentType,
  parseDutchDate,
} from '../utils/text-extract.js';

interface HtmlListConfig {
  listUrl: string;
  baseUrl: string;
  linkPattern: RegExp;
  excludeSlugs?: string[];
}

const HTML_LIST_CONFIGS: Record<string, HtmlListConfig> = {
  zoetermeer: {
    listUrl: 'https://www.werkenbijzoetermeer.nl/vacatures',
    baseUrl: 'https://www.werkenbijzoetermeer.nl',
    linkPattern: /^https:\/\/www\.werkenbijzoetermeer\.nl\/vacatures\/[a-z0-9][a-z0-9-]{4,}$/i,
    excludeSlugs: ['favorieten'],
  },
  rijswijk: {
    listUrl: 'https://www.rijswijk.nl/vacatures',
    baseUrl: 'https://www.rijswijk.nl',
    linkPattern: /^https:\/\/www\.rijswijk\.nl\/[a-z0-9][a-z0-9-]{4,}$/i,
    // Rijswijk only surfaces vacancy links via class="node--maxi-teaser__link",
    // so the list extractor will key off that CSS class instead of purely URL pattern.
  },
  dcmr: {
    listUrl: 'https://www.werkenbijdcmr.nl/onze-vacatures',
    baseUrl: 'https://www.werkenbijdcmr.nl',
    linkPattern: /\/werken-bij\/vacatures\/[a-z0-9][a-z0-9-]{3,}$/i,
  },
  'od-haaglanden': {
    listUrl: 'https://omgevingsdiensthaaglanden.nl/werken-bij/',
    baseUrl: 'https://omgevingsdiensthaaglanden.nl',
    linkPattern: /^https:\/\/omgevingsdiensthaaglanden\.nl\/vacatures\/[a-z0-9][a-z0-9-]{3,}\/$/i,
  },
  'od-west-holland': {
    listUrl: 'https://www.odwh.nl/zoektjou/',
    baseUrl: 'https://www.odwh.nl',
    linkPattern: /^https:\/\/www\.odwh\.nl\/zoektjou\/[a-z0-9][a-z0-9-]{3,}\/$/i,
    // Exclude obvious non-vacancy posts on this WP site.
    excludeSlugs: ['collega-aan-het-woord-remco-amorison-medewerker-serviceburo', 'odwh-collega-aan-het-woord'],
  },
};

export class HtmlListScraper implements Scraper {
  constructor(public municipalityId: string) {}

  async scrapeAll(): Promise<ScrapedVacancy[]> {
    const config = HTML_LIST_CONFIGS[this.municipalityId];
    if (!config) {
      throw new Error(`No html_list config for ${this.municipalityId}`);
    }

    console.log(`[${this.municipalityId}] Fetching list: ${config.listUrl}`);
    const html = await fetchHtml(config.listUrl);
    const links = this.extractLinks(html, config);
    console.log(`[${this.municipalityId}] Found ${links.length} vacancy links`);

    const vacancies: ScrapedVacancy[] = [];
    for (const { url, titleHint } of links) {
      try {
        await delay(400);
        const detailHtml = await fetchHtml(url);
        const vacancy = this.parseDetail(detailHtml, url, titleHint);
        vacancies.push(vacancy);
        console.log(`[${this.municipalityId}] Scraped detail: ${vacancy.title}`);
      } catch (err) {
        console.warn(`[${this.municipalityId}] Could not fetch detail for ${url}:`, err instanceof Error ? err.message : err);
        // Fall back to a stub with just the title hint.
        vacancies.push({
          externalId: lastPathSegment(url),
          municipalityId: this.municipalityId,
          title: titleHint || '(Untitled)',
          sourceUrl: url,
        });
      }
    }
    return vacancies;
  }

  private extractLinks(html: string, config: HtmlListConfig): { url: string; titleHint?: string }[] {
    const $ = cheerio.load(html);
    const seen = new Set<string>();
    const results: { url: string; titleHint?: string }[] = [];

    // Prefer the Rijswijk-specific teaser class when present (most reliable).
    const rijswijkLinks = $('a.node--maxi-teaser__link');
    if (rijswijkLinks.length > 0 && this.municipalityId === 'rijswijk') {
      rijswijkLinks.each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        const abs = absoluteUrl(href, config.baseUrl);
        if (!seen.has(abs)) {
          seen.add(abs);
          // Title = anchor text minus any child svg/spans
          const title = $(el).clone().children('svg,span').remove().end().text().trim();
          results.push({ url: abs, titleHint: title || undefined });
        }
      });
      return results;
    }

    // Generic fallback: all anchors whose href matches the link pattern.
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      const abs = absoluteUrl(href, config.baseUrl);
      if (!config.linkPattern.test(abs)) return;
      const slug = lastPathSegment(abs);
      if (config.excludeSlugs?.includes(slug)) return;
      if (seen.has(abs)) return;
      seen.add(abs);
      const title = $(el).clone().children('svg,span,img').remove().end().text().trim().replace(/\s+/g, ' ');
      results.push({ url: abs, titleHint: title || undefined });
    });

    return results;
  }

  private parseDetail(html: string, url: string, titleHint?: string): ScrapedVacancy {
    const $ = cheerio.load(html);

    const h1Title = $('h1').first().text().trim();
    const ogTitle = $('meta[property="og:title"]').attr('content')?.trim();
    const title = h1Title || ogTitle || titleHint || '(Untitled)';

    // Build description by walking h2/h3 sections, skipping nav/cookie/footer noise.
    const skipPatterns = ['cookie', 'sollicit', 'readspeaker', 'navigat', 'menu', 'footer', 'delen op'];
    const descParts: string[] = [];
    const mainRoot = $('main, article, [role="main"], .content, #content').first();
    const scope = mainRoot.length ? mainRoot : $('body');

    scope.find('h2, h3').each((_, heading) => {
      const headingText = $(heading).text().trim();
      if (!headingText) return;
      const lower = headingText.toLowerCase();
      if (skipPatterns.some(p => lower.includes(p))) return;

      let nextContent = '';
      let next = $(heading).next();
      let guard = 0;
      while (next.length && !next.is('h2, h3') && guard < 50) {
        const text = next.text().trim();
        if (text.length > 10 && !skipPatterns.some(p => text.toLowerCase().includes(p) && text.length < 200)) {
          nextContent += text + '\n';
        }
        next = next.next();
        guard++;
      }
      if (nextContent.trim().length > 20) {
        descParts.push(`<h3>${headingText}</h3>\n<p>${nextContent.trim()}</p>`);
      }
    });

    const description = descParts.length > 0
      ? descParts.join('\n')
      : scope.text().trim().slice(0, 5000) || undefined;

    const plainText = cheerio.load(description || '').text();
    const fullText = scope.text();

    const result: ScrapedVacancy = {
      externalId: lastPathSegment(url),
      municipalityId: this.municipalityId,
      title,
      description,
      sourceUrl: url,
    };

    const salary = extractSalary(fullText);
    if (salary.min || salary.scale) {
      const salaryMatch = fullText.match(/€[^€.]*?(?:schaal\s*\d+)?/i);
      if (salaryMatch) result.salaryRaw = salaryMatch[0].trim().substring(0, 200);
    }

    const hours = extractHours(fullText);
    if (hours) result.hoursPerWeek = hours;

    const edu = extractEducationLevel(fullText);
    if (edu) result.educationLevel = edu;

    const emp = extractEmploymentType(fullText);
    if (emp) result.employmentType = emp;

    const closingMatch = fullText.match(/(?:sluitingsdatum|reageren\s+(?:voor|v[oó]{1,2}r)|uiterlijk|solliciteer\s+voor)[:\s]*(\d{1,2}[\s/-]\w+[\s/-]\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{4})/i);
    if (closingMatch) {
      const parsed = parseDutchDate(closingMatch[1]);
      if (parsed) result.closingDate = parsed;
    }

    const emailMatch = fullText.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
    if (emailMatch) result.contactEmail = emailMatch[0];

    const phoneMatch = fullText.match(/(?:14\s*0\d{2,3}|06[\s-]?\d{8}|\+31[\s-]?\d[\s-]?\d{7,8})/);
    if (phoneMatch) result.contactPhone = phoneMatch[0];

    return result;
  }
}

function absoluteUrl(href: string, baseUrl: string): string {
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith('/')) return `${baseUrl}${href}`;
  return `${baseUrl}/${href}`;
}

function lastPathSegment(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.replace(/\/$/, '').split('/');
    return parts[parts.length - 1] || u.pathname;
  } catch {
    return url;
  }
}
