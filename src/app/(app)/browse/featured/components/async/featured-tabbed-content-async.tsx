import type { FeaturedContentData } from '@/lib/queries/featured-content/featured-content-transformer';

import { FeaturedTabbedContentDisplay } from '@/app/(app)/browse/featured/components/display/featured-tabbed-content-display';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';

export interface FeaturedTabbedContentAsyncProps {
  currentUserId: null | string;
  isTrackViews?: boolean;
}

export async function FeaturedTabbedContentAsync({
  currentUserId,
  isTrackViews = false,
}: FeaturedTabbedContentAsyncProps) {
  let transformedData: {
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
    editor_pick: [],
    trending: [],
  };

  try {
    const [editorPicks, trending] = await Promise.all([
      FeaturedContentFacade.getEditorPicks(),
      FeaturedContentFacade.getTrendingContent(),
    ]);

    const tabbedContent = [...editorPicks, ...trending];
    const likeDataMap = new Map<string, { isLiked: boolean; likeCount: number; likeId: null | string }>();

    if (currentUserId && tabbedContent.length > 0) {
      const likeDataTargets = tabbedContent
        .filter((content) => ['bobblehead', 'collection'].includes(content.contentType))
        .map((content) => ({
          targetId: content.contentId,
          targetType: content.contentType as 'bobblehead' | 'collection',
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
          console.warn('FeaturedTabbedContentAsync: Failed to fetch like data:', error);
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
      editor_pick: editorPicks.map(transformContentWithLikeData),
      trending: trending.map(transformContentWithLikeData),
    };
  } catch (error) {
    console.error('Failed to fetch tabbed content:', error);
  }

  return (
    <FeaturedTabbedContentDisplay
      onViewContent={isTrackViews ? incrementViewCountAction : undefined}
      tabbedData={transformedData}
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
