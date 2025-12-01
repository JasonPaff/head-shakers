import 'server-only';

import { collectionDashboardSearchParamsCache } from '@/app/(app)/dashboard/collection/(collection)/route-type';
import { CollectionsDashboardFacade } from '@/lib/facades/collections/collections-dashboard.facade';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';

import { CollectionHeaderDisplay } from '../display/collection-header-display';

export type CollectionHeaderData = {
  bobbleheadCount: number;
  commentCount: number;
  coverImageUrl: null | string;
  description: null | string;
  featuredCount: number;
  id: string;
  isPublic: boolean;
  likeCount: number;
  name: string;
  slug: string;
  totalValue: null | number;
  viewCount: number;
};

/**
 * Server component that fetches collection header data
 * and passes it to the client display component.
 */
export async function CollectionHeaderAsync() {
  const collectionSlug = collectionDashboardSearchParamsCache.get('collectionSlug');
  if (!collectionSlug) return null;

  const userId = await getRequiredUserIdAsync();

  const collection = await CollectionsDashboardFacade.getCollectionHeaderForUserBySlugAsync(
    userId,
    collectionSlug,
  );

  return <CollectionHeaderDisplay collection={collection} />;
}
