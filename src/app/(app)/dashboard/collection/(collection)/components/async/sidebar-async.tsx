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

  const urlCollectionSlug = collectionDashboardSearchParamsCache.get('collectionSlug');

  const validCollectionSlug = collections.find((collection) => collection.slug === urlCollectionSlug)?.slug;
  const effectiveCollectionSlug = validCollectionSlug ?? collections[0]?.slug;

  return (
    <SidebarDisplay
      collections={collections}
      initialCardStyle={preferences.collectionSidebarView ?? 'compact'}
      initialSelectedSlug={effectiveCollectionSlug}
      initialSortOption={preferences.collectionSidebarSort ?? 'name-asc'}
    />
  );
}
