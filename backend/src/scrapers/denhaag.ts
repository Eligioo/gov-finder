import type { ScrapedVacancy } from '@application-finder/shared/src/types.js';
import type { Scraper } from './base-scraper.js';

const API_URL = 'https://werkenvoor.denhaag.nl/wp-json/werken-voor-denhaag-theme/v1/vacancies';

interface DenHaagTaxonomy {
  id: number;
  name: string;
  slug: string;
}

interface DenHaagVacancy {
  title: string;
  link: string;
  share?: string;
  excerpt?: string;
  salary?: string;
  taxonomies?: {
    categorie?: DenHaagTaxonomy[];
    vakgebied?: DenHaagTaxonomy[];
    functieniveau?: DenHaagTaxonomy[];
    functiecategorie?: DenHaagTaxonomy[];
    typedienstverband?: DenHaagTaxonomy[];
    soortvacature?: DenHaagTaxonomy[];
  };
}

export class DenHaagScraper implements Scraper {
  municipalityId = 'den-haag';

  async scrapeAll(): Promise<ScrapedVacancy[]> {
    console.log(`[${this.municipalityId}] Fetching Den Haag vacancies: ${API_URL}`);

    const response = await fetch(API_URL, {
      headers: {
        'User-Agent': 'VacatureFinder/1.0 (municipality-vacancy-aggregator)',
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching ${API_URL}`);
    }
    const data = await response.json() as DenHaagVacancy[];
    console.log(`[${this.municipalityId}] Found ${data.length} vacancies`);

    return data.map(v => this.mapVacancy(v));
  }

  private mapVacancy(v: DenHaagVacancy): ScrapedVacancy {
    const slug = v.link.replace(/\/$/, '').split('/').pop() || v.link;
    const tax = v.taxonomies || {};

    const department = tax.categorie?.[0]?.name ? decodeHtml(tax.categorie[0].name) : undefined;

    let educationLevel: string | undefined;
    if (tax.functieniveau?.length) {
      educationLevel = tax.functieniveau.map(t => t.name.toUpperCase()).join('/');
    }

    let employmentType: string | undefined;
    const tdv = tax.typedienstverband?.[0]?.slug;
    if (tdv === 'vast') employmentType = 'vast';
    else if (tdv === 'tijdelijk') employmentType = 'tijdelijk';
    const soort = tax.soortvacature?.[0]?.slug;
    if (soort === 'stage' || soort === 'werkervaringsplek') employmentType = 'stage';

    const salaryRaw = v.salary ? `€ ${v.salary}` : undefined;

    return {
      externalId: slug,
      municipalityId: this.municipalityId,
      title: decodeHtml(v.title),
      department,
      description: v.excerpt ? decodeHtml(v.excerpt) : undefined,
      salaryRaw,
      educationLevel,
      employmentType,
      sourceUrl: v.link,
    };
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
