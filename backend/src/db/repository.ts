import { getDb } from './schema.js';
import type { Vacancy, ScrapedVacancy, MunicipalityWithCount, ScrapeStatus } from '@application-finder/shared/src/types.js';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export interface VacancyQuery {
  q?: string;
  municipality?: string[];
  education?: string[];
  employmentType?: string[];
  hoursMin?: number;
  hoursMax?: number;
  salaryMin?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
  active?: boolean;
  ids?: number[];
}

export function upsertVacancy(v: ScrapedVacancy, salaryParsed?: { min?: number; max?: number; scale?: string }) {
  const db = getDb();
  const descPlain = v.description ? stripHtml(v.description) : undefined;

  const result = db.prepare(`
    INSERT INTO vacancies (
      external_id, municipality_id, title, department, location,
      description, description_plain, salary_min, salary_max, salary_scale, salary_raw,
      hours_per_week, education_level, employment_type,
      closing_date, published_date, source_url,
      contact_name, contact_email, contact_phone
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?
    )
    ON CONFLICT(external_id, municipality_id) DO UPDATE SET
      title = excluded.title,
      department = excluded.department,
      location = excluded.location,
      description = excluded.description,
      description_plain = excluded.description_plain,
      salary_min = excluded.salary_min,
      salary_max = excluded.salary_max,
      salary_scale = excluded.salary_scale,
      salary_raw = excluded.salary_raw,
      hours_per_week = excluded.hours_per_week,
      education_level = excluded.education_level,
      employment_type = excluded.employment_type,
      closing_date = excluded.closing_date,
      published_date = excluded.published_date,
      source_url = excluded.source_url,
      contact_name = excluded.contact_name,
      contact_email = excluded.contact_email,
      contact_phone = excluded.contact_phone,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now'),
      is_active = 1
  `).run(
    v.externalId, v.municipalityId, v.title, v.department ?? null, v.location ?? null,
    v.description ?? null, descPlain ?? null,
    salaryParsed?.min ?? null, salaryParsed?.max ?? null, salaryParsed?.scale ?? null, v.salaryRaw ?? null,
    v.hoursPerWeek ?? null, v.educationLevel ?? null, v.employmentType ?? null,
    v.closingDate ?? null, v.publishedDate ?? null, v.sourceUrl,
    v.contactName ?? null, v.contactEmail ?? null, v.contactPhone ?? null,
  );

  return result.changes > 0 ? (result.lastInsertRowid ? 'inserted' : 'updated') : 'unchanged';
}

export function deactivateMissing(municipalityId: string, activeExternalIds: string[]) {
  const db = getDb();
  if (activeExternalIds.length === 0) return;

  const placeholders = activeExternalIds.map(() => '?').join(',');
  db.prepare(`
    UPDATE vacancies SET is_active = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE municipality_id = ? AND external_id NOT IN (${placeholders}) AND is_active = 1
  `).run(municipalityId, ...activeExternalIds);
}

export function queryVacancies(query: VacancyQuery) {
  const db = getDb();
  const conditions: string[] = [];
  const params: any[] = [];

  const active = query.active !== false;
  if (active) {
    conditions.push('v.is_active = 1');
  }

  if (query.ids && query.ids.length > 0) {
    conditions.push(`v.id IN (${query.ids.map(() => '?').join(',')})`);
    params.push(...query.ids);
  }

  if (query.municipality && query.municipality.length > 0) {
    conditions.push(`v.municipality_id IN (${query.municipality.map(() => '?').join(',')})`);
    params.push(...query.municipality);
  }

  if (query.education && query.education.length > 0) {
    conditions.push(`v.education_level IN (${query.education.map(() => '?').join(',')})`);
    params.push(...query.education);
  }

  if (query.employmentType && query.employmentType.length > 0) {
    conditions.push(`v.employment_type IN (${query.employmentType.map(() => '?').join(',')})`);
    params.push(...query.employmentType);
  }

  if (query.hoursMin != null) {
    conditions.push('v.hours_per_week >= ?');
    params.push(query.hoursMin);
  }
  if (query.hoursMax != null) {
    conditions.push('v.hours_per_week <= ?');
    params.push(query.hoursMax);
  }
  if (query.salaryMin != null) {
    conditions.push('v.salary_max >= ?');
    params.push(query.salaryMin);
  }

  let orderClause: string;
  const order = query.order === 'asc' ? 'ASC' : 'DESC';

  let fromClause: string;
  let selectExtra = '';

  if (query.q) {
    fromClause = `vacancies_fts fts JOIN vacancies v ON v.id = fts.rowid`;
    conditions.push('fts MATCH ?');
    params.push(query.q);
    selectExtra = ', bm25(fts) AS rank';
    orderClause = query.sort === 'relevance' || !query.sort
      ? `ORDER BY rank ASC`
      : `ORDER BY v.${getSortColumn(query.sort)} ${order}`;
  } else {
    fromClause = 'vacancies v';
    orderClause = `ORDER BY v.${getSortColumn(query.sort || 'published_date')} ${order}`;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const page = query.page || 1;
  const perPage = Math.min(query.perPage || 20, 100);
  const offset = (page - 1) * perPage;

  const countSql = `SELECT COUNT(*) as total FROM ${fromClause} ${where}`;
  const total = (db.prepare(countSql).get(...params) as any).total;

  const dataSql = `
    SELECT v.*, m.name as municipality_name ${selectExtra}
    FROM ${fromClause}
    JOIN municipalities m ON m.id = v.municipality_id
    ${where}
    ${orderClause}
    LIMIT ? OFFSET ?
  `;
  const rows = db.prepare(dataSql).all(...params, perPage, offset) as any[];

  // Get filter counts for the current query (without pagination)
  const filterParams = [...params]; // same params as the WHERE
  const municipalityCounts = db.prepare(`
    SELECT v.municipality_id as id, m.name, COUNT(*) as count
    FROM ${fromClause}
    JOIN municipalities m ON m.id = v.municipality_id
    ${where}
    GROUP BY v.municipality_id
  `).all(...filterParams) as any[];

  const educationCounts = db.prepare(`
    SELECT v.education_level as value, COUNT(*) as count
    FROM ${fromClause}
    ${where} ${where ? 'AND' : 'WHERE'} v.education_level IS NOT NULL
    GROUP BY v.education_level
  `).all(...filterParams) as any[];

  const employmentCounts = db.prepare(`
    SELECT v.employment_type as value, COUNT(*) as count
    FROM ${fromClause}
    ${where} ${where ? 'AND' : 'WHERE'} v.employment_type IS NOT NULL
    GROUP BY v.employment_type
  `).all(...filterParams) as any[];

  return {
    data: rows.map(mapRow),
    pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    filters: {
      municipalities: municipalityCounts,
      educationLevels: educationCounts,
      employmentTypes: employmentCounts,
    },
  };
}

export function getVacancyById(id: number): Vacancy | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT v.*, m.name as municipality_name
    FROM vacancies v
    JOIN municipalities m ON m.id = v.municipality_id
    WHERE v.id = ?
  `).get(id) as any;
  return row ? mapRow(row) : null;
}

export function getMunicipalities(): MunicipalityWithCount[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT m.*, COALESCE(c.cnt, 0) as vacancy_count
    FROM municipalities m
    LEFT JOIN (
      SELECT municipality_id, COUNT(*) as cnt
      FROM vacancies WHERE is_active = 1
      GROUP BY municipality_id
    ) c ON c.municipality_id = m.id
  `).all() as any[];
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    sourceType: r.source_type,
    sourceUrl: r.source_url,
    logoUrl: r.logo_url,
    lat: r.lat,
    lng: r.lng,
    vacancyCount: r.vacancy_count,
  }));
}

