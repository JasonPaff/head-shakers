import 'server-only';
import { notFound } from 'next/navigation';

import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { getUserIdAsync } from '@/utils/auth-utils';

import { CollectionHeader } from '../collection-header';

interface CollectionHeaderAsyncProps {
  collectionId: string;
}

export const CollectionHeaderAsync = async ({ collectionId }: CollectionHeaderAsyncProps) => {
  const currentUserId = await getUserIdAsync();

  const [collection, likeData] = await Promise.all([
    CollectionsFacade.getCollectionForPublicView(collectionId, currentUserId || undefined),
    SocialFacade.getContentLikeData(collectionId, 'collection', currentUserId || undefined),
  ]);

  if (!collection) {
    notFound();
  }

  return <CollectionHeader collection={collection} likeData={likeData} />;
};
