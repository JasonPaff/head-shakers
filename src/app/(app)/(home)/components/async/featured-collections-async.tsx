import { FeaturedCollectionsDisplay } from '@/app/(app)/(home)/components/display/featured-collections-display';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';

export interface FeaturedCollectionsAsyncProps {
  currentUserId: null | string;
}

export async function FeaturedCollectionsAsync({ currentUserId }: FeaturedCollectionsAsyncProps) {
  let collections: Array<{
    comments: number;
    contentId: string;
    description: string;
    id: string;
    imageUrl: null | string;
    isLiked: boolean;
    likeId: null | string;
    likes: number;
    ownerDisplayName: string;
    title: string;
    viewCount: number;
  }> = [];

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

    const likeDataResults = await SocialFacade.getBatchContentLikeData(likeDataTargets, currentUserId);
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

    return {
      comments: content.comments || 0,
      contentId: content.contentId,
      description: content.description || '',
      id: content.id,
      imageUrl: content.imageUrl || null,
      isLiked: likeData?.isLiked ?? false,
      likeId: likeData?.likeId ?? null,
      likes: likeData?.likeCount ?? (content.likes || 0),
      ownerDisplayName: content.ownerDisplayName || 'Unknown',
      title: content.title || '',
      viewCount: content.viewCount,
    };
  });

  return <FeaturedCollectionsDisplay collections={collections} />;
}
