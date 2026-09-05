import { create } from 'zustand';

import type { AppSettings } from '../domain/entities/types';
import * as settingsRepo from '../data/repositories/settingsRepository';
import { changeLanguage, initI18n, normalizeLanguage, type AppLanguage } from '../i18n';

interface SettingsStore {
  settings: AppSettings;
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  setLanguage: (lang: AppLanguage) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: {
    language: 'ku',
    theme: 'system',
    defaultReminderType: 'alarm',
    defaultSnoozeMinutes: 15,
    weekStartsOn: 6,
    timeFormat: '12h',
    onboardingComplete: false,
    notificationsEnabled: true,
    vibrationEnabled: true,
  },
  isLoaded: false,

  loadSettings: async () => {
    const loaded = await settingsRepo.getSettings();
    const language = normalizeLanguage(loaded.language);
    const settings: AppSettings = {
      ...loaded,
      language,
      defaultReminderType:
        loaded.defaultReminderType === 'notification' ? 'alarm' : loaded.defaultReminderType,
    };
    if (loaded.language !== language || loaded.defaultReminderType === 'notification') {
      await settingsRepo.updateSettings({
        language,
        defaultReminderType: settings.defaultReminderType,
      });
    }
    await initI18n(language);
    set({ settings, isLoaded: true });
  },

  updateSettings: async (partial) => {
    const next = { ...partial };
    if (next.language) next.language = normalizeLanguage(next.language);
    await settingsRepo.updateSettings(next);
    set({ settings: { ...get().settings, ...next } });
  },

  setLanguage: async (lang) => {
    const language = normalizeLanguage(lang);
    await get().updateSettings({ language });
    await changeLanguage(language);
  },
}));
