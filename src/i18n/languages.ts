export type AppLanguage = 'ku' | 'en';

const RTL_LANGUAGES: AppLanguage[] = ['ku'];

export function isRtlLanguage(language: AppLanguage): boolean {
  return RTL_LANGUAGES.includes(language);
}

export function normalizeLanguage(value: unknown): AppLanguage {
  return value === 'en' ? 'en' : 'ku';
}
