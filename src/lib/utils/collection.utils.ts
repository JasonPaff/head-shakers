import type { CollectionSortOption } from '@/hooks/use-user-preferences';
import type { CollectionDashboardListRecord } from '@/lib/queries/collections/collections.query';

/**
 * Sorts collections based on the given sort option.
 * Used by both server-side auto-selection and client-side sidebar display.
 */
export function sortCollections(
  collections: Array<CollectionDashboardListRecord>,
  sortOption: CollectionSortOption,
): Array<CollectionDashboardListRecord> {
  return [...collections].sort((a, b) => {
    switch (sortOption) {
      case 'comments-desc':
        return b.commentCount - a.commentCount;
      case 'count-asc':
        return a.bobbleheadCount - b.bobbleheadCount;
      case 'count-desc':
        return b.bobbleheadCount - a.bobbleheadCount;
      case 'likes-desc':
        return b.likeCount - a.likeCount;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'value-asc':
        return (a.totalValue ?? 0) - (b.totalValue ?? 0);
      case 'value-desc':
        return (b.totalValue ?? 0) - (a.totalValue ?? 0);
      case 'views-desc':
        return b.viewCount - a.viewCount;
      default:
        return 0;
    }
  });
}
