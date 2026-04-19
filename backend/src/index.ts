import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { getDb } from './db/schema.js';
import apiRoutes from './api/routes.js';
import { scrapeAll } from './scrapers/scraper-manager.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

// Initialize database
getDb();

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Serve frontend in production
const frontendDist = resolve(__dirname, '../../frontend/dist');
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(resolve(frontendDist, 'index.html'));
  });
}

// Schedule scraping every 4 hours
cron.schedule('0 */4 * * *', async () => {
  console.log('[cron] Starting scheduled scrape...');
  try {
    const results = await scrapeAll();
    const total = results.reduce((sum, r) => sum + r.found, 0);
    console.log(`[cron] Scrape complete: ${total} vacancies`);
  } catch (err) {
    console.error('[cron] Scrape failed:', err);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
