import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

/**
 * Check if the current user is an authorized admin for production access.
 * This is used to gate the production site during testing/development.
 *
 * @returns Promise<boolean> - true if user is authorized, false otherwise
 */
export const isAuthorizedAdmin = async (): Promise<boolean> => {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return false;

    // get authorized admin email from environment variable
    const authorizedEmail = process.env.AUTHORIZED_ADMIN_EMAIL || 'jasonpaff@gmail.com';

    const [dbUser] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    // check if a user's email matches the authorized admin email
    return dbUser?.email === authorizedEmail;
  } catch {
    // if anything fails, deny access
    return false;
  }
};
