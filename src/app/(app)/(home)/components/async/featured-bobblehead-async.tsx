import 'server-only';

import { FeaturedBobbleheadDisplay } from '@/app/(app)/(home)/components/display/featured-bobblehead-display';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';

export async function FeaturedBobbleheadAsync() {
  const featuredBobblehead = await FeaturedContentFacade.getFeaturedBobbleheadAsync();
  if (!featuredBobblehead) return null;

  return <FeaturedBobbleheadDisplay bobblehead={featuredBobblehead} />;
}
