import { create } from 'zustand';

import type { AppSettings } from '../domain/entities/types';
import * as settingsRepo from '../data/repositories/settingsRepository';
import { changeLanguage, type AppLanguage } from '../i18n';

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
    defaultReminderType: 'notification',
    defaultSnoozeMinutes: 15,
    weekStartsOn: 6,
    timeFormat: '24h',
    onboardingComplete: false,
    notificationsEnabled: true,
    vibrationEnabled: true,
  },
  isLoaded: false,

  loadSettings: async () => {
    const settings = await settingsRepo.getSettings();
    await changeLanguage(settings.language);
    set({ settings, isLoaded: true });
  },

  updateSettings: async (partial) => {
    await settingsRepo.updateSettings(partial);
    set({ settings: { ...get().settings, ...partial } });
  },

  setLanguage: async (lang) => {
    await changeLanguage(lang);
    await get().updateSettings({ language: lang });
  },
}));
