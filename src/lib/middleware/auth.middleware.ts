import { auth, currentUser } from '@clerk/nextjs/server';
import * as Sentry from '@sentry/nextjs';
import { eq } from 'drizzle-orm';
import { createMiddleware } from 'next-safe-action';

import type { ActionMetadata } from '@/lib/utils/next-safe-action';

import { ERROR_MESSAGES, SENTRY_BREADCRUMB_CATEGORIES, SENTRY_LEVELS, SENTRY_TAGS } from '@/lib/constants';
import { REDIS_KEYS, REDIS_TTL } from '@/lib/constants/redis-keys';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { UserSyncService } from '@/lib/services/user-sync.service';
import { RedisOperations } from '@/lib/utils/redis-client';

/**
 * Cached auth user data structure - minimal fields needed for auth context
 */
interface CachedAuthUser {
  email: string;
  id: string;
  username: string;
}

export const authMiddleware = createMiddleware<{
  ctx: Record<string, never>;
  metadata: ActionMetadata;
}>().define(async ({ metadata, next }) => {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
  }

  // Try to get user from Redis cache first
  let dbUser = await getCachedAuthUser(clerkUserId);

  // Cache miss - fetch from database
  if (!dbUser) {
    dbUser = await fetchAndCacheAuthUser(clerkUserId);
  }

  // Fallback: create the user if not found (handles webhook failures)
  if (!dbUser) {
    dbUser = await handleMissingUser(clerkUserId);
  }

  // Set Sentry user context
  Sentry.setUser({
    clerkId: clerkUserId,
    email: dbUser.email,
    id: dbUser.id,
    username: dbUser.username,
  });

  // Add breadcrumb for successful authentication
  Sentry.addBreadcrumb({
    category: SENTRY_BREADCRUMB_CATEGORIES.AUTH,
    data: {
      actionName: metadata?.actionName,
      userId: dbUser.id,
    },
    level: SENTRY_LEVELS.INFO,
    message: 'User authenticated successfully',
  });

  return next({
    ctx: {
      clerkUserId,
      userId: dbUser.id,
    },
  });
});

/**
 * Invalidate the auth cache for a specific Clerk user ID.
 * Should be called when user data (email, username) changes.
 *
 * @param clerkUserId - The Clerk user ID to invalidate
 */
export async function invalidateAuthCache(clerkUserId: string): Promise<void> {
  try {
    const authCacheKey = REDIS_KEYS.AUTH.USER_BY_CLERK_ID(clerkUserId);
    const adminCacheKey = REDIS_KEYS.AUTH.ADMIN_USER_BY_CLERK_ID(clerkUserId);

    await Promise.all([RedisOperations.del(authCacheKey), RedisOperations.del(adminCacheKey)]);
  } catch (error) {
    // Log but don't throw - cache invalidation errors should not break the flow
    console.error('[AuthMiddleware] Failed to invalidate auth cache:', error);
    Sentry.captureException(error, {
      extra: { clerkUserId },
      level: 'warning',
      tags: {
        [SENTRY_TAGS.COMPONENT]: 'authMiddleware',
        [SENTRY_TAGS.OPERATION]: 'cacheInvalidation',
      },
    });
  }
}

/**
 * Fetch user from database and cache in Redis.
 * Returns null if user not found in database.
 *
 * @param clerkUserId - The Clerk user ID to look up
 * @returns User data or null if not found
 */
async function fetchAndCacheAuthUser(clerkUserId: string): Promise<CachedAuthUser | null> {
  const [result] = await db
    .select({ email: users.email, id: users.id, username: users.username })
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);

  if (!result) {
    return null;
  }

  // Cache the result in Redis (non-blocking, fire-and-forget)
  const cacheKey = REDIS_KEYS.AUTH.USER_BY_CLERK_ID(clerkUserId);
  void RedisOperations.set(cacheKey, result, REDIS_TTL.AUTH).catch((error) => {
    // Log but don't fail - caching errors should not block auth
    console.error('[AuthMiddleware] Failed to cache user:', error);
  });

  return result;
}

/**
 * Get cached auth user from Redis.
 * Returns null on cache miss or Redis error (fails open).
 *
 * @param clerkUserId - The Clerk user ID to look up
 * @returns Cached user data or null if not found
 */
async function getCachedAuthUser(clerkUserId: string): Promise<CachedAuthUser | null> {
  try {
    const cacheKey = REDIS_KEYS.AUTH.USER_BY_CLERK_ID(clerkUserId);
    return await RedisOperations.get<CachedAuthUser>(cacheKey);
  } catch {
    // Fail open - Redis errors should not block authentication
    return null;
  }
}

/**
 * Handles the case when a user is authenticated with Clerk but doesn't exist in the database.
 * This can happen if the Clerk webhook failed to create the user.
 */
async function handleMissingUser(clerkUserId: string): Promise<CachedAuthUser> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error(ERROR_MESSAGES.AUTH.USER_NOT_FOUND);
  }

  try {
    // Sync user from Clerk (creates user + settings)
    const newUser = await UserSyncService.syncUserFromClerk(clerkUser, db);

    // Log warning - fallback should be rare in production
    Sentry.captureMessage('Auth middleware fallback: created user not synced by webhook', {
      extra: {
        clerkId: clerkUserId,
        userId: newUser.id,
      },
      level: SENTRY_LEVELS.WARNING,
      tags: {
        [SENTRY_TAGS.COMPONENT]: 'authMiddleware',
        [SENTRY_TAGS.OPERATION]: 'fallbackUserCreation',
      },
    });

    // Cache the newly created user
    const cachedUser = {
      email: newUser.email,
      id: newUser.id,
      username: newUser.username,
    };

    const cacheKey = REDIS_KEYS.AUTH.USER_BY_CLERK_ID(clerkUserId);
    void RedisOperations.set(cacheKey, cachedUser, REDIS_TTL.AUTH).catch((error) => {
      console.error('[AuthMiddleware] Failed to cache new user:', error);
    });

    return cachedUser;
  } catch {
    // If sync fails, check one more time (race condition handling)
    const [existingUser] = await db
      .select({ email: users.email, id: users.id, username: users.username })
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    if (existingUser) {
      // Cache the found user
      const cacheKey = REDIS_KEYS.AUTH.USER_BY_CLERK_ID(clerkUserId);
      void RedisOperations.set(cacheKey, existingUser, REDIS_TTL.AUTH).catch((error) => {
        console.error('[AuthMiddleware] Failed to cache existing user:', error);
      });

      return existingUser;
    }

    // User creation failed and still doesn't exist
    throw new Error(ERROR_MESSAGES.AUTH.USER_NOT_FOUND);
  }
}
