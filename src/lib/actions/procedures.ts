import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import * as Sentry from '@sentry/nextjs';
import { createServerActionProcedure } from 'zsa';

/*
 * A procedure that ensures the user is authenticated.
 * If authenticated, it returns the sessionId and userId.
 * If not authenticated, it throws an error.
 */
export const withAuth = createServerActionProcedure().handler(async () => {
  const { sessionId, userId } = await auth();

  if (!userId) throw new Error('Authentication required');

  Sentry.setUser({ id: userId });
  Sentry.setContext('session', { sessionId });

  return { sessionId, userId };
});

/*
 *  A procedure that ensures the user is authenticated and fetches their details from Clerk.
 */
export const authenticatedProcedure = createServerActionProcedure().handler(async () => {
  const { userId } = await auth();

  if (!userId) throw new Error('Unauthorized: No user session found');

  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    Sentry.setUser({
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      id: user.id,
      lastName: user.lastName,
      username: user.username ?? undefined,
    });

    Sentry.setContext('clerk', {
      createdAt: user.createdAt,
      emailVerified: user.emailAddresses[0]?.verification?.status === 'verified',
      lastSignInAt: user.lastSignInAt,
      userId: user.id,
    });

    // return the user data for use in the action
    return {
      user: {
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        id: user.id,
        lastName: user.lastName,
        username: user.username,
      },
    };
  } catch (error) {
    Sentry.captureException(error);
    throw new Error('Failed to authenticate user');
  }
});
