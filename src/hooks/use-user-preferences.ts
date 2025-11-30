'use client';

import { getCookie, setCookie } from 'cookies-next';
import { useCallback, useState } from 'react';

import { cookieConstants } from '@/constants/cookies';

export type CollectionCardStyle = 'compact' | 'cover' | 'detailed';

export type CollectionSortOption =
  | 'comments-desc'
  | 'count-asc'
  | 'count-desc'
  | 'likes-desc'
  | 'name-asc'
  | 'name-desc'
  | 'value-asc'
  | 'value-desc'
  | 'views-desc';

export type UserPreferences = {
  collectionSidebarSort?: CollectionSortOption;
  collectionSidebarView?: CollectionCardStyle;
};

const COOKIE_CONFIG = cookieConstants.userPreferences;

export function useUserPreferences(initialPreferences?: UserPreferences) {
  const [preferences, setPreferencesState] = useState<UserPreferences>(() => {
    // If initial preferences provided (from server), use those
    if (initialPreferences) return initialPreferences;
    // Otherwise try to read from cookie (client-side fallback)
    const raw = getCookie(COOKIE_CONFIG.name) as string | undefined;
    return parsePreferences(raw);
  });

  const setPreference = useCallback(<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferencesState((prev) => {
      const updated = { ...prev, [key]: value };
      // Persist to cookie
      void setCookie(COOKIE_CONFIG.name, serializePreferences(updated), {
        maxAge: COOKIE_CONFIG.maxAge,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return updated;
    });
  }, []);

  const setPreferences = useCallback((newPreferences: UserPreferences) => {
    setPreferencesState(newPreferences);
    void setCookie(COOKIE_CONFIG.name, serializePreferences(newPreferences), {
      maxAge: COOKIE_CONFIG.maxAge,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }, []);

  const clearPreferences = useCallback(() => {
    setPreferencesState({});
    void setCookie(COOKIE_CONFIG.name, '{}', {
      maxAge: COOKIE_CONFIG.maxAge,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }, []);

  return {
    clearPreferences,
    preferences,
    setPreference,
    setPreferences,
  } as const;
}

function parsePreferences(raw: string | undefined): UserPreferences {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as UserPreferences;
  } catch {
    return {};
  }
}

function serializePreferences(preferences: UserPreferences): string {
  return JSON.stringify(preferences);
}
