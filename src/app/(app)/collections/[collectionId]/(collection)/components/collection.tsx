import 'server-only';

import type { CollectionById } from '@/lib/queries/collections.queries';

import { CollectionHeader } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-header';
import { CollectionMetrics } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-metrics';
import { CollectionSubcollections } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-subcollections';

interface CollectionProps {
  collection: CollectionById;
}

export const Collection = ({ collection }: CollectionProps) => {
  if (!collection) throw new Error('Collection is required');

  return (
    <div>
      {/* Header Section */}
      <div className={'border-b border-border'}>
        <div className={'mx-auto max-w-7xl p-2'}>
          <CollectionHeader collection={collection} />
        </div>
      </div>

      {/* Metrics Section */}
      <div className={'mx-auto max-w-7xl p-2'}>
        <CollectionMetrics collection={collection} />
      </div>

      {/* Subcollections Section */}
      <div className={'mx-auto max-w-7xl p-2'}>
        <CollectionSubcollections collectionId={collection.id} />
      </div>
    </div>
  );
};
