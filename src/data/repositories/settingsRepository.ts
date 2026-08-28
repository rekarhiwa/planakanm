import { eq } from 'drizzle-orm';

import type { AppSettings } from '../../domain/entities/types';
import { getDb } from '../db/client';
import { settings } from '../db/schema';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'ku',
  theme: 'system',
  defaultReminderType: 'notification',
  defaultSnoozeMinutes: 15,
  weekStartsOn: 6,
  timeFormat: '24h',
  onboardingComplete: false,
  notificationsEnabled: true,
  vibrationEnabled: true,
};

export async function getSettings(): Promise<AppSettings> {
  const db = getDb();
  const rows = await db.select().from(settings);
  if (rows.length === 0) return { ...DEFAULT_SETTINGS };

  const stored: Partial<AppSettings> = {};
  for (const row of rows) {
    try {
      (stored as Record<string, unknown>)[row.key] = JSON.parse(row.value);
    } catch {
      (stored as Record<string, unknown>)[row.key] = row.value;
    }
  }
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function updateSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K],
): Promise<void> {
  const db = getDb();
  const jsonValue = JSON.stringify(value);
  const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);

  if (existing.length > 0) {
    await db.update(settings).set({ value: jsonValue }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value: jsonValue });
  }
}

export async function updateSettings(partial: Partial<AppSettings>): Promise<void> {
  for (const [key, value] of Object.entries(partial)) {
    await updateSetting(key as keyof AppSettings, value as AppSettings[keyof AppSettings]);
  }
}
