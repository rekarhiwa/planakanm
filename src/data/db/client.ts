import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';

import * as schema from './schema';

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  time TEXT,
  has_time INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'normal',
  category_id TEXT,
  repeat_type TEXT NOT NULL DEFAULT 'none',
  repeat_rule TEXT,
  reminder_type TEXT NOT NULL DEFAULT 'notification',
  reminder_sound TEXT,
  notification_id TEXT,
  snoozed_until TEXT,
  original_scheduled_at TEXT,
  completed_at TEXT,
  deleted_at TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS plans_date_status_idx ON plans(date, status);
CREATE INDEX IF NOT EXISTS plans_snoozed_idx ON plans(snoozed_until);
CREATE INDEX IF NOT EXISTS plans_status_idx ON plans(status);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS plan_history (
  id TEXT PRIMARY KEY NOT NULL,
  plan_id TEXT NOT NULL,
  action TEXT NOT NULL,
  from_value TEXT,
  to_value TEXT,
  timestamp INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS history_plan_idx ON plan_history(plan_id);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`;

export async function initDatabase() {
  const sqlite = await SQLite.openDatabaseAsync('planakanm.db');
  await sqlite.execAsync(MIGRATION_SQL);
  dbInstance = drizzle(sqlite, { schema });
  return dbInstance;
}

export function getDb() {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return dbInstance;
}
