import 'server-only';
import { notFound } from 'next/navigation';

import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';

import { CollectionStats } from '../collection-stats';

interface CollectionStatsAsyncProps {
  collectionId: string;
  currentUserId: null | string;
}

export const CollectionStatsAsync = async ({ collectionId, currentUserId }: CollectionStatsAsyncProps) => {
  const collection = await CollectionsFacade.getCollectionForPublicView(
    collectionId,
    currentUserId || undefined,
  );

  await new Promise((resolve) => setTimeout(resolve, 3000));

  if (!collection) {
    notFound();
  }

  return <CollectionStats collection={collection} />;
};