export function getStats() {
  const db = getDb();
  const totalActive = (db.prepare('SELECT COUNT(*) as c FROM vacancies WHERE is_active = 1').get() as any).c;

  const byMunicipality = db.prepare(`
    SELECT v.municipality_id as id, m.name, COUNT(*) as count
    FROM vacancies v JOIN municipalities m ON m.id = v.municipality_id
    WHERE v.is_active = 1 GROUP BY v.municipality_id
  `).all() as any[];

  const byEducation = db.prepare(`
    SELECT education_level as value, COUNT(*) as count
    FROM vacancies WHERE is_active = 1 AND education_level IS NOT NULL
    GROUP BY education_level
  `).all() as any[];

  const byEmploymentType = db.prepare(`
    SELECT employment_type as value, COUNT(*) as count
    FROM vacancies WHERE is_active = 1 AND employment_type IS NOT NULL
    GROUP BY employment_type
  `).all() as any[];

  const lastScrape = db.prepare(`
    SELECT MAX(finished_at) as last FROM scrape_log WHERE status = 'success'
  `).get() as any;

  return { totalActive, byMunicipality, byEducation, byEmploymentType, lastScrape: lastScrape?.last };
}

export function logScrapeStart(municipalityId: string): number {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO scrape_log (municipality_id, started_at, status)
    VALUES (?, strftime('%Y-%m-%dT%H:%M:%fZ','now'), 'running')
  `).run(municipalityId);
  return Number(result.lastInsertRowid);
}

export function logScrapeEnd(logId: number, status: 'success' | 'error', found: number, newCount: number, updated: number, error?: string) {
  const db = getDb();
  db.prepare(`
    UPDATE scrape_log SET
      finished_at = strftime('%Y-%m-%dT%H:%M:%fZ','now'),
      status = ?,
      vacancies_found = ?,
      vacancies_new = ?,
      vacancies_updated = ?,
      error_message = ?
    WHERE id = ?
  `).run(status, found, newCount, updated, error ?? null, logId);
}

export function getLatestScrapeStatus(): ScrapeStatus[] {
  const db = getDb();
  return db.prepare(`
    SELECT sl.* FROM scrape_log sl
    INNER JOIN (
      SELECT municipality_id, MAX(id) as max_id FROM scrape_log GROUP BY municipality_id
    ) latest ON sl.id = latest.max_id
    ORDER BY sl.started_at DESC
  `).all() as any[];
}

function getSortColumn(sort?: string): string {
  const allowed: Record<string, string> = {
    title: 'title',
    closing_date: 'closing_date',
    published_date: 'published_date',
    salary: 'salary_max',
    hours: 'hours_per_week',
  };
  return allowed[sort || 'published_date'] || 'published_date';
}

function mapRow(row: any): Vacancy {
  return {
    id: row.id,
    externalId: row.external_id,
    municipalityId: row.municipality_id,
    municipalityName: row.municipality_name,
    title: row.title,
    department: row.department,
    location: row.location,
    description: row.description,
    descriptionPlain: row.description_plain,
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    salaryScale: row.salary_scale,
    salaryRaw: row.salary_raw,
    hoursPerWeek: row.hours_per_week,
    educationLevel: row.education_level,
    employmentType: row.employment_type,
    closingDate: row.closing_date,
    publishedDate: row.published_date,
    sourceUrl: row.source_url,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    scrapedAt: row.scraped_at,
    updatedAt: row.updated_at,
    isActive: !!row.is_active,
  };
}
