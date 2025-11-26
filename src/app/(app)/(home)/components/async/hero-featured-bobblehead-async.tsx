import { HeroFeaturedBobblehead } from '@/app/(app)/(home)/components/display/hero-featured-bobblehead';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';

export interface HeroFeaturedBobbleheadAsyncProps {
  currentUserId: null | string;
}

/**
 * Async server component for fetching and displaying a single featured bobblehead in the hero section
 *
 * Fetches a single featured bobblehead from the FeaturedContentFacade,
 * retrieves like data for authenticated users, and transforms the data
 * for the hero display component.
 */
export async function HeroFeaturedBobbleheadAsync({ currentUserId }: HeroFeaturedBobbleheadAsyncProps) {
  // Fetch single featured bobblehead from facade
  const bobbleheadsData = await FeaturedContentFacade.getFeaturedBobbleheads(1);

  // Return null if no featured bobblehead available
  if (bobbleheadsData.length === 0) {
    return null;
  }

  const featuredData = bobbleheadsData[0]!; // Safe because we checked length above

  // Initialize like count with default
  let likeCount = featuredData.likes ?? 0;

  // Fetch like data if user is authenticated to get accurate like count
  if (currentUserId) {
    const likeDataResults = await SocialFacade.getBatchContentLikeData(
      [
        {
          targetId: featuredData.contentId,
          targetType: 'bobblehead' as const,
        },
      ],
      currentUserId,
    );

    if (likeDataResults.length > 0) {
      const result = likeDataResults[0]!; // Safe because we checked length above
      likeCount = result.likeCount;
    }
  }

  // Transform FeaturedContentData to match HeroFeaturedBobblehead component interface
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
