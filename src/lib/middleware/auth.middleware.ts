import { auth } from '@clerk/nextjs/server';
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
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);

  if (!dbUser) {
    throw new Error('User not found in database');
  }

  return next({
    ctx: {
      clerkUserId,
      userId: dbUser.id,
    },
  });
});
