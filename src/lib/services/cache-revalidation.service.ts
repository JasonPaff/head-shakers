import { $path } from 'next-typesafe-url';
import { revalidatePath, revalidateTag } from 'next/cache';

import { CACHE_TAGS } from '@/lib/constants/cache';

export class CacheRevalidationService {
  /**
   * revalidate bobblehead-related featured content
   * @param bobbleheadId - the id of the bobblehead
   */
  static revalidateBobbleheadFeaturedContent(bobbleheadId: string): void {
    try {
      const tags = [
        CACHE_TAGS.CONTENT_RELATIONSHIPS.BOBBLEHEAD_FEATURED(bobbleheadId),
        CACHE_TAGS.FEATURED_CONTENT.ALL,
        CACHE_TAGS.FEATURED_CONTENT.ACTIVE,
      ];

      const paths = [$path({ route: '/browse/featured' })];

      tags.forEach((tag) => {
        try {
          revalidateTag(tag);
        } catch (error) {
          console.error(`Failed to revalidate tag ${tag}:`, error);
        }
      });

      paths.forEach((path) => {
        try {
          revalidatePath(path);
        } catch (error) {
          console.error(`Failed to revalidate path ${path}:`, error);
        }
      });

      console.log(`Cache revalidation completed for bobblehead featured content`, {
        bobbleheadId,
        pathsRevalidated: paths.length,
        tagsRevalidated: tags.length,
      });
    } catch (error) {
      console.error('Bobblehead featured content cache revalidation failed:', error);
    }
  }

  /**
   * revalidate collection-related featured content
   * @param collectionId - the id of the collection
   */
  static revalidateCollectionFeaturedContent(collectionId: string): void {
    try {
      const tags = [
        CACHE_TAGS.CONTENT_RELATIONSHIPS.COLLECTION_FEATURED(collectionId),
        CACHE_TAGS.FEATURED_CONTENT.ALL,
        CACHE_TAGS.FEATURED_CONTENT.ACTIVE,
      ];

      const paths = [
        $path({
          route: '/collections/[collectionId]',
          routeParams: { collectionId },
        }),
        $path({ route: '/browse/featured' }),
      ];

      tags.forEach((tag) => {
        try {
          revalidateTag(tag);
        } catch (error) {
          console.error(`Failed to revalidate tag ${tag}:`, error);
        }
      });

      paths.forEach((path) => {
        try {
          revalidatePath(path);
        } catch (error) {
          console.error(`Failed to revalidate path ${path}:`, error);
        }
      });

      console.log(`Cache revalidation completed for collection featured content`, {
        collectionId,
        pathsRevalidated: paths.length,
        tagsRevalidated: tags.length,
      });
    } catch (error) {
      console.error('Collection featured content cache revalidation failed:', error);
    }
  }

  /**
   * revalidate dashboard content
   * @param collectionId - the id of the collection
   */
  static revalidateDashboard({
    collectionId,
    subcollectionId,
    userId,
  }: {
    collectionId?: string;
    subcollectionId?: string;
    userId: string;
  }): void {
    try {
      const tags: Array<string> = [CACHE_TAGS.DASHBOARD.COLLECTIONS];
      const paths: Array<string> = [$path({ route: '/dashboard/collection' })];

      if (collectionId) {
        tags.push(CACHE_TAGS.DASHBOARD.COLLECTION(collectionId));
        paths.push(
          $path({
            route: '/collections/[collectionId]',
            routeParams: { collectionId },
          }),
        );
      }

      if (collectionId && subcollectionId) {
        tags.push(CACHE_TAGS.DASHBOARD.SUBCOLLECTION(collectionId, subcollectionId));
        paths.push(
          $path({
            route: '/collections/[collectionId]/subcollection/[subcollectionId]',
            routeParams: { collectionId, subcollectionId },
          }),
        );
      }

      tags.forEach((tag) => {
        try {
          revalidateTag(tag);
        } catch (error) {
          console.error(`Failed to revalidate tag ${tag}:`, error);
        }
      });

      paths.forEach((path) => {
        try {
          revalidatePath(path);
        } catch (error) {
          console.error(`Failed to revalidate path ${path}:`, error);
        }
      });

      console.log(`Cache revalidation completed for dashboard content`, {
        pathsRevalidated: paths.length,
        tagsRevalidated: tags.length,
        userId,
      });
    } catch (error) {
      console.error('Dashboard content cache revalidation failed:', error);
    }
  }

  /**
   * revalidate featured content across all related pages and data
   * @param operation - the type of operation performed (create, update, delete, toggle)
   * @param metadata - optional metadata for conditional revalidation
   */
  static revalidateFeaturedContent(
    operation: 'create' | 'delete' | 'toggle' | 'update',
    metadata?: {
      affectsHomepage?: boolean;
      contentType?: string;
    },
  ): void {
    try {
      // core featured content tags
      const coreTags = [
        CACHE_TAGS.FEATURED_CONTENT.ALL,
        CACHE_TAGS.FEATURED_CONTENT.ACTIVE,
        CACHE_TAGS.FEATURED_CONTENT.ADMIN,
      ];

      // conditional tags based on metadata
      const conditionalTags: string[] = [];
      if (metadata?.contentType) {
        conditionalTags.push(CACHE_TAGS.FEATURED_CONTENT.BY_TYPE(metadata.contentType));
      }
      if (metadata?.affectsHomepage) {
        conditionalTags.push(CACHE_TAGS.FEATURED_CONTENT.HOMEPAGE);
      }

      // specific section tags for comprehensive invalidation
      const sectionTags = [
        CACHE_TAGS.FEATURED_CONTENT.COLLECTION_OF_WEEK,
        CACHE_TAGS.FEATURED_CONTENT.EDITOR_PICKS,
        CACHE_TAGS.FEATURED_CONTENT.HOMEPAGE_BANNER,
        CACHE_TAGS.FEATURED_CONTENT.TRENDING,
      ];

      const allTags = [...coreTags, ...conditionalTags, ...sectionTags];

      // core paths that always need revalidation
      const corePaths = [$path({ route: '/admin/featured-content' }), $path({ route: '/browse/featured' })];

      // conditional paths
      const conditionalPaths: string[] = [];
      if (metadata?.affectsHomepage) {
        conditionalPaths.push($path({ route: '/' }));
      }

      const allPaths = [...corePaths, ...conditionalPaths];

      // execute revalidation synchronously (these are not async operations)
      allTags.forEach((tag) => {
        try {
          revalidateTag(tag);
        } catch (error) {
          console.error(`Failed to revalidate tag ${tag}:`, error);
        }
      });

      allPaths.forEach((path) => {
        try {
          revalidatePath(path);
        } catch (error) {
          console.error(`Failed to revalidate path ${path}:`, error);
        }
      });

      // log successful revalidation for monitoring
      console.log(`Cache revalidation completed for featured content ${operation}`, {
        metadata,
        operation,
        pathsRevalidated: allPaths.length,
        tagsRevalidated: allTags.length,
      });
    } catch (error) {
      // log error but don't throw to prevent breaking the main operation
      console.error('Cache revalidation failed:', error);
    }
  }
}
