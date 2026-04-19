import { getDb } from './db/schema.js';
import { scrapeAll } from './scrapers/scraper-manager.js';

// Initialize DB
getDb();

console.log('Starting scrape of all municipalities...\n');

const results = await scrapeAll();

console.log('\n=== Scrape Results ===');
for (const r of results) {
  const status = r.status === 'success' ? '✓' : '✗';
  console.log(`${status} ${r.municipalityId}: ${r.found} found (${r.new} new, ${r.updated} updated)${r.error ? ` - Error: ${r.error}` : ''}`);
}

const total = results.reduce((sum, r) => sum + r.found, 0);
console.log(`\nTotal: ${total} vacancies scraped`);
