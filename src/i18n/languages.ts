export type AppLanguage = 'ku' | 'ar' | 'en';

const RTL_LANGUAGES: AppLanguage[] = ['ku', 'ar'];

export function isRtlLanguage(language: AppLanguage): boolean {
  return RTL_LANGUAGES.includes(language);
}
