import Database from 'better-sqlite3';
import { MUNICIPALITIES } from '@application-finder/shared/src/types.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || resolve(__dirname, '../../data/vacancies.db');

mkdirSync(dirname(DB_PATH), { recursive: true });

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS municipalities (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_url  TEXT NOT NULL,
      logo_url    TEXT,
      lat         REAL NOT NULL,
      lng         REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vacancies (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      external_id       TEXT NOT NULL,
      municipality_id   TEXT NOT NULL REFERENCES municipalities(id),
      title             TEXT NOT NULL,
      department        TEXT,
      location          TEXT,
      description       TEXT,
      description_plain TEXT,
      salary_min        REAL,
      salary_max        REAL,
      salary_scale      TEXT,
      salary_raw        TEXT,
      hours_per_week    REAL,
      education_level   TEXT,
      employment_type   TEXT,
      closing_date      TEXT,
      published_date    TEXT,
      source_url        TEXT NOT NULL,
      contact_name      TEXT,
      contact_email     TEXT,
      contact_phone     TEXT,
      scraped_at        TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at        TEXT NOT NULL DEFAULT (datetime('now')),
      is_active         INTEGER NOT NULL DEFAULT 1,
      UNIQUE(external_id, municipality_id)
    );

    CREATE INDEX IF NOT EXISTS idx_vacancies_municipality ON vacancies(municipality_id);
    CREATE INDEX IF NOT EXISTS idx_vacancies_closing_date ON vacancies(closing_date);
    CREATE INDEX IF NOT EXISTS idx_vacancies_active ON vacancies(is_active);

    CREATE TABLE IF NOT EXISTS scrape_log (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      municipality_id   TEXT NOT NULL,
      started_at        TEXT NOT NULL,
      finished_at       TEXT,
      status            TEXT NOT NULL,
      vacancies_found   INTEGER DEFAULT 0,
      vacancies_new     INTEGER DEFAULT 0,
      vacancies_updated INTEGER DEFAULT 0,
      error_message     TEXT
    );
  `);

  // Create FTS5 table if it doesn't exist
  try {
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS vacancies_fts USING fts5(
        title, department, description_plain, municipality_id,
        content='vacancies',
        content_rowid='id'
      );
    `);
  } catch {
    // FTS table already exists with different schema, ignore
  }

  // Create triggers for FTS sync (use IF NOT EXISTS via try/catch)
  const triggers = [
    `CREATE TRIGGER vacancies_ai AFTER INSERT ON vacancies BEGIN
      INSERT INTO vacancies_fts(rowid, title, department, description_plain, municipality_id)
      VALUES (new.id, new.title, new.department, new.description_plain, new.municipality_id);
    END;`,
    `CREATE TRIGGER vacancies_ad AFTER DELETE ON vacancies BEGIN
      INSERT INTO vacancies_fts(vacancies_fts, rowid, title, department, description_plain, municipality_id)
      VALUES ('delete', old.id, old.title, old.department, old.description_plain, old.municipality_id);
    END;`,
    `CREATE TRIGGER vacancies_au AFTER UPDATE ON vacancies BEGIN
      INSERT INTO vacancies_fts(vacancies_fts, rowid, title, department, description_plain, municipality_id)
      VALUES ('delete', old.id, old.title, old.department, old.description_plain, old.municipality_id);
      INSERT INTO vacancies_fts(rowid, title, department, description_plain, municipality_id)
      VALUES (new.id, new.title, new.department, new.description_plain, new.municipality_id);
    END;`,
  ];

  for (const trigger of triggers) {
    try {
      db.exec(trigger);
    } catch {
      // Trigger already exists, ignore
    }
  }

  // Seed municipalities
  const upsert = db.prepare(`
    INSERT INTO municipalities (id, name, source_type, source_url, lat, lng)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      source_type = excluded.source_type,
      source_url = excluded.source_url,
      lat = excluded.lat,
      lng = excluded.lng
  `);

  const seedAll = db.transaction(() => {
    for (const m of MUNICIPALITIES) {
      upsert.run(m.id, m.name, m.sourceType, m.sourceUrl, m.lat, m.lng);
    }
  });
  seedAll();
}
