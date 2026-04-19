import { Router } from 'express';
import { queryVacancies, getVacancyById, getMunicipalities, getStats, getLatestScrapeStatus } from '../db/repository.js';
import { scrapeAll } from '../scrapers/scraper-manager.js';

const router = Router();

router.get('/vacancies', (req, res) => {
  const q = req.query.q as string | undefined;
  const municipality = req.query.municipality ? (req.query.municipality as string).split(',') : undefined;
  const education = req.query.education ? (req.query.education as string).split(',') : undefined;
  const employmentType = req.query.employment_type ? (req.query.employment_type as string).split(',') : undefined;
  const hoursMin = req.query.hours_min ? Number(req.query.hours_min) : undefined;
  const hoursMax = req.query.hours_max ? Number(req.query.hours_max) : undefined;
  const salaryMin = req.query.salary_min ? Number(req.query.salary_min) : undefined;
  const sort = req.query.sort as string | undefined;
  const order = req.query.order as 'asc' | 'desc' | undefined;
  const page = req.query.page ? Number(req.query.page) : undefined;
  const perPage = req.query.per_page ? Number(req.query.per_page) : undefined;
  const ids = req.query.ids ? (req.query.ids as string).split(',').map(Number) : undefined;

  try {
    const result = queryVacancies({ q, municipality, education, employmentType, hoursMin, hoursMax, salaryMin, sort, order, page, perPage, ids });
    res.json(result);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: 'Failed to query vacancies' });
  }
});

router.get('/vacancies/:id', (req, res) => {
  const id = Number(req.params.id);
  const vacancy = getVacancyById(id);
  if (!vacancy) {
    res.status(404).json({ error: 'Vacancy not found' });
    return;
  }
  res.json(vacancy);
});

router.get('/municipalities', (_req, res) => {
  res.json(getMunicipalities());
});

router.get('/stats', (_req, res) => {
  res.json(getStats());
});

router.post('/scrape', async (req, res) => {
  const municipalities = req.body?.municipalities as string[] | undefined;
  try {
    const results = await scrapeAll(municipalities);
    res.json(results);
  } catch (err) {
    console.error('Scrape error:', err);
    res.status(500).json({ error: 'Scrape failed' });
  }
});

router.get('/scrape/status', (_req, res) => {
  res.json(getLatestScrapeStatus());
});

export default router;
