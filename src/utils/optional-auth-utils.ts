import { auth } from '@clerk/nextjs/server';
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
export const getOptionalUserId = cache(async (): Promise<null | string> => {
  try {
    const clerkUserId = await getCurrentClerkUserId();

    if (!clerkUserId) return null;

    // get the database user record using Clerk ID
    const dbUser = await UsersFacade.getUserByClerkId(clerkUserId);
    if (!dbUser) return null;

    return dbUser.id;
  } catch {
    return null;
  }
});

export const checkIsOwner = async (resourceUserId?: null | string): Promise<boolean> => {
  if (!resourceUserId) return false;

  const currentUserId = await getOptionalUserId();
  if (!currentUserId) return false;

  return currentUserId === resourceUserId;
};
