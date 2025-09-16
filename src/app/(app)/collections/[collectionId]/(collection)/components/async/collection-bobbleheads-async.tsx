import 'server-only';
import { notFound } from 'next/navigation';

import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';

import type { CollectionSearchParams } from '../../route-type';

import { CollectionBobbleheads } from '../collection-bobbleheads';

interface CollectionBobbleheadsAsyncProps {
  collectionId: string;
  currentUserId: null | string;
  searchParams?: CollectionSearchParams;
}

export const CollectionBobbleheadsAsync = async ({
  collectionId,
  currentUserId,
  searchParams,
}: CollectionBobbleheadsAsyncProps) => {
  const collection = await CollectionsFacade.getCollectionForPublicView(
    collectionId,
    currentUserId || undefined,
  );

  if (!collection) {
    notFound();
  }

  return <CollectionBobbleheads collection={collection} searchParams={searchParams} />;
};
