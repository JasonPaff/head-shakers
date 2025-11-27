import 'server-only';

import type { TrendingBobblehead } from '@/app/(app)/(home)/components/display/trending-bobbleheads-display';

import { TrendingBobbleheadsDisplay } from '@/app/(app)/(home)/components/display/trending-bobbleheads-display';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';

export async function TrendingBobbleheadsAsync() {
  const trendingData = await FeaturedContentFacade.getTrendingBobbleheadsAsync();

  const bobbleheads: Array<TrendingBobblehead> = trendingData.map((content) => ({
    badge: content.featureType === 'editor_pick' ? 'editor_pick' : 'trending',
    category: content.category ?? 'Bobblehead',
    characterName: content.title ?? content.name ?? 'Unknown',
    contentId: content.contentId,
    contentSlug: content.contentSlug ?? content.contentId,
    id: content.id,
    imageUrl: content.imageUrl,
    likeCount: content.likeCount,
    viewCount: content.viewCount,
    year: content.year ?? new Date().getFullYear(),
  }));

  return <TrendingBobbleheadsDisplay bobbleheads={bobbleheads} />;
}
