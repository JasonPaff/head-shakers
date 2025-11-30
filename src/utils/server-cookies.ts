import { cookies } from 'next/headers';

import type { UserPreferences } from '@/hooks/use-user-preferences';

import { cookieConstants } from '@/constants/cookies';

/**
 * Get user preferences from cookie in server components
 * Uses next/headers cookies() for server-side access
 */
export async function getUserPreferences(): Promise<UserPreferences> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(cookieConstants.userPreferences.name)?.value;

  if (!raw) return {};

  try {
    return JSON.parse(raw) as UserPreferences;
  } catch {
    return {};
  }
}
