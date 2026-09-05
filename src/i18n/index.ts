import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { setLayoutLanguage } from '../theme/rtl';
import en from './en.json';
import ku from './ku.json';
import { normalizeLanguage, type AppLanguage } from './languages';

export type { AppLanguage } from './languages';
export { isRtlLanguage, normalizeLanguage } from './languages';

export async function initI18n(language: AppLanguage = 'ku') {
  const lng = normalizeLanguage(language);
  setLayoutLanguage(lng);

  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      resources: {
        ku: { translation: ku },
        en: { translation: en },
      },
      lng,
      fallbackLng: 'ku',
      interpolation: { escapeValue: false },
    });
  } else {
    await i18n.changeLanguage(lng);
  }

  return i18n;
}

export async function changeLanguage(language: AppLanguage) {
  const lng = normalizeLanguage(language);
  setLayoutLanguage(lng);
  await i18n.changeLanguage(lng);
}

export default i18n;
