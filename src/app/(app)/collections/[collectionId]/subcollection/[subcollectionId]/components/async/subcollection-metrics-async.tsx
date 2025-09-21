import 'server-only';
import { notFound } from 'next/navigation';

import { SubcollectionMetrics } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection-metrics';
import { SubcollectionsFacade } from '@/lib/facades/collections/subcollections.facade';

interface SubcollectionMetricsAsyncProps {
  collectionId: string;
  currentUserId: null | string;
  subcollectionId: string;
}

export const SubcollectionMetricsAsync = async ({
  collectionId,
  currentUserId,
  subcollectionId,
}: SubcollectionMetricsAsyncProps) => {
  const subcollection = await SubcollectionsFacade.getSubCollectionForPublicView(
    collectionId,
    subcollectionId,
    currentUserId || undefined,
  );

  if (!subcollection) {
    notFound();
  }

  return <SubcollectionMetrics currentUserId={currentUserId || undefined} subcollection={subcollection} subcollectionId={subcollectionId} />;
};
