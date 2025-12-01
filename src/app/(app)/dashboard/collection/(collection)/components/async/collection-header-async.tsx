import 'server-only';

import { collectionDashboardSearchParamsCache } from '@/app/(app)/dashboard/collection/(collection)/route-type';
import { CollectionsDashboardFacade } from '@/lib/facades/collections/collections-dashboard.facade';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';

import { CollectionHeaderDisplay } from '../display/collection-header-display';

/**
 * Server component that fetches collection header data
 * and passes it to the client display component.
 */
export async function CollectionHeaderAsync() {
  const userId = await getRequiredUserIdAsync();

  const collectionSlug = collectionDashboardSearchParamsCache.get('collectionSlug');
  if (!collectionSlug) return null;

  const collection = await CollectionsDashboardFacade.getHeaderByCollectionSlugAsync(userId, collectionSlug);

  return <CollectionHeaderDisplay collection={collection} />;
}
