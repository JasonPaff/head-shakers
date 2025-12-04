import 'server-only';

import { FeaturedCollectionsDisplay } from '@/app/(app)/(home)/components/display/featured-collections-display';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';
import { getUserIdAsync } from '@/utils/auth-utils';

export async function FeaturedCollectionsAsync() {
  const currentUserId = await getUserIdAsync();
  const collections = await FeaturedContentFacade.getFeaturedCollectionsAsync(currentUserId);

  return <FeaturedCollectionsDisplay collections={collections} />;
}
