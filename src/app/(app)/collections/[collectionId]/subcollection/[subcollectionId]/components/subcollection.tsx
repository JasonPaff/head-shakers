import 'server-only';
import { notFound } from 'next/navigation';

import { SubcollectionBobbleheads } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection-bobbleheads';
import { SubcollectionHeader } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection-header';
import { SubcollectionMetrics } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection-metrics';
import { SubcollectionsFacade } from '@/lib/facades/collections/subcollections.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

interface SubcollectionProps {
  collectionId: string;
  subcollectionId: string;
}

export const Subcollection = async ({ collectionId, subcollectionId }: SubcollectionProps) => {
  const currentUserId = await getOptionalUserId();
  const subcollection = await SubcollectionsFacade.getSubCollectionForPublicView(
    collectionId,
    subcollectionId,
    currentUserId || undefined,
  );

  if (!subcollection) {
    notFound();
  }

  const isOwner = !!(currentUserId && currentUserId === subcollection.userId);

  return (
    <div>
      {/* Header Section */}
      <div className={'border-b border-border'}>
        <div className={'mx-auto max-w-7xl p-2'}>
          <SubcollectionHeader isOwner={isOwner} subcollection={subcollection} />
        </div>
      </div>

      {/* Metrics Section */}
      <div className={'mx-auto mt-4 max-w-7xl p-2'}>
        <SubcollectionMetrics subcollection={subcollection} />
      </div>

      {/* Bobbleheads Grid */}
      <div className={'mx-auto mt-4 max-w-7xl p-2'}>
        <SubcollectionBobbleheads
          collectionId={collectionId}
          isOwner={isOwner}
          subcollectionId={subcollectionId}
        />
      </div>
    </div>
  );
};
