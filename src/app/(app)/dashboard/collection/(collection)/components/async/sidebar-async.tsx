import 'server-only';

import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';
import { getUserPreferences } from '@/utils/server-cookies';

import { collectionDashboardSearchParamsCache } from '../../search-params';
import { SidebarDisplay } from '../display/sidebar-display';

/**
 * Server component that fetches the collection data
 * and passes it to the client display component.
 */
export async function SidebarAsync() {
  const userId = await getRequiredUserIdAsync();

  const [collections, preferences] = await Promise.all([
    CollectionsFacade.getDashboardListByUserId(userId),
    getUserPreferences(),
  ]);

  const urlCollectionId = collectionDashboardSearchParamsCache.get('collectionId');

  const validCollectionId = collections.find((collection) => collection.id === urlCollectionId)?.id;
  const effectiveCollectionId = validCollectionId ?? collections[0]?.id;

  return (
    <SidebarDisplay
      collections={collections}
      initialCardStyle={preferences.collectionSidebarView ?? 'compact'}
      initialSelectedId={effectiveCollectionId}
      initialSortOption={preferences.collectionSidebarSort ?? 'name-asc'}
    />
  );
}
