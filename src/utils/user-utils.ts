import { auth } from '@clerk/nextjs/server';
import { $path } from 'next-typesafe-url';
import { redirect } from 'next/navigation';

import { getUserByClerkIdAsync } from '@/lib/queries/users.queries';

export const getUserId = async (): Promise<string> => {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) redirect($path({ route: '/' }));

  // get the database user record using Clerk ID
  const dbUser = await getUserByClerkIdAsync(clerkUserId);
  if (!dbUser) redirect($path({ route: '/' }));

  return dbUser.id;
};
