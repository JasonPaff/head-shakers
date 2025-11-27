import type { FeaturedContentData } from '@/lib/queries/featured-content/featured-content-transformer';

import { FeaturedCollectionsDisplay } from '@/app/(app)/(home)/components/display/featured-collections-display';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';

export interface FeaturedCollectionsAsyncProps {
  currentUserId: null | string;
}

export async function FeaturedCollectionsAsync({ currentUserId }: FeaturedCollectionsAsyncProps) {
  let collections: Array<FeaturedCollection> = [];

  const featuredContent = await FeaturedContentFacade.getActiveFeaturedContent();

  // filter for collections only and sort by priority, limit to 6
  const collectionsData = featuredContent
    .filter((content) => content.contentType === 'collection')
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 6);

  const likeDataMap = new Map<string, { isLiked: boolean; likeCount: number; likeId: null | string }>();

  if (currentUserId && collectionsData.length > 0) {
    const likeDataTargets = collectionsData.map((content) => ({
      targetId: content.contentId,
      targetType: 'collection' as const,
    }));

    const likeDataResults = await SocialFacade.getBatchContentLikeDataAsync(likeDataTargets, currentUserId);
    likeDataResults.forEach((likeData) => {
      const key = `collection:${likeData.targetId}`;
      likeDataMap.set(key, {
        isLiked: likeData.isLiked,
        likeCount: likeData.likeCount,
        likeId: likeData.likeId,
      });
    });
  }

  collections = collectionsData.map((content) => {
    const likeKey = `collection:${content.contentId}`;
    const likeData = likeDataMap.get(likeKey);

    const contentWithExtras = content as FeaturedContentData & {
      isTrending?: boolean;
      ownerAvatarUrl?: null | string;
      totalItems?: number;
      totalValue?: number;
    };

    return {
      comments: content.comments ?? 0,
      contentId: content.contentId,
      contentSlug: content.contentSlug ?? content.contentId,
      description: content.description ?? '',
      id: content.id,
      imageUrl: content.imageUrl ?? null,
      isLiked: likeData?.isLiked ?? false,
      isTrending: contentWithExtras.isTrending ?? false,
      likeId: likeData?.likeId ?? null,
      likes: likeData?.likeCount ?? (content.likes || 0),
      ownerAvatarUrl: contentWithExtras.ownerAvatarUrl ?? null,
      ownerDisplayName: content.ownerDisplayName ?? 'Unknown',
      title: content.title ?? '',
      totalItems: contentWithExtras.totalItems ?? 0,
      totalValue: contentWithExtras.totalValue ?? 0,
      viewCount: content.viewCount,
    };
  });

  return <FeaturedCollectionsDisplay collections={collections} />;
}
