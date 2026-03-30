/**
 * Database — SQLite persistence layer for stacks, projects, and versions.
 * Uses better-sqlite3 for synchronous, reliable access.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import Database from "better-sqlite3";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS stacks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  profile TEXT NOT NULL DEFAULT 'standard',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  tags TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS stack_technologies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stack_id TEXT NOT NULL REFERENCES stacks(id) ON DELETE CASCADE,
  technology_id TEXT NOT NULL,
  version TEXT NOT NULL,
  port INTEGER,
  config TEXT DEFAULT '{}',
  UNIQUE(stack_id, technology_id)
);

CREATE TABLE IF NOT EXISTS stack_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stack_id TEXT NOT NULL REFERENCES stacks(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  changelog TEXT NOT NULL DEFAULT '',
  snapshot TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(stack_id, version)
);

CREATE TABLE IF NOT EXISTS project_instances (
  id TEXT PRIMARY KEY,
  stack_id TEXT NOT NULL REFERENCES stacks(id),
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  template_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_opened_at TEXT
);

CREATE TABLE IF NOT EXISTS project_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL REFERENCES project_instances(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  technology_id TEXT,
  port INTEGER,
  docker_container_id TEXT,
  status TEXT DEFAULT 'not_started',
  UNIQUE(project_id, service_name)
);

CREATE TABLE IF NOT EXISTS user_tech_notes (
  tech_id TEXT PRIMARY KEY,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  notes TEXT DEFAULT '',
  last_used_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_stack_tech_stack ON stack_technologies(stack_id);
CREATE INDEX IF NOT EXISTS idx_stack_versions_stack ON stack_versions(stack_id);
CREATE INDEX IF NOT EXISTS idx_projects_stack ON project_instances(stack_id);
CREATE INDEX IF NOT EXISTS idx_project_services_project ON project_services(project_id);

CREATE TABLE IF NOT EXISTS custom_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  profile TEXT NOT NULL DEFAULT 'standard',
  technology_ids TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

let db: Database.Database | null = null;

export function getDatabase(dbPath?: string): Database.Database {
  if (db) return db;

  const resolvedPath = dbPath || getDefaultDbPath();
  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(resolvedPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);

  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function getDefaultDbPath(): string {
  const home = process.env.HOME || process.env.USERPROFILE || ".";
  return path.join(home, ".stackweld", "stackweld.db");
}
