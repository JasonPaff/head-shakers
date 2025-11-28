import 'server-only';

import { FeaturedBobbleheadDisplay } from '@/app/(app)/(home)/components/display/featured-bobblehead-display';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';

export async function FeaturedBobbleheadAsync() {
  const featuredData = await FeaturedContentFacade.getFeaturedBobbleheadAsync();
  if (!featuredData) return null;

  const bobblehead = {
    description: featuredData.description,
    id: featuredData.contentSlug ?? featuredData.contentId,
    likeCount: featuredData.likes,
    name: featuredData.contentName ?? 'Featured Bobblehead',
    photoUrl: featuredData.imageUrl,
    userId: featuredData.owner ?? '',
    viewCount: featuredData.viewCount,
  };

  return <FeaturedBobbleheadDisplay bobblehead={bobblehead} />;
}
