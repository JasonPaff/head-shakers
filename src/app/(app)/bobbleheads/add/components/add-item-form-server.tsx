import 'server-only';

import { AddItemFormClient } from '@/app/(app)/bobbleheads/add/components/add-item-form-client';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';

interface AddItemFormServerProps {
  initialCollectionId?: string;
}

export async function AddItemFormServer({ initialCollectionId }: AddItemFormServerProps) {
  const userId = await getRequiredUserIdAsync();

  const userCollections = (await CollectionsFacade.getCollectionsByUser(userId, {}, userId)) ?? [];

  const collectionsData = userCollections.map((collection) => ({
    id: collection.id,
    name: collection.name,
  }));

  return <AddItemFormClient collections={collectionsData} initialCollectionId={initialCollectionId} />;
}
