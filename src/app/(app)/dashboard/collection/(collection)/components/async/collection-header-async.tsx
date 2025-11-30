import 'server-only';

import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';

import { collectionDashboardSearchParamsCache } from '../../search-params';
import { CollectionHeaderDisplay } from '../display/collection-header-display';

export type CollectionHeaderData = {
  bobbleheadCount: number;
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

  if (!collectionSlug) {
    return <CollectionHeaderDisplay collection={null} />;
  }

  const userId = await getRequiredUserIdAsync();

  const collections = await CollectionsFacade.getDashboardListByUserId(userId);
  const collection = collections.find((collection) => collection.slug === collectionSlug);

  const headerData: CollectionHeaderData | null =
    collection ?
      {
        bobbleheadCount: collection.bobbleheadCount,
        coverImageUrl: collection.coverImageUrl,
        description: collection.description,
        featuredCount: collection.featuredCount,
        id: collection.id,
        isPublic: collection.isPublic,
        likeCount: collection.likeCount,
        name: collection.name,
        slug: collection.slug,
        totalValue: collection.totalValue,
        viewCount: collection.viewCount,
      }
    : null;

  return <CollectionHeaderDisplay collection={headerData} />;
}
