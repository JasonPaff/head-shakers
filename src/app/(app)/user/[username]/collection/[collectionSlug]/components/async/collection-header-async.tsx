import 'server-only';
import { notFound } from 'next/navigation';

import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { getUserIdAsync } from '@/utils/auth-utils';

import type { CollectionViewData, CollectorData } from '../../types';

import { CollectionHeader } from '../collection-header';

interface CollectionHeaderAsyncProps {
  collectionId: string;
  userId: string;
}

export const CollectionHeaderAsync = async ({ collectionId, userId }: CollectionHeaderAsyncProps) => {
  const currentUserId = await getUserIdAsync();

  const [collection, likeData, viewCount, user] = await Promise.all([
    CollectionsFacade.getCollectionForPublicViewAsync(collectionId, currentUserId || undefined),
    SocialFacade.getContentLikeDataAsync(collectionId, 'collection', currentUserId || undefined),
    CollectionsFacade.getCollectionViewCountAsync(collectionId),
    UsersFacade.getUserByIdAsync(userId),
  ]);

  if (!collection || !user) {
    notFound();
  }

  // Transform to CollectionViewData
  const collectionViewData: CollectionViewData = {
    collectionId: collection.id,
    coverImageUrl: collection.coverImageUrl,
    createdAt: collection.createdAt,
    description: collection.description,
    isLiked: likeData.isLiked,
    lastUpdatedAt: collection.lastUpdatedAt,
    likeCount: likeData.likeCount,
    name: collection.name,
    slug: collection.slug,
    totalBobbleheadCount: collection.totalBobbleheadCount,
    viewCount,
  };

  // Transform to CollectorData
  // Note: Users table does not have displayName, so we use null (UI can fall back to username)
  const collectorData: CollectorData = {
    avatarUrl: user.avatarUrl,
    displayName: null,
    userId: user.id,
    username: user.username ?? '',
  };

  return (
    <CollectionHeader
      collection={collectionViewData}
      collector={collectorData}
      initialLikeCount={likeData.likeCount}
      isInitiallyLiked={likeData.isLiked}
    />
  );
};
