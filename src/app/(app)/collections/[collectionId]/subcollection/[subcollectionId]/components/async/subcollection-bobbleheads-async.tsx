import 'server-only';
import { notFound } from 'next/navigation';

import type { SubcollectionSearchParams } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/route-type';

import { SubcollectionBobbleheads } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection-bobbleheads';
import { SubcollectionsFacade } from '@/lib/facades/collections/subcollections.facade';

interface SubcollectionBobbleheadsAsyncProps {
  collectionId: string;
  currentUserId: null | string;
  searchParams?: SubcollectionSearchParams;
  subcollectionId: string;
}

export const SubcollectionBobbleheadsAsync = async ({
  collectionId,
  currentUserId,
  searchParams,
  subcollectionId,
}: SubcollectionBobbleheadsAsyncProps) => {
  const subcollection = await SubcollectionsFacade.getSubCollectionForPublicView(
    collectionId,
    subcollectionId,
    currentUserId || undefined,
  );

  if (!subcollection) notFound();

  return (
    <SubcollectionBobbleheads
      collectionId={collectionId}
      searchParams={searchParams}
      subcollection={subcollection}
    />
  );
};