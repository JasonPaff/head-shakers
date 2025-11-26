import { $path } from 'next-typesafe-url';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { UsersFacade } from '@/lib/facades/users/users.facade';
import { getCurrentClerkUserId } from '@/utils/optional-auth-utils';

/**
 * Get the current database user ID with request-level deduplication.
 * Redirects to home if not authenticated or user not found in database.
 */
export const getUserId = cache(async (): Promise<string> => {
  const clerkUserId = await getCurrentClerkUserId();

  if (!clerkUserId) redirect($path({ route: '/' }));

  // get the database user record using Clerk ID
  const dbUser = await UsersFacade.getUserByClerkIdAsync(clerkUserId);
  if (!dbUser) redirect($path({ route: '/' }));

  return dbUser.id;
});
