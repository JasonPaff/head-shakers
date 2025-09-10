'use server';

import { $path } from 'next-typesafe-url';
import { revalidatePath, revalidateTag } from 'next/cache';

import { CACHE_TAGS } from '@/lib/constants/cache';

/**
 * Enterprise-grade cache revalidation service
 * Provides centralized, type-safe cache invalidation for the Head Shakers platform
 */
export class CacheRevalidationService {
  /**
   * Revalidate bobblehead-related featured content
   * @param bobbleheadId - The ID of the bobblehead
   */
  static revalidateBobbleheadFeaturedContent(bobbleheadId: string): void {
    try {
      const tags = [
        CACHE_TAGS.CONTENT_RELATIONSHIPS.BOBBLEHEAD_FEATURED(bobbleheadId),
        CACHE_TAGS.FEATURED_CONTENT.ALL,
        CACHE_TAGS.FEATURED_CONTENT.ACTIVE,
      ];

      const paths = [
        $path({ route: '/browse/featured' }),
      ];

      tags.forEach(tag => {
        try {
          revalidateTag(tag);
        } catch (error) {
          console.error(`Failed to revalidate tag ${tag}:`, error);
        }
      });
      
      paths.forEach(path => {
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
   * Revalidate collection-related featured content
   * @param collectionId - The ID of the collection
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
          routeParams: { collectionId } 
        }),
        $path({ route: '/browse/featured' }),
      ];

      tags.forEach(tag => {
        try {
          revalidateTag(tag);
        } catch (error) {
          console.error(`Failed to revalidate tag ${tag}:`, error);
        }
      });
      
      paths.forEach(path => {
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
   * Revalidate featured content across all related pages and data
   * @param operation - The type of operation performed (create, update, delete, toggle)
   * @param metadata - Optional metadata for conditional revalidation
   */
  static revalidateFeaturedContent(
    operation: 'create' | 'delete' | 'toggle' | 'update',
    metadata?: {
      affectsHomepage?: boolean;
      contentType?: string;
    },
  ): void {
    try {
      // Core featured content tags
      const coreTags = [
        CACHE_TAGS.FEATURED_CONTENT.ALL,
        CACHE_TAGS.FEATURED_CONTENT.ACTIVE,
        CACHE_TAGS.FEATURED_CONTENT.ADMIN,
      ];

      // Conditional tags based on metadata
      const conditionalTags: string[] = [];
      if (metadata?.contentType) {
        conditionalTags.push(CACHE_TAGS.FEATURED_CONTENT.BY_TYPE(metadata.contentType));
      }
      if (metadata?.affectsHomepage) {
        conditionalTags.push(CACHE_TAGS.FEATURED_CONTENT.HOMEPAGE);
      }

      // Specific section tags for comprehensive invalidation
      const sectionTags = [
        CACHE_TAGS.FEATURED_CONTENT.COLLECTION_OF_WEEK,
        CACHE_TAGS.FEATURED_CONTENT.EDITOR_PICKS,
        CACHE_TAGS.FEATURED_CONTENT.HOMEPAGE_BANNER,
        CACHE_TAGS.FEATURED_CONTENT.TRENDING,
      ];

      const allTags = [...coreTags, ...conditionalTags, ...sectionTags];

      // Core paths that always need revalidation
      const corePaths = [
        $path({ route: '/admin/featured-content' }),
        $path({ route: '/browse/featured' }),
      ];

      // Conditional paths
      const conditionalPaths: string[] = [];
      if (metadata?.affectsHomepage) {
        conditionalPaths.push($path({ route: '/' }));
      }

      const allPaths = [...corePaths, ...conditionalPaths];

      // Execute revalidation synchronously (these are not async operations)
      allTags.forEach(tag => {
        try {
          revalidateTag(tag);
        } catch (error) {
          console.error(`Failed to revalidate tag ${tag}:`, error);
        }
      });
      
      allPaths.forEach(path => {
        try {
          revalidatePath(path);
        } catch (error) {
          console.error(`Failed to revalidate path ${path}:`, error);
        }
      });

      // Log successful revalidation for monitoring
      console.log(`Cache revalidation completed for featured content ${operation}`, {
        metadata,
        operation,
        pathsRevalidated: allPaths.length,
        tagsRevalidated: allTags.length,
      });
    } catch (error) {
      // Log error but don't throw to prevent breaking the main operation
      console.error('Cache revalidation failed:', error);
    }
  }

  /**
   * Comprehensive cache warming strategy for featured content
   * This can be called after bulk operations or during off-peak hours
   */
  static warmFeaturedContentCache(): void {
    try {
      // Revalidate all featured content to ensure fresh cache
      this.revalidateFeaturedContent('update', {
        affectsHomepage: true,
      });

      console.log('Featured content cache warming completed');
    } catch (error) {
      console.error('Featured content cache warming failed:', error);
    }
  }
}