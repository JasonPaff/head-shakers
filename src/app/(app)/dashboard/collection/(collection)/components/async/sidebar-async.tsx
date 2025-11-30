import 'server-only';

import { SidebarDisplay } from '../display/sidebar-display';

/**
 * Server component that fetches collections data
 * and passes it to the client display component.
 */
export async function SidebarAsync() {
  // TODO: Replace with real facade call:
  // const userId = await getUserIdAsync();
  // const collections = await CollectionsFacade.getCollectionsAsync(userId);

  // Placeholder await - remove when adding real data fetching
  await Promise.resolve();

  // For now, pass empty data - replace with real facade call
  const collections: Array<{
    bobbleheadCount: number;
    commentCount: number;
    coverImageUrl: string;
    description: string;
    featuredCount: number;
    id: string;
    isPublic: boolean;
    likeCount: number;
    name: string;
    totalValue: number;
    viewCount: number;
  }> = [];

  return <SidebarDisplay collections={collections} />;
}
