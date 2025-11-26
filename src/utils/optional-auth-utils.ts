import { auth } from '@clerk/nextjs/server';

import { UsersFacade } from '@/lib/facades/users/users.facade';

export const getOptionalUserIdAsync = async (): Promise<null | string> => {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) return null;

    // get the database user record using Clerk ID
    const dbUser = await UsersFacade.getUserByClerkIdAsync(clerkUserId);
    if (!dbUser) return null;

    return dbUser.id;
  } catch {
    return null;
  }
};

export const checkIsOwnerAsync = async (resourceUserId?: null | string): Promise<boolean> => {
  if (!resourceUserId) return false;

  const currentUserId = await getOptionalUserIdAsync();
  if (!currentUserId) return false;

  return currentUserId === resourceUserId;
};
