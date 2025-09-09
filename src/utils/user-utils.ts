import { auth } from '@clerk/nextjs/server';
import { $path } from 'next-typesafe-url';
import { redirect } from 'next/navigation';

import { UsersFacade } from '@/lib/facades/users-facade';

export const getUserId = async (): Promise<string> => {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) redirect($path({ route: '/' }));

  // get the database user record using Clerk ID
  const dbUser = await UsersFacade.getUserByClerkId(clerkUserId);
  if (!dbUser) redirect($path({ route: '/' }));

  return dbUser.id;
};
