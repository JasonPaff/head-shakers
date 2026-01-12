import 'server-only';

import { ENUMS } from '@/lib/constants';
import { BobbleheadsDashboardFacade } from '@/lib/facades/bobbleheads/bobbleheads-dashboard.facade';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';
import { getUserPreferences } from '@/utils/server-cookies';

import { BobbleheadGridDisplay } from '../display/bobblehead-grid-display';

type BobbleheadGridAsyncProps = {
  collectionSlug: string;
  filterParams: {
    category: string;
    condition: string;
    featured: 'all' | 'featured' | 'not-featured';
    page: number;
    pageSize: number;
    search: string;
    sortBy: string;
  };
};

/**
 * Server component that fetches bobbleheads for a collection
 * and passes them to the client display component.
 */
export async function BobbleheadGridAsync({ collectionSlug, filterParams }: BobbleheadGridAsyncProps) {
  const userId = await getRequiredUserIdAsync();
  const { category, condition, featured, page, pageSize, search, sortBy } = filterParams;

  const [preferences, user] = await Promise.all([getUserPreferences(), UsersFacade.getUserByIdAsync(userId)]);
  const username = user?.username ?? '';

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
