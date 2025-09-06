import 'server-only';

import { AddItemFormClient } from '@/app/(app)/items/add/components/add-item-form-client';
import { getCollectionsByUserAsync } from '@/lib/queries/collections.queries';
import { getUserId } from '@/utils/user-utils';

interface AddItemFormServerProps {
  initialCollectionId?: string;
  initialSubcollectionId?: string;
}

export async function AddItemFormServer({
  initialCollectionId,
  initialSubcollectionId,
}: AddItemFormServerProps) {
  const userId = await getUserId();

  const userCollections = (await getCollectionsByUserAsync(userId)) ?? [];

  // transform the collection data
  const collectionsData = userCollections.map((collection) => ({
    id: collection.id,
    name: collection.name,
  }));

  return (
    <AddItemFormClient
      collections={collectionsData}
      initialCollectionId={initialCollectionId}
      initialSubcollectionId={initialSubcollectionId}
    />
  );
}
