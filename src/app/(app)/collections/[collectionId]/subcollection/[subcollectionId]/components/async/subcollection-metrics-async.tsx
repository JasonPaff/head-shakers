import 'server-only';
import { notFound } from 'next/navigation';

import { SubcollectionMetrics } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection-metrics';
import { SubcollectionsFacade } from '@/lib/facades/collections/subcollections.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

interface SubcollectionMetricsAsyncProps {
  collectionId: string;
  subcollectionId: string;
}

export const SubcollectionMetricsAsync = async ({
  collectionId,
  subcollectionId,
}: SubcollectionMetricsAsyncProps) => {
  const currentUserId = await getOptionalUserId();
  const subcollection = await SubcollectionsFacade.getSubCollectionForPublicView(
    collectionId,
    subcollectionId,
    currentUserId || undefined,
  );

  if (!subcollection) {
    notFound();
  }

  return <SubcollectionMetrics subcollection={subcollection} subcollectionId={subcollectionId} />;
};
