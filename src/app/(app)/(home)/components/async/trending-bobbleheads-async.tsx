import 'server-only';

import { TrendingBobbleheadsDisplay } from '@/app/(app)/(home)/components/display/trending-bobbleheads-display';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';

export async function TrendingBobbleheadsAsync() {
  const trendingBobbleheads = await FeaturedContentFacade.getTrendingBobbleheadsAsync();

  return <TrendingBobbleheadsDisplay bobbleheads={trendingBobbleheads} />;
}
