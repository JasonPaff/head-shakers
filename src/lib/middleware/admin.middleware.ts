import { auth } from '@clerk/nextjs/server';
import * as Sentry from '@sentry/nextjs';
import { eq } from 'drizzle-orm';
import { createMiddleware } from 'next-safe-action';

import type { ActionMetadata } from '@/lib/utils/next-safe-action';

import { ERROR_MESSAGES } from '@/lib/constants';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export const adminMiddleware = createMiddleware<{
  ctx: Record<string, never>;
  metadata: ActionMetadata;
}>().define(async ({ next }) => {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
  }

  // get the database user record using Clerk ID, including role
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

  if (!dbUser) {
    throw new Error(ERROR_MESSAGES.AUTH.USER_NOT_FOUND);
  }

  // check if the user has admin privileges
  if (dbUser.role !== 'admin' && dbUser.role !== 'moderator') {
    throw new Error(ERROR_MESSAGES.AUTH.INSUFFICIENT_PERMISSIONS);
  }

  // automatically set Sentry user context with role information
  Sentry.setUser({
    clerkId: clerkUserId,
    email: dbUser.email,
    id: dbUser.id,
    role: dbUser.role,
    username: dbUser.username,
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
});
