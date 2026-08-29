export type AboutPageId = 'app' | 'features' | 'notifications' | 'privacy' | 'terms';

export const ABOUT_PAGE_ORDER: AboutPageId[] = [
  'app',
  'features',
  'notifications',
  'privacy',
  'terms',
];

export const ABOUT_PAGE_I18N: Record<AboutPageId, { title: string; content: string }> = {
  app: { title: 'about.pages.app', content: 'about.content.app' },
  features: { title: 'about.pages.features', content: 'about.content.features' },
  notifications: { title: 'about.pages.notifications', content: 'about.content.notifications' },
  privacy: { title: 'about.pages.privacy', content: 'about.content.privacy' },
  terms: { title: 'about.pages.terms', content: 'about.content.terms' },
};
