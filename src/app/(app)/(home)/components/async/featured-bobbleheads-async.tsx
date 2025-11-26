import type { FeaturedBobblehead } from '@/app/(app)/(home)/components/display/featured-bobbleheads-display';

import { FeaturedBobbleheadsDisplay } from '@/app/(app)/(home)/components/display/featured-bobbleheads-display';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';

export interface FeaturedBobbleheadsAsyncProps {
  currentUserId: null | string;
}

/**
 * Async server component for fetching and displaying featured bobbleheads
 *
 * Fetches featured bobblehead content from the FeaturedContentFacade,
 * retrieves like data for authenticated users, and transforms the data
 * for the display component.
 */
export async function FeaturedBobbleheadsAsync({ currentUserId }: FeaturedBobbleheadsAsyncProps) {
  // Fetch featured bobbleheads from facade (default limit: 8)
  const bobbleheadsData = await FeaturedContentFacade.getFeaturedBobbleheadsAsync();

  // Initialize like data map for efficient lookup
  const likeDataMap = new Map<string, { isLiked: boolean; likeCount: number; likeId: null | string }>();

  // Fetch like data if user is authenticated and we have bobbleheads
  if (currentUserId && bobbleheadsData.length > 0) {
    const likeDataTargets = bobbleheadsData.map((content) => ({
      targetId: content.contentId,
      targetType: 'bobblehead' as const,
    }));

    const likeDataResults = await SocialFacade.getBatchContentLikeDataAsync(likeDataTargets, currentUserId);
    likeDataResults.forEach((likeData) => {
      const key = `bobblehead:${likeData.targetId}`;
      likeDataMap.set(key, {
        isLiked: likeData.isLiked,
        likeCount: likeData.likeCount,
        likeId: likeData.likeId,
      });
    });
  }

  // Transform FeaturedContentData to FeaturedBobblehead interface
  const bobbleheads: Array<FeaturedBobblehead> = bobbleheadsData.map((content) => {
    const likeKey = `bobblehead:${content.contentId}`;
    const likeData = likeDataMap.get(likeKey);

    return {
      contentId: content.contentId,
      contentName: content.contentName ?? null,
      contentSlug: content.contentSlug ?? null,
      featureType: content.featureType,
      id: content.id,
      imageUrl: content.imageUrl ?? null,
      isLiked: likeData?.isLiked ?? false,
      likeId: likeData?.likeId ?? null,
      likes: likeData?.likeCount ?? content.likes ?? 0,
      ownerDisplayName: content.ownerDisplayName ?? null,
      viewCount: content.viewCount,
    };
  });

  return <FeaturedBobbleheadsDisplay bobbleheads={bobbleheads} />;
}
