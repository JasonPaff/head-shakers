import { auth } from '@clerk/nextjs/server';
import * as Sentry from '@sentry/nextjs';
import { eq } from 'drizzle-orm';
import { createMiddleware } from 'next-safe-action';

import type { ActionMetadata } from '@/lib/utils/next-safe-action';

import { ERROR_MESSAGES } from '@/lib/constants';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export const authMiddleware = createMiddleware<{
  ctx: Record<string, never>;
  metadata: ActionMetadata;
}>().define(async ({ next }) => {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
  }

  // get the database user record using Clerk ID
  const [dbUser] = await db
    .select({ email: users.email, id: users.id, username: users.username })
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);

  if (!dbUser) {
    throw new Error(ERROR_MESSAGES.AUTH.USER_NOT_FOUND);
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
});
