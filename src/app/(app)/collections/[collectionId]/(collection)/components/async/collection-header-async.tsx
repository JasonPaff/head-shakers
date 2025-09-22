import 'server-only';
import { notFound } from 'next/navigation';

import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

import { CollectionHeader } from '../collection-header';

interface CollectionHeaderAsyncProps {
  collectionId: string;
}

export const CollectionHeaderAsync = async ({ collectionId }: CollectionHeaderAsyncProps) => {
  const currentUserId = await getOptionalUserId();
  const [collection, likeData] = await Promise.all([
    CollectionsFacade.getCollectionForPublicView(collectionId, currentUserId || undefined),
    SocialFacade.getContentLikeData(collectionId, 'collection', currentUserId || undefined),
  ]);

  if (!collection) {
    notFound();
  }

  return <CollectionHeader collection={collection} likeData={likeData} />;
};
