import { auth } from '@clerk/nextjs/server';
import { $path } from 'next-typesafe-url';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { UsersFacade } from '@/lib/facades/users/users.facade';

/**
 * Get the current Clerk user ID with request-level deduplication.
 * React cache() ensures this is only called once per request even if
 * invoked multiple times in the component tree.
 */
export const getCurrentClerkUserId = cache(async (): Promise<null | string> => {
  try {
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
});

/**
 * Get the current database user ID with request-level deduplication.
 * Combines Clerk auth lookup with database user resolution.
 */
export const getUserIdAsync = cache(async (): Promise<null | string> => {
  try {
    const clerkUserId = await getCurrentClerkUserId();
    if (!clerkUserId) return null;

    // get the database user record using Clerk ID
    const userId = await UsersFacade.getUserIdByClerkIdAsync(clerkUserId);
    if (!userId) return null;

    return userId;
  } catch {
    return null;
  }
});

/**
 * Get the current database user ID with request-level deduplication.
 * Redirects to home if not authenticated or user not found in the database.
 */
export const getRequiredUserIdAsync = cache(async (): Promise<string> => {
  const clerkUserId = await getCurrentClerkUserId();
  if (!clerkUserId) redirect($path({ route: '/' }));

  // get the database user record using Clerk ID
  const userId = await UsersFacade.getUserIdByClerkIdAsync(clerkUserId);
  if (!userId) redirect($path({ route: '/' }));

  return userId;
});

/**
 * Check if the current user is the owner of a resource
 * @param resourceUserId - The user ID of the resource owner
 * @returns True if the current user is the owner, false otherwise
 */
export const getIsOwnerAsync = async (resourceUserId?: null | string): Promise<boolean> => {
  if (!resourceUserId) return false;

  const currentUserId = await getUserIdAsync();
  if (!currentUserId) return false;

  return currentUserId === resourceUserId;
};
