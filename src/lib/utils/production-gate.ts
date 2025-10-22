import { auth } from '@clerk/nextjs/server';

import { UsersFacade } from '@/lib/facades/users/users.facade';

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

    const user = await UsersFacade.getUserByClerkId(clerkUserId);
    if (!user) return false;

    // get authorized admin email from environment variable
    const authorizedEmail = process.env.AUTHORIZED_ADMIN_EMAIL || 'jasonpaff@gmail.com';

    // check if a user's email matches the authorized admin email
    return user?.email === authorizedEmail;
  } catch {
    // if anything fails, deny access
    return false;
  }
};
