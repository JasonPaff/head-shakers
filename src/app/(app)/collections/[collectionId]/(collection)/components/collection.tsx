import 'server-only';

import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { CollectionBobbleheads } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-bobbleheads';
import { CollectionHeader } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-header';
import { CollectionMetrics } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-metrics';
import { CollectionSubcollections } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-subcollections';

interface CollectionProps {
  collection: PublicCollection;
  isOwner?: boolean;
}

// TODO: add bobbleheads preview section

export const Collection = ({ collection, isOwner = false }: CollectionProps) => {
  if (!collection) throw new Error('Collection is required');

  return (
    <div>
      {/* Header Section */}
      <div className={'border-b border-border'}>
        <div className={'mx-auto max-w-7xl p-2'}>
          <CollectionHeader collection={collection} isOwner={isOwner} />
        </div>
      </div>

      {/* Metrics Section */}
      <div className={'mx-auto mt-4 max-w-7xl p-2'}>
        <CollectionMetrics collection={collection} />
      </div>

      {/* Subcollections Section */}
      <div className={'mx-auto max-w-7xl p-2'}>
        <CollectionSubcollections collectionId={collection.id} isOwner={isOwner} />
      </div>

      {/* Bobbleheads Section */}
      <div className={'mx-auto max-w-7xl p-2'}>
        <CollectionBobbleheads collectionId={collection.id} isOwner={isOwner} />
      </div>
    </div>
  );
};
