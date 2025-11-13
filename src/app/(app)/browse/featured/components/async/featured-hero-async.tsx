import type { FeaturedContentData } from '@/lib/queries/featured-content/featured-content-transformer';

import { FeaturedHeroDisplay } from '@/app/(app)/browse/featured/components/display/featured-hero-display';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';

export interface FeaturedHeroAsyncProps {
  currentUserId: null | string;
  isTrackViews?: boolean;
}

export async function FeaturedHeroAsync({ currentUserId, isTrackViews = false }: FeaturedHeroAsyncProps) {
  let transformedData: {
    collection_of_week: Array<{
      comments: number;
      contentId: string;
      contentSlug: string;
      contentType: 'bobblehead' | 'collection' | 'user';
      description: string;
      endDate: null | string;
      id: string;
      imageUrl: null | string;
      isLiked: boolean;
      likeId: null | string;
      likes: number;
      owner: string;
      ownerDisplayName: string;
      priority: number;
      startDate: string;
      title: string;
      viewCount: number;
    }>;
    homepage_banner: Array<{
      comments: number;
      contentId: string;
      contentSlug: string;
      contentType: 'bobblehead' | 'collection' | 'user';
      description: string;
      endDate: null | string;
      id: string;
      imageUrl: null | string;
      isLiked: boolean;
      likeId: null | string;
      likes: number;
      owner: string;
      ownerDisplayName: string;
      priority: number;
      startDate: string;
      title: string;
      viewCount: number;
    }>;
  } = {
    collection_of_week: [],
    homepage_banner: [],
  };

  try {
    const [homepageBanner, collectionOfWeek] = await Promise.all([
      FeaturedContentFacade.getHomepageBanner(),
      FeaturedContentFacade.getCollectionOfWeek(),
    ]);

    const heroContent = [...homepageBanner, ...collectionOfWeek];
    const likeDataMap = new Map<string, { isLiked: boolean; likeCount: number; likeId: null | string }>();

    if (currentUserId && heroContent.length > 0) {
      const likeDataTargets = heroContent
        .filter((content) => ['bobblehead', 'collection', 'subcollection'].includes(content.contentType))
        .map((content) => ({
          targetId: content.contentId,
          targetType: content.contentType as 'bobblehead' | 'collection' | 'subcollection',
        }));

      if (likeDataTargets.length > 0) {
        try {
          const likeDataResults = await SocialFacade.getBatchContentLikeData(likeDataTargets, currentUserId);
          likeDataResults.forEach((likeData) => {
            const key = `${likeData.targetType}:${likeData.targetId}`;
            likeDataMap.set(key, {
              isLiked: likeData.isLiked,
              likeCount: likeData.likeCount,
              likeId: likeData.likeId,
            });
          });
        } catch (error) {
          console.warn('FeaturedHeroAsync: Failed to fetch like data:', error);
        }
      }
    }

    // helper function to transform content with like data
    const transformContentWithLikeData = (content: FeaturedContentData) => {
      const likeKey = `${content.contentType}:${content.contentId}`;
      const likeData = likeDataMap.get(likeKey);

      return {
        comments: content.comments || 0,
        contentId: content.contentId,
        contentSlug: content.contentSlug || content.contentId,
        contentType: content.contentType,
        description: content.description || '',
        endDate: content.endDate?.toISOString().split('T')[0] || null,
        id: content.id,
        imageUrl: content.imageUrl || null,
        isLiked: likeData?.isLiked ?? false,
        likeId: likeData?.likeId ?? null,
        likes: likeData?.likeCount ?? (content.likes || 0),
        owner: content.owner || 'Unknown',
        ownerDisplayName: content.ownerDisplayName || content.owner || 'Unknown',
        priority: content.priority,
        startDate: (content.startDate || new Date()).toISOString().split('T')[0]!,
        title: content.title || '',
        viewCount: content.viewCount,
      };
    };

    transformedData = {
      collection_of_week: collectionOfWeek.map(transformContentWithLikeData),
      homepage_banner: homepageBanner.map(transformContentWithLikeData),
    };
  } catch (error) {
    console.error('Failed to fetch hero content:', error);
  }

  return (
    <FeaturedHeroDisplay
      heroData={transformedData}
      onViewContent={isTrackViews ? incrementViewCountAction : undefined}
    />
  );
}

async function incrementViewCountAction(contentId: string) {
  'use server';

  try {
    await FeaturedContentFacade.incrementViewCount(contentId);
  } catch (error) {
    console.error('Failed to increment view count:', error);
  }
}
