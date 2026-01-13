import 'server-only';

import type { CollectionSearchParams } from '@/app/(app)/user/[username]/collection/[collectionSlug]/route-type';

import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { getUserIdAsync } from '@/utils/auth-utils';

import type { BobbleheadViewData } from '../../types';

import { BobbleheadGrid } from '../bobblehead-grid';

interface CollectionBobbleheadsAsyncProps {
  collectionId: string;
  collectionSlug: string;
  ownerUsername: string;
  searchParams?: CollectionSearchParams;
}

/**
 * Async server component for fetching and displaying collection bobbleheads.
 * Performs server-side data fetching with optional search/sort filtering.
 * Layout preference is managed via URL state in the client BobbleheadGrid component.
 */
export const CollectionBobbleheadsAsync = async ({
  collectionId,
  collectionSlug,
  ownerUsername,
  searchParams,
}: CollectionBobbleheadsAsyncProps) => {
  const currentUserId = await getUserIdAsync();

  const bobbleheads = await CollectionsFacade.getAllCollectionBobbleheadsWithPhotosAsync(
    collectionId,
    currentUserId || undefined,
    {
      searchTerm: searchParams?.search,
      sortBy: searchParams?.sort,
    },
  );

  // Empty array if no bobbleheads found
  const _hasBobbleheads = bobbleheads && bobbleheads.length > 0;

  // Transform to BobbleheadViewData[] with routing context
  const bobbleheadData: Array<BobbleheadViewData> =
    _hasBobbleheads ?
      bobbleheads.map((bobblehead) => ({
        category: bobblehead.category,
        collectionSlug,
        condition: bobblehead.condition,
        description: bobblehead.description,
        featurePhoto: bobblehead.featurePhoto ?? null,
        id: bobblehead.id,
        isLiked: bobblehead.likeData?.isLiked ?? false,
        likeCount: bobblehead.likeData?.likeCount ?? 0,
        manufacturer: bobblehead.manufacturer,
        name: bobblehead.name ?? '',
        ownerUsername,
        slug: bobblehead.slug,
        year: bobblehead.year,
      }))
    : [];

  return (
    <BobbleheadGrid
      bobbleheads={bobbleheadData}
      collectionSlug={collectionSlug}
      initialSearch={searchParams?.search}
      ownerUsername={ownerUsername}
    />
  );
};
