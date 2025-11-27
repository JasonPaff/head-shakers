import 'server-only';

import { HeroFeaturedBobblehead } from '@/app/(app)/(home)/components/display/hero-featured-bobblehead';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { getUserIdAsync } from '@/utils/optional-auth-utils';

/**
 * Async server component for fetching and displaying a single featured bobblehead in the hero section
 *
 * Fetches a single featured bobblehead from the FeaturedContentFacade using a dedicated
 * Redis-cached query that returns only the fields needed for the hero display.
 */
export async function HeroFeaturedBobbleheadAsync() {
  const featuredData = await FeaturedContentFacade.getHeroFeaturedBobbleheadAsync();
  if (!featuredData) return null;

  const currentUserId = await getUserIdAsync();

  let likeCount = featuredData.likes ?? 0;

  const likeDataResults = await SocialFacade.getBatchContentLikeDataAsync(
    [
      {
        targetId: featuredData.contentId,
        targetType: 'bobblehead' as const,
      },
    ],
    currentUserId ?? undefined,
  );

  if (likeDataResults.length > 0) {
    const result = likeDataResults[0]!;
    likeCount = result.likeCount;
  }

  const bobblehead = {
    description: featuredData.description,
    id: featuredData.contentSlug ?? featuredData.contentId,
    likeCount,
    name: featuredData.contentName ?? 'Featured Bobblehead',
    photoUrl: featuredData.imageUrl,
    userId: featuredData.owner ?? '',
    viewCount: featuredData.viewCount,
  };

  return <HeroFeaturedBobblehead bobblehead={bobblehead} />;
}
