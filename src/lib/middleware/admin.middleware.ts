import { auth } from '@clerk/nextjs/server';
import * as Sentry from '@sentry/nextjs';
import { eq } from 'drizzle-orm';
import { createMiddleware } from 'next-safe-action';

import type { UserRole } from '@/lib/constants/enums';
import type { MiddlewareErrorContext } from '@/lib/utils/error-types';
import type { ActionMetadata } from '@/lib/utils/next-safe-action';

import { ERROR_MESSAGES, SENTRY_BREADCRUMB_CATEGORIES, SENTRY_LEVELS, SENTRY_TAGS } from '@/lib/constants';
import { REDIS_KEYS, REDIS_TTL } from '@/lib/constants/redis-keys';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { createMiddlewareError } from '@/lib/utils/error-builders';
import { ActionError } from '@/lib/utils/errors';
import { RedisOperations } from '@/lib/utils/redis-client';

/**
 * Cached admin user data structure - includes role for authorization
 */
interface CachedAdminUser {
  email: string;
  id: string;
  role: UserRole;
  username: string;
}

export const adminMiddleware = createMiddleware<{
  ctx: Record<string, never>;
  metadata: ActionMetadata;
}>().define(async ({ metadata, next }) => {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      const context: MiddlewareErrorContext = {
        actionName: metadata?.actionName,
        middleware: 'adminMiddleware',
        operation: 'authenticate',
      };
      throw createMiddlewareError(context, new Error(ERROR_MESSAGES.AUTH.UNAUTHORIZED));
    }

    // Try to get user from Redis cache first
    let dbUser = await getCachedAdminUser(clerkUserId);

    // Cache miss - fetch from database
    if (!dbUser) {
      dbUser = await fetchAndCacheAdminUser(clerkUserId);
    }

    if (!dbUser) {
      const context: MiddlewareErrorContext = {
        actionName: metadata?.actionName,
        middleware: 'adminMiddleware',
        operation: 'userLookup',
      };
      throw createMiddlewareError(context, new Error(ERROR_MESSAGES.AUTH.USER_NOT_FOUND));
    }

    // check if the user has admin privileges
    if (dbUser.role !== 'admin' && dbUser.role !== 'moderator') {
      const context: MiddlewareErrorContext = {
        actionName: metadata?.actionName,
        middleware: 'adminMiddleware',
        operation: 'authorization',
      };
      throw createMiddlewareError(context, new Error(ERROR_MESSAGES.AUTH.INSUFFICIENT_PERMISSIONS));
    }

    // automatically set Sentry user context with role information
    Sentry.setUser({
      clerkId: clerkUserId,
      email: dbUser.email,
      id: dbUser.id,
      role: dbUser.role,
      username: dbUser.username,
    });

    // Add breadcrumb for successful admin authentication
    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.AUTH,
      data: {
        actionName: metadata?.actionName,
        role: dbUser.role,
        userId: dbUser.id,
      },
      level: SENTRY_LEVELS.INFO,
      message: 'Admin user authenticated successfully',
    });

    return next({
      ctx: {
        clerkUserId,
        isAdmin: dbUser.role === 'admin',
        isModerator: dbUser.role === 'moderator',
        role: dbUser.role,
        userId: dbUser.id,
      },
    });
  } catch (error) {
    // Re-throw if it's already an ActionError (from createMiddlewareError)
    if (error instanceof ActionError) {
      throw error;
    }

    const context: MiddlewareErrorContext = {
      actionName: metadata?.actionName,
      middleware: 'adminMiddleware',
      operation: 'unknown',
    };
    throw createMiddlewareError(context, error);
  }
});

/**
 * Fetch user from database and cache in Redis.
 * Returns null if user not found in database.
 *
 * @param clerkUserId - The Clerk user ID to look up
 * @returns User data or null if not found
 */
async function fetchAndCacheAdminUser(clerkUserId: string): Promise<CachedAdminUser | null> {
  const [result] = await db
    .select({
      email: users.email,
      id: users.id,
      role: users.role,
      username: users.username,
    })
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);

  if (!result) {
    return null;
  }

  // Cache the result in Redis (non-blocking, fire-and-forget)
  const cacheKey = REDIS_KEYS.AUTH.ADMIN_USER_BY_CLERK_ID(clerkUserId);
  void RedisOperations.set(cacheKey, result, REDIS_TTL.AUTH).catch((error) => {
    // Log but don't fail - caching errors should not block auth
    Sentry.captureException(error, {
      extra: { clerkUserId, operation: 'cacheAdminUser' },
      level: 'warning',
      tags: {
        [SENTRY_TAGS.COMPONENT]: 'adminMiddleware',
        [SENTRY_TAGS.OPERATION]: 'cacheSet',
      },
    });
  });

  return result;
}

/**
 * Get cached admin user from Redis.
 * Returns null on cache miss or Redis error (fails open).
 *
 * @param clerkUserId - The Clerk user ID to look up
 * @returns Cached user data or null if not found
 */
async function getCachedAdminUser(clerkUserId: string): Promise<CachedAdminUser | null> {
  try {
    const cacheKey = REDIS_KEYS.AUTH.ADMIN_USER_BY_CLERK_ID(clerkUserId);
    return await RedisOperations.get<CachedAdminUser>(cacheKey);
  } catch {
    // Fail open - Redis errors should not block authentication
    return null;
  }
}
