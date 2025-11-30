import 'server-only';

import { ENUMS } from '@/lib/constants';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';

import { collectionDashboardSearchParamsCache } from '../../search-params';
import { BobbleheadGridDisplay } from '../display/bobblehead-grid-display';

// Type for bobblehead data from the server
export type BobbleheadData = {
  characterName?: string;
  commentCount: number;
  condition: string;
  height?: number;
  id: string;
  imageUrl?: string;
  isFeatured: boolean;
  likeCount: number;
  manufacturer?: string;
  material?: string;
  name: string;
  purchasePrice?: number;
  series?: string;
  viewCount: number;
  year?: number;
};

/**
 * Server component that fetches bobbleheads for a collection
 * and passes them to the client display component.
 */
export async function BobbleheadGridAsync() {
  const collectionId = collectionDashboardSearchParamsCache.get('collectionId');

  if (!collectionId) {
    return (
      <BobbleheadGridDisplay bobbleheads={[]} categories={[]} conditions={[...ENUMS.BOBBLEHEAD.CONDITION]} />
    );
  }

  const userId = await getRequiredUserIdAsync();
  const bobbleheadRecords = await CollectionsFacade.getCollectionBobbleheadsWithPhotos(collectionId, userId);

  const bobbleheads: Array<BobbleheadData> = bobbleheadRecords.map((b) => ({
    characterName: b.characterName ?? undefined,
    commentCount: 0, // TODO: Add when available from facade
    condition: b.condition ?? 'good',
    height: b.height ?? undefined,
    id: b.id,
    imageUrl: b.featurePhoto ?? undefined,
    isFeatured: b.isFeatured,
    likeCount: b.likeData?.likeCount ?? 0,
    manufacturer: b.manufacturer ?? undefined,
    material: b.material ?? undefined,
    name: b.name ?? '',
    purchasePrice: b.purchasePrice ?? undefined,
    series: b.series ?? undefined,
    viewCount: 0, // TODO: Add when available from facade
    year: b.year ?? undefined,
  }));

  const categories = [...new Set(bobbleheads.map((b) => b.manufacturer).filter(Boolean))] as Array<string>;

  return (
    <BobbleheadGridDisplay
      bobbleheads={bobbleheads}
      categories={categories}
      conditions={[...ENUMS.BOBBLEHEAD.CONDITION]}
    />
  );
}
