import { eq } from 'drizzle-orm';
import { cache } from 'react';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getClerkIdAsync } from '@/utils/auth-utils';

/**
 * Check if the current user has moderator or admin privileges.
 * Uses React cache() for request-level deduplication.
 */
export const checkIsModerator = cache(async (): Promise<boolean> => {
  try {
    const clerkUserId = await getClerkIdAsync();
    if (!clerkUserId) return false;

    const [dbUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    return dbUser?.role === 'admin' || dbUser?.role === 'moderator';
  } catch {
    return false;
  }
});

/**
 * Get the current user with role information.
 * Uses React cache() for request-level deduplication.
 */
export const getCurrentUserWithRole = cache(async () => {
  try {
    const clerkUserId = await getClerkIdAsync();
    if (!clerkUserId) return null;

    const [dbUser] = await db
      .select({
        email: users.email,
        id: users.id,
        role: users.role,
        username: users.username,
      })
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    if (!dbUser) return null;

    return {
      ...dbUser,
      clerkId: clerkUserId,
      isAdmin: dbUser.role === 'admin',
      isModerator: dbUser.role === 'moderator' || dbUser.role === 'admin',
    };
  } catch {
    return null;
  }
});

/**
 * Moderator action wrapper that throws if a user doesn't have moderator privileges
 */
export const requireModerator = async () => {
  const isModerator = await checkIsModerator();
  if (!isModerator) {
    throw new Error('Moderator privileges required');
  }
};
