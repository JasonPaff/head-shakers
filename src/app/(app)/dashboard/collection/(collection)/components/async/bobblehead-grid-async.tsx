import 'server-only';

import { collectionDashboardSearchParamsCache } from '@/app/(app)/dashboard/collection/(collection)/route-type';
import { ENUMS } from '@/lib/constants';
import { CollectionsDashboardFacade } from '@/lib/facades/collections/collections-dashboard.facade';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';
import { getUserPreferences } from '@/utils/server-cookies';

import { BobbleheadGridDisplay } from '../display/bobblehead-grid-display';

/**
 * Server component that fetches bobbleheads for a collection
 * and passes them to the client display component.
 */
export async function BobbleheadGridAsync() {
  const userId = await getRequiredUserIdAsync();

  const collectionSlug = collectionDashboardSearchParamsCache.get('collectionSlug');
  const category = collectionDashboardSearchParamsCache.get('category');
  const condition = collectionDashboardSearchParamsCache.get('condition');
  const featured = collectionDashboardSearchParamsCache.get('featured');
  const search = collectionDashboardSearchParamsCache.get('search');
  const sortBy = collectionDashboardSearchParamsCache.get('sortBy');
  const preferences = await getUserPreferences();

  if (!collectionSlug) {
    return (
      <BobbleheadGridDisplay
        bobbleheads={[]}
        categories={[]}
        conditions={[...ENUMS.BOBBLEHEAD.CONDITION]}
        userPreferences={preferences}
      />
    );
  }

  const data = await CollectionsDashboardFacade.getBobbleheadListByCollectionSlugAsync(
    collectionSlug,
    userId,
    {
      category: category !== 'all' ? category : undefined,
      condition: condition !== 'all' ? condition : undefined,
      featured: featured !== 'all' ? (featured) : undefined,
      searchTerm: search || undefined,
      sortBy,
    },
  );

  // TODO: fix this up
  const categories = [...new Set(data.bobbleheads?.map((b) => b.category).filter(Boolean))] as Array<string>;

  return (
    <BobbleheadGridDisplay
      bobbleheads={data.bobbleheads}
      categories={categories}
      collectionId={data.collectionId}
      conditions={[...ENUMS.BOBBLEHEAD.CONDITION]}
      userPreferences={preferences}
    />
  );
}
