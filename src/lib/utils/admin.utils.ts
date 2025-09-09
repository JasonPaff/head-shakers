import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

/**
 * Check if the current user has moderator or admin privileges
 */
export const checkIsModerator = async (): Promise<boolean> => {
  try {
    const { userId: clerkUserId } = await auth();
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
};

/**
 * Get the current user with role information
 */
export const getCurrentUserWithRole = async () => {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return null;

    const [dbUser] = await db
      .select({
        displayName: users.displayName,
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
};

/**
 * Moderator action wrapper that throws if a user doesn't have moderator privileges
 */
export const requireModerator = async () => {
  const isModerator = await checkIsModerator();
  if (!isModerator) {
    throw new Error('Moderator privileges required');
  }
};
