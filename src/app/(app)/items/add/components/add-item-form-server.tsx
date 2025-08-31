import { auth } from '@clerk/nextjs/server';

import { AddItemFormClient } from '@/app/(app)/items/add/components/add-item-form-client';
import { getCollectionsByUserAsync } from '@/lib/queries/collections.queries';
import { getUserByClerkIdAsync } from '@/lib/queries/users.queries';

export async function AddItemFormServer() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) return <AddItemFormClient collections={[]} />;

  // get the database user record using Clerk ID
  const dbUser = await getUserByClerkIdAsync(clerkUserId);
  if (!dbUser) return <AddItemFormClient collections={[]} />;

  // get the user's collections from the database
  const userCollections = (await getCollectionsByUserAsync(dbUser.id)) ?? [];

  // transform the collection data
  const collectionsData = userCollections.map((collection) => ({
    id: collection.id,
    name: collection.name,
  }));

  return <AddItemFormClient collections={collectionsData} />;
}
