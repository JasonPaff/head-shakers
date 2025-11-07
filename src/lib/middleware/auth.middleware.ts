import { auth, currentUser } from '@clerk/nextjs/server';
import * as Sentry from '@sentry/nextjs';
import { eq } from 'drizzle-orm';
import { createMiddleware } from 'next-safe-action';

import type { MiddlewareErrorContext } from '@/lib/utils/error-types';
import type { ActionMetadata } from '@/lib/utils/next-safe-action';

import { ERROR_MESSAGES } from '@/lib/constants';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { UserSyncService } from '@/lib/services/user-sync.service';
import { createMiddlewareError } from '@/lib/utils/error-builders';

export const authMiddleware = createMiddleware<{
  ctx: Record<string, never>;
  metadata: ActionMetadata;
}>().define(async ({ metadata, next }) => {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      const context: MiddlewareErrorContext = {
        actionName: metadata?.actionName,
        middleware: 'authMiddleware',
        operation: 'authenticate',
      };
      throw createMiddlewareError(context, new Error(ERROR_MESSAGES.AUTH.UNAUTHORIZED));
    }

    // get the database user record using Clerk ID
    let [dbUser] = await db
      .select({ email: users.email, id: users.id, username: users.username })
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    // fallback: create the user if not found (handles webhook failures)
    if (!dbUser) {
      try {
        // get full user data from Clerk
        const clerkUser = await currentUser();

        if (!clerkUser) {
          const context: MiddlewareErrorContext = {
            actionName: metadata?.actionName,
            middleware: 'authMiddleware',
            operation: 'userLookup',
          };
          throw createMiddlewareError(context, new Error(ERROR_MESSAGES.AUTH.USER_NOT_FOUND));
        }

        // sync user from Clerk (creates user + settings)
        const newUser = await UserSyncService.syncUserFromClerk(clerkUser, db);

        dbUser = {
          email: newUser.email,
          id: newUser.id,
          username: newUser.username,
        };

        // log warning - fallback should be rare in production
        Sentry.captureMessage('Auth middleware fallback: created user not synced by webhook', {
          extra: {
            clerkId: clerkUserId,
            userId: newUser.id,
          },
          level: 'warning',
          tags: {
            component: 'authMiddleware',
            operation: 'fallbackUserCreation',
          },
        });
      } catch (syncError) {
        // if sync fails, check one more time (race condition handling)
        const [existingUser] = await db
          .select({ email: users.email, id: users.id, username: users.username })
          .from(users)
          .where(eq(users.clerkId, clerkUserId))
          .limit(1);

        if (existingUser) {
          dbUser = existingUser;
        } else {
          // user creation failed and still doesn't exist
          const context: MiddlewareErrorContext = {
            actionName: metadata?.actionName,
            middleware: 'authMiddleware',
            operation: 'fallbackUserCreation',
          };
          throw createMiddlewareError(context, syncError);
        }
      }
    }

    // automatically set Sentry user context
    Sentry.setUser({
      clerkId: clerkUserId,
      email: dbUser.email,
      id: dbUser.id,
      username: dbUser.username,
    });

    return next({
      ctx: {
        clerkUserId,
        userId: dbUser.id,
      },
    });
  } catch (error) {
    // Re-throw if it's already a handled middleware error
    if (error instanceof Error && error.message.includes('middleware')) {
      throw error;
    }

    const context: MiddlewareErrorContext = {
      actionName: metadata?.actionName,
      middleware: 'authMiddleware',
      operation: 'unknown',
    };
    throw createMiddlewareError(context, error);
  }
});
