import { createMiddleware } from 'next-safe-action';

import type { ActionMetadata } from '@/lib/utils/next-safe-action';

import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';

/**
 * Pre-configured middleware for featured content revalidation
 * Automatically revalidates featured content cache after successful operations
 */
export const featuredContentRevalidationMiddleware = createMiddleware<{
  ctx: Record<string, never>;
  metadata: ActionMetadata;
}>().define(async ({ metadata, next }) => {
  const result = await next();

  // Only revalidate on successful operations
  if (result.success) {
    try {
      // Determine operation type from action name
      const actionName = metadata?.actionName?.toLowerCase() || '';
      
      let operation: 'create' | 'delete' | 'toggle' | 'update' = 'update';
      if (actionName.includes('create')) operation = 'create';
      else if (actionName.includes('delete')) operation = 'delete';
      else if (actionName.includes('toggle')) operation = 'toggle';

      // Revalidate featured content cache
      CacheRevalidationService.revalidateFeaturedContent(operation, {
        affectsHomepage: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        contentType: typeof result.data?.contentType === 'string' ? result.data.contentType : undefined,
      });

      console.log('Featured content cache revalidation completed', {
        actionName: metadata?.actionName,
        operation,
      });
    } catch (error) {
      // Log error but don't fail the action
      console.error('Featured content cache revalidation failed:', error);
    }
  }

  return result;
});

/**
 * Pre-configured middleware for collection-related revalidation
 * Automatically revalidates collection and featured content cache after successful operations
 */
export const collectionRevalidationMiddleware = createMiddleware<{
  ctx: Record<string, never>;
  metadata: ActionMetadata;
}>().define(async ({ metadata, next }) => {
  const result = await next();

  // Only revalidate on successful operations
  if (result.success) {
    try {
      // If the result contains collection data, revalidate collection-specific caches
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (result.data?.collectionId && typeof result.data.collectionId === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        CacheRevalidationService.revalidateCollectionFeaturedContent(result.data.collectionId);
      }
      
      // If this collection might be featured, also revalidate featured content
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (result.data?.isFeatured || result.data?.featured) {
        CacheRevalidationService.revalidateFeaturedContent('update');
      }

      console.log('Collection cache revalidation completed', {
        actionName: metadata?.actionName,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        collectionId: typeof result.data?.collectionId === 'string' ? result.data.collectionId : undefined,
      });
    } catch (error) {
      // Log error but don't fail the action
      console.error('Collection cache revalidation failed:', error);
    }
  }

  return result;
});

/**
 * Pre-configured middleware for bobblehead-related revalidation
 * Automatically revalidates bobblehead and related content cache after successful operations
 */
export const bobbleheadRevalidationMiddleware = createMiddleware<{
  ctx: Record<string, never>;
  metadata: ActionMetadata;
}>().define(async ({ metadata, next }) => {
  const result = await next();

  // Only revalidate on successful operations
  if (result.success) {
    try {
      // If the result contains bobblehead data, revalidate bobblehead-specific caches
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const bobbleheadId = result.data?.bobbleheadId || result.data?.id;
      if (bobbleheadId && typeof bobbleheadId === 'string') {
        CacheRevalidationService.revalidateBobbleheadFeaturedContent(bobbleheadId);
      }
      
      // If this bobblehead is part of a collection that might be featured
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (result.data?.collectionId && typeof result.data.collectionId === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        CacheRevalidationService.revalidateCollectionFeaturedContent(result.data.collectionId);
      }

      console.log('Bobblehead cache revalidation completed', {
        actionName: metadata?.actionName,
        bobbleheadId: typeof bobbleheadId === 'string' ? bobbleheadId : undefined,
      });
    } catch (error) {
      // Log error but don't fail the action
      console.error('Bobblehead cache revalidation failed:', error);
    }
  }

  return result;
});