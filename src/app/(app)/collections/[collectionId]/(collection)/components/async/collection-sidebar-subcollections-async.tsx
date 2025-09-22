import 'server-only';
import { notFound } from 'next/navigation';

import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

import { CollectionSidebarSubcollections } from '../collection-sidebar-subcollections';

interface CollectionSidebarSubcollectionsAsyncProps {
  collectionId: string;
}

export const CollectionSidebarSubcollectionsAsync = async ({
  collectionId,
}: CollectionSidebarSubcollectionsAsyncProps) => {
  const currentUserId = await getOptionalUserId();
  const collection = await CollectionsFacade.getCollectionForPublicView(
    collectionId,
    currentUserId || undefined,
  );

  if (!collection) {
    notFound();
  }

  return <CollectionSidebarSubcollections collection={collection} />;
};
