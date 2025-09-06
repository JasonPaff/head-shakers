import 'server-only';
import { notFound } from 'next/navigation';

import { SubcollectionBobbleheads } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection-bobbleheads';
import { SubcollectionHeader } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection-header';
import { SubcollectionMetrics } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection-metrics';
import { getSubCollectionByCollectionIdAsync } from '@/lib/queries/collections.queries';
import { getUserId } from '@/utils/user-utils';

interface SubcollectionProps {
  collectionId: string;
  subcollectionId: string;
}

export const Subcollection = async ({ collectionId, subcollectionId }: SubcollectionProps) => {
  const userId = await getUserId();
  const subcollection = await getSubCollectionByCollectionIdAsync(collectionId, subcollectionId, userId);

  if (!subcollection) {
    notFound();
  }

  return (
    <div>
      {/* Header Section */}
      <div className={'border-b border-border'}>
        <div className={'mx-auto max-w-7xl p-2'}>
          <SubcollectionHeader subcollection={subcollection} />
        </div>
      </div>

      {/* Metrics Section */}
      <div className={'mx-auto mt-4 max-w-7xl p-2'}>
        <SubcollectionMetrics subcollection={subcollection} />
      </div>

      {/* Bobbleheads Grid */}
      <div className={'mx-auto mt-4 max-w-7xl p-2'}>
        <SubcollectionBobbleheads collectionId={collectionId} subcollectionId={subcollectionId} />
      </div>
    </div>
  );
};
