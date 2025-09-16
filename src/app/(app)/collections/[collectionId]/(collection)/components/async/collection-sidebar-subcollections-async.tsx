import 'server-only';
import { notFound } from 'next/navigation';

import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';

import { CollectionSidebarSubcollections } from '../collection-sidebar-subcollections';

interface CollectionSidebarSubcollectionsAsyncProps {
  collectionId: string;
  currentUserId: null | string;
}

export const CollectionSidebarSubcollectionsAsync = async ({
  collectionId,
  currentUserId,
}: CollectionSidebarSubcollectionsAsyncProps) => {
  const collection = await CollectionsFacade.getCollectionForPublicView(
    collectionId,
    currentUserId || undefined,
  );

  await new Promise((resolve) => setTimeout(resolve, 7000));

  if (!collection) {
    notFound();
  }

  return <CollectionSidebarSubcollections collection={collection} />;
};
