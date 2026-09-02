import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { setLayoutLanguage } from '../theme/rtl';
import ar from './ar.json';
import en from './en.json';
import ku from './ku.json';

export type { AppLanguage } from './languages';
export { isRtlLanguage } from './languages';
import type { AppLanguage } from './languages';

export async function initI18n(language: AppLanguage = 'ku') {
  setLayoutLanguage(language);

  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      resources: {
        ku: { translation: ku },
        ar: { translation: ar },
        en: { translation: en },
      },
      lng: language,
      fallbackLng: 'ku',
      interpolation: { escapeValue: false },
    });
  } else {
    await i18n.changeLanguage(language);
  }

  return i18n;
}

export async function changeLanguage(language: AppLanguage) {
  setLayoutLanguage(language);
  await i18n.changeLanguage(language);
}

export default i18n;
