import 'server-only';

import { BobbleheadsDashboardFacade } from '@/lib/facades/bobbleheads/bobbleheads-dashboard.facade';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';

import { collectionDashboardSearchParamsCache } from '../../route-type';
import { AddBobbleheadFormDisplay } from '../display/add-bobblehead-form-display';

export async function AddBobbleheadFormAsync() {
  const userId = await getRequiredUserIdAsync();
  const collectionSlug = collectionDashboardSearchParamsCache.get('collectionSlug');

  const userCollections = await BobbleheadsDashboardFacade.getUserCollectionSelectorsAsync(userId);

  const currentCollection = userCollections.find((c) => c.slug === collectionSlug);

  return (
    <AddBobbleheadFormDisplay collections={userCollections} initialCollectionId={currentCollection?.id} />
  );
}
