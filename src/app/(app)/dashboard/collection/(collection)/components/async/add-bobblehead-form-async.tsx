import 'server-only';

import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';

import { collectionDashboardSearchParamsCache } from '../../route-type';
import { AddBobbleheadFormDisplay } from '../display/add-bobblehead-form-display';

export async function AddBobbleheadFormAsync() {
  const userId = await getRequiredUserIdAsync();
  const collectionSlug = collectionDashboardSearchParamsCache.get('collectionSlug');

  // TODO: use dedicated facade method for this data
  const userCollections = (await CollectionsFacade.getCollectionsByUser(userId, {}, userId)) ?? [];
  const currentCollection = userCollections.find((c) => c.slug === collectionSlug);
  const collectionsData = userCollections.map((collection) => ({
    id: collection.id,
    name: collection.name,
  }));

  return (
    <AddBobbleheadFormDisplay collections={collectionsData} initialCollectionId={currentCollection?.id} />
  );
}
