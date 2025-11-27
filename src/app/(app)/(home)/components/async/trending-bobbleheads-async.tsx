import 'server-only';

import type { TrendingBobblehead } from '@/app/(app)/(home)/components/display/trending-bobbleheads-display';

import { TrendingBobbleheadsDisplay } from '@/app/(app)/(home)/components/display/trending-bobbleheads-display';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { getUserIdAsync } from '@/utils/optional-auth-utils';

export async function TrendingBobbleheadsAsync() {
  const currentUserId = await getUserIdAsync();

  let bobbleheads: Array<TrendingBobblehead> = [];

  const featuredContent = await FeaturedContentFacade.getTrendingContent();

  // filter for bobbleheads only and sort by priority, limit to 12
  const bobbleheadsData = featuredContent
    .filter((content) => content.contentType === 'bobblehead')
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 12);

  const likeDataMap = new Map<string, { isLiked: boolean; likeCount: number; likeId: null | string }>();

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

  bobbleheads = bobbleheadsData.map((content) => {
    const likeKey = `bobblehead:${content.contentId}`;
    const likeData = likeDataMap.get(likeKey);

    // determine badge type from feature type
    let badge: 'editor_pick' | 'new_badge' | 'popular' | 'trending' = 'trending';
    if (content.featureType === 'editor_pick') {
      badge = 'editor_pick';
    }

    // use title or contentName for character name, fallback to 'Unknown'
    const characterName = content.title ?? content.contentName ?? 'Unknown';

    // since FeaturedContentData doesn't include bobblehead-specific fields (category, year),
    // we use placeholders until the query is enhanced to join these fields
    const category = 'Bobblehead';
    const year = new Date().getFullYear();

    return {
      badge,
      category,
      characterName,
      contentId: content.contentId,
      contentSlug: content.contentSlug ?? content.contentId,
      id: content.id,
      imageUrl: content.imageUrl ?? null,
      likeCount: likeData?.likeCount ?? content.likes ?? 0,
      viewCount: content.viewCount,
      year,
    };
  });

  return <TrendingBobbleheadsDisplay bobbleheads={bobbleheads} />;
}
