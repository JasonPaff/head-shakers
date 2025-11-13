import type { FeaturedContentData } from '@/lib/queries/featured-content/featured-content-transformer';

import { FeaturedContentDisplay } from '@/app/(app)/browse/featured/components/featured-content-display';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

export interface FeaturedContentServerProps {
  isTrackViews?: boolean;
}

export async function FeaturedContentServer({ isTrackViews = false }: FeaturedContentServerProps) {
  let featuredContentData: {
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
    editor_pick: Array<{
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
    trending: Array<{
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
    editor_pick: [],
    homepage_banner: [],
    trending: [],
  };

  try {
    console.log('FeaturedContentServer: Fetching featured content data');

    // get current user ID for like data
    const currentUserId = await getOptionalUserId();

    // fetch all featured content sections in parallel
    const [homepageBanner, editorPicks, collectionOfWeek, trending] = await Promise.all([
      FeaturedContentFacade.getHomepageBanner(),
      FeaturedContentFacade.getEditorPicks(),
      FeaturedContentFacade.getCollectionOfWeek(),
      FeaturedContentFacade.getTrendingContent(),
    ]);

    console.log('FeaturedContentServer: Data fetched successfully', {
      collectionOfWeek: collectionOfWeek.length,
      editorPicks: editorPicks.length,
      homepageBanner: homepageBanner.length,
      trending: trending.length,
    });

    // collect all content items for batch like data fetch
    const allContent = [...homepageBanner, ...editorPicks, ...collectionOfWeek, ...trending];
    const likeDataTargets = allContent
      .filter((content) => ['bobblehead', 'collection', 'subcollection'].includes(content.contentType))
      .map((content) => ({
        targetId: content.contentId,
        targetType: content.contentType as 'bobblehead' | 'collection' | 'subcollection',
      }));

    // fetch like data for all content items if user is authenticated
    const likeDataMap = new Map<string, { isLiked: boolean; likeCount: number; likeId: null | string }>();

    if (currentUserId && likeDataTargets.length > 0) {
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
        console.warn('FeaturedContentServer: Failed to fetch like data:', error);
        // Continue without like data if fetch fails
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

    // transform data to match the expected format
    featuredContentData = {
      collection_of_week: collectionOfWeek.map(transformContentWithLikeData),
      editor_pick: editorPicks.map(transformContentWithLikeData),
      homepage_banner: homepageBanner.map(transformContentWithLikeData),
      trending: trending.map(transformContentWithLikeData),
    };
  } catch (error) {
    console.error('Failed to fetch featured content:', error);
  }

  return (
    <FeaturedContentDisplay
      featuredContentData={featuredContentData}
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
