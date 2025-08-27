import { auth } from '@clerk/nextjs/server';
import * as Sentry from '@sentry/nextjs';
import { eq } from 'drizzle-orm';
import { createMiddleware } from 'next-safe-action';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export const authMiddleware = createMiddleware().define(async ({ next }) => {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error('Unauthorized');
  }

  // get the database user record using Clerk ID
  const [dbUser] = await db
    .select({ email: users.email, id: users.id, username: users.username })
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);

  if (!dbUser) {
    throw new Error('User not found in database');
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
