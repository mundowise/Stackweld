/**
 * Preferences — Persistent user preferences stored in SQLite.
 */

import { getDatabase } from "../db/database.js";

export interface UserPreferences {
  editor: string;
  packageManager: string;
  shell: string;
  dockerMode: string;
  defaultProfile: string;
  theme: string;
}

const DEFAULTS: UserPreferences = {
  editor: "code",
  packageManager: "pnpm",
  shell: "zsh",
  dockerMode: "compose",
  defaultProfile: "standard",
  theme: "dark",
};

function ensureTable(): void {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS preferences (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}

/** Get all preferences, merged with defaults. */
export function getPreferences(): UserPreferences {
  ensureTable();
  const db = getDatabase();
  const rows = db.prepare("SELECT key, value FROM preferences").all() as {
    key: string;
    value: string;
  }[];

  const prefs = { ...DEFAULTS };
  for (const row of rows) {
    if (row.key in prefs) {
      (prefs as Record<string, string>)[row.key] = row.value;
    }
  }
  return prefs;
}

/** Get a single preference. */
export function getPreference(key: keyof UserPreferences): string {
  ensureTable();
  const db = getDatabase();
  const row = db.prepare("SELECT value FROM preferences WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? DEFAULTS[key];
}

/** Set a single preference. */
export function setPreference(key: keyof UserPreferences, value: string): void {
  ensureTable();
  const db = getDatabase();
  db.prepare("INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?)").run(key, value);
}

/** Reset all preferences to defaults. */
export function resetPreferences(): void {
  ensureTable();
  const db = getDatabase();
  db.prepare("DELETE FROM preferences").run();
}

/** Get the list of valid preference keys. */
export function getPreferenceKeys(): (keyof UserPreferences)[] {
  return Object.keys(DEFAULTS) as (keyof UserPreferences)[];
}

/** Get default values. */
export function getDefaultPreferences(): UserPreferences {
  return { ...DEFAULTS };
}
