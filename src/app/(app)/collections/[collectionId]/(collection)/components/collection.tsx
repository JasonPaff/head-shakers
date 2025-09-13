import 'server-only';

import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { CollectionBobbleheads } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-bobbleheads';
import { CollectionHeader } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-header';
import { CollectionMetrics } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-metrics';
import { CollectionSubcollections } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-subcollections';

interface CollectionProps {
  collection: PublicCollection;
  likeData?: {
    isLiked: boolean;
    likeCount: number;
    likeId: null | string;
  };
}

// TODO: add bobbleheads preview section

export const Collection = ({ collection, likeData }: CollectionProps) => {
  if (!collection) throw new Error('Collection is required');

  return (
    <div>
      {/* Header Section */}
      <div className={'border-b border-border'}>
        <div className={'mx-auto max-w-7xl p-2'}>
          <CollectionHeader collection={collection} likeData={likeData} />
        </div>
      </div>

      {/* Metrics Section */}
      <div className={'mx-auto mt-4 max-w-7xl p-2'}>
        <CollectionMetrics collection={collection} />
      </div>

      {/* Subcollections Section */}
      <div className={'mx-auto max-w-7xl p-2'}>
        <CollectionSubcollections collection={collection} />
      </div>

      {/* Bobbleheads Section */}
      <div className={'mx-auto max-w-7xl p-2'}>
        <CollectionBobbleheads collection={collection} />
      </div>
    </div>
  );
};
