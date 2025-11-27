import 'server-only';
import { notFound } from 'next/navigation';

import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { getUserIdAsync } from '@/utils/optional-auth-utils';

import { CollectionStats } from '../collection-stats';

interface CollectionStatsAsyncProps {
  collectionId: string;
}

export const CollectionStatsAsync = async ({ collectionId }: CollectionStatsAsyncProps) => {
  const currentUserId = await getUserIdAsync();
  const collection = await CollectionsFacade.getCollectionForPublicView(
    collectionId,
    currentUserId || undefined,
  );

  if (!collection) {
    notFound();
  }

  return <CollectionStats collection={collection} collectionId={collectionId} />;
};
