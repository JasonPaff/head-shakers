import 'server-only';

import { collectionDashboardSearchParamsCache } from '@/app/(app)/user/[username]/dashboard/collection/route-type';
import { ENUMS } from '@/lib/constants';
import { BobbleheadsDashboardFacade } from '@/lib/facades/bobbleheads/bobbleheads-dashboard.facade';
import { UsersFacade } from '@/lib/facades/users/users.facade';
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
  const page = collectionDashboardSearchParamsCache.get('page');
  const pageSize = collectionDashboardSearchParamsCache.get('pageSize');
  const search = collectionDashboardSearchParamsCache.get('search');
  const sortBy = collectionDashboardSearchParamsCache.get('sortBy');
  const [preferences, user] = await Promise.all([getUserPreferences(), UsersFacade.getUserByIdAsync(userId)]);
  const username = user?.username ?? '';

  if (!collectionSlug) {
    return (
      <BobbleheadGridDisplay
        bobbleheads={[]}
        categories={[]}
        conditions={[...ENUMS.BOBBLEHEAD.CONDITION]}
        username={username}
        userPreferences={preferences}
      />
    );
  }

  const [data, categories] = await Promise.all([
    BobbleheadsDashboardFacade.getListByCollectionSlugAsync(collectionSlug, userId, {
      category: category !== 'all' ? category : undefined,
      condition: condition !== 'all' ? condition : undefined,
      featured: featured !== 'all' ? featured : undefined,
      page,
      pageSize,
      searchTerm: search || undefined,
      sortBy,
    }),
    BobbleheadsDashboardFacade.getCategoriesByCollectionSlugAsync(collectionSlug, userId),
  ]);

  return (
    <BobbleheadGridDisplay
      bobbleheads={data.bobbleheads}
      categories={categories}
      conditions={[...ENUMS.BOBBLEHEAD.CONDITION]}
      pagination={data.pagination}
      username={username}
      userPreferences={preferences}
    />
  );
}
