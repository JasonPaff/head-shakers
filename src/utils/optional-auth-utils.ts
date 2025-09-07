import { auth } from '@clerk/nextjs/server';

import { getUserByClerkIdAsync } from '@/lib/queries/users.queries';

export const getOptionalUserId = async (): Promise<null | string> => {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) return null;

    // get the database user record using Clerk ID
    const dbUser = await getUserByClerkIdAsync(clerkUserId);
    if (!dbUser) return null;

    return dbUser.id;
  } catch {
    return null;
  }
};

export const checkIsOwner = async (resourceUserId: string): Promise<boolean> => {
  const currentUserId = await getOptionalUserId();
  if (!currentUserId) return false;
  
  return currentUserId === resourceUserId;
};