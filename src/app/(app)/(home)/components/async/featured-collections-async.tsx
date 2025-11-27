import 'server-only';

import type { FeaturedCollection } from '@/app/(app)/(home)/components/display/featured-collections-display';

import { FeaturedCollectionsDisplay } from '@/app/(app)/(home)/components/display/featured-collections-display';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';
import { getUserIdAsync } from '@/utils/optional-auth-utils';

export async function FeaturedCollectionsAsync() {
  const currentUserId = await getUserIdAsync();
  const collectionsData = await FeaturedContentFacade.getFeaturedCollectionsAsync(currentUserId);

  const collections: Array<FeaturedCollection> = collectionsData.map((data) => ({
    comments: data.comments,
    contentId: data.contentId,
    contentSlug: data.contentSlug,
    description: data.description ?? '',
    id: data.id,
    imageUrl: data.imageUrl,
    isLiked: data.isLiked,
    isTrending: data.isTrending,
    likeId: data.likeId,
    likes: data.likes,
    ownerAvatarUrl: data.ownerAvatarUrl,
    ownerDisplayName: data.ownerDisplayName ?? 'Unknown',
    title: data.title ?? '',
    totalItems: data.totalItems,
    totalValue: data.totalValue ? Number(data.totalValue) : 0,
    viewCount: data.viewCount,
  }));

  return <FeaturedCollectionsDisplay collections={collections} />;
}
