import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import ar from './ar.json';
import en from './en.json';
import ku from './ku.json';

export type AppLanguage = 'ku' | 'ar' | 'en';

const RTL_LANGUAGES: AppLanguage[] = ['ku', 'ar'];

export async function initI18n(language: AppLanguage = 'ku') {
  const isRtl = RTL_LANGUAGES.includes(language);
  if (I18nManager.isRTL !== isRtl) {
    I18nManager.allowRTL(isRtl);
    I18nManager.forceRTL(isRtl);
  }

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

  return i18n;
}

export async function changeLanguage(language: AppLanguage) {
  const isRtl = RTL_LANGUAGES.includes(language);
  I18nManager.allowRTL(isRtl);
  I18nManager.forceRTL(isRtl);
  await i18n.changeLanguage(language);
}

export default i18n;
