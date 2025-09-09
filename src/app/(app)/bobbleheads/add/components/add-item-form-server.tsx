import 'server-only';

import { AddItemFormClient } from '@/app/(app)/bobbleheads/add/components/add-item-form-client';
import { CollectionsFacade } from '@/lib/queries/collections/collections-facade';
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

  const userCollections = (await CollectionsFacade.getCollectionsByUser(userId, {}, userId)) ?? [];

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
