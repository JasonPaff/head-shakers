export const cookieConstants = {
  language: {
    defaultValue: 'en',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    name: 'head-shakers-language',
  },
  sidebar: {
    defaultValue: 'expanded',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    name: 'head-shakers-sidebar-state',
  },
  theme: {
    defaultValue: 'system',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    name: 'head-shakers-theme',
  },
  userPreferences: {
    defaultValue: '{}',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    name: 'head-shakers-user-preferences',
  },
} as const;

export type CookieKey = keyof typeof cookieConstants;
export type CookieValue<T extends CookieKey> = (typeof cookieConstants)[T]['defaultValue'];
