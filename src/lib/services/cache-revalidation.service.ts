/**
 * cache revalidation service for NextJS cache invalidation
 * provides enterprise-grade cache invalidation patterns using revalidateTag
 */

import { revalidatePath, revalidateTag } from 'next/cache';

import { isCacheEnabled, isCacheLoggingEnabled } from '@/lib/constants/cache';
import { type CacheEntityType, CacheTagInvalidation } from '@/lib/utils/cache-tags.utils';

/**
 * revalidation context for tracking and logging
 */
export interface RevalidationContext {
  entityId?: string;
  entityType?: string;
  facade?: string;
  operation: string;
  reason?: string;
  userId?: string;
}

/**
 * revalidation result for monitoring
 */
export interface RevalidationResult {
  context?: RevalidationContext;
  error?: string;
  isSuccess: boolean;
  tagsInvalidated: Array<string>;
}

/**
 * cache revalidation statistics
 */
export interface RevalidationStats {
  failedRevalidations: number;
  lastRevalidation?: Date;
  successfulRevalidations: number;
  tagsInvalidated: number;
  totalRevalidations: number;
}

/**
 * enterprise-grade cache revalidation service
 */
export class CacheRevalidationService {
  /**
   * administrative revalidation utilities
   */
  static readonly admin = {
    /**
     * revalidate all caches (nuclear option)
     */
    onFullRevalidation: (reason: string): RevalidationResult => {
      const tags = CacheTagInvalidation.onMajorDataChange();
      return CacheRevalidationService.revalidateTags(tags, {
        entityType: 'system',
        operation: 'admin:full:revalidation',
        reason,
      });
    },

    /**
     * revalidate after system-wide changes
     */
    onSystemChange: (reason: string): RevalidationResult => {
      const tags = CacheTagInvalidation.onMajorDataChange();
      return CacheRevalidationService.revalidateTags(tags, {
        entityType: 'system',
        operation: 'admin:system:change',
        reason,
      });
    },
  };

  /**
   * analytics-specific revalidation utilities
   */
  static readonly analytics = {
    /**
     * revalidate after trending content update
     */
    onTrendingUpdate: (): RevalidationResult => {
      const tags = CacheTagInvalidation.onTrendingUpdate();
      return CacheRevalidationService.revalidateTags(tags, {
        entityType: 'analytics',
        operation: 'analytics:trending:update',
        reason: 'Trending analytics updated',
      });
    },

    /**
     * revalidate after view aggregation
     */
    onViewAggregation: (entityType: CacheEntityType, processedCount: number): RevalidationResult => {
      const tags = CacheTagInvalidation.onTrendingUpdate();
      return CacheRevalidationService.revalidateTags(tags, {
        entityType,
        operation: 'analytics:view:aggregation',
        reason: `View aggregation completed for ${processedCount} ${entityType}s`,
      });
    },

    /**
     * revalidate after view tracking
     */
    onViewRecord: (entityType: CacheEntityType, entityId: string, userId?: string): RevalidationResult => {
      const tags = CacheTagInvalidation.onAnalyticsView(entityType, entityId);
      return CacheRevalidationService.revalidateTags(tags, {
        entityId,
        entityType,
        operation: 'analytics:view:record',
        reason: 'Analytics view recorded',
        userId,
      });
    },
  };

  /**
   * bobblehead-specific revalidation utilities
   */
  static readonly bobbleheads = {
    /**
     * revalidate after bobblehead creation
     */
    onCreate: (bobbleheadId: string, userId: string, collectionId?: string): RevalidationResult => {
      const tags = CacheTagInvalidation.onBobbleheadChange(bobbleheadId, userId, collectionId);
      return CacheRevalidationService.revalidateTags(tags, {
        entityId: bobbleheadId,
        entityType: 'bobblehead',
        operation: 'bobblehead:create',
        reason: 'New bobblehead created',
        userId,
      });
    },

    /**
     * revalidate after bobblehead deletion
     */
    onDelete: (bobbleheadId: string, userId: string, collectionId?: string): RevalidationResult => {
      const tags = CacheTagInvalidation.onBobbleheadChange(bobbleheadId, userId, collectionId);
      return CacheRevalidationService.revalidateTags(tags, {
        entityId: bobbleheadId,
        entityType: 'bobblehead',
        operation: 'bobblehead:delete',
        reason: 'Bobblehead deleted',
        userId,
      });
    },

    /**
     * revalidate after photo operations
     */
    onPhotoChange: (
      bobbleheadId: string,
      userId: string,
      operation: 'add' | 'delete' | 'reorder',
    ): RevalidationResult => {
      const tags = CacheTagInvalidation.onBobbleheadChange(bobbleheadId, userId);
      return CacheRevalidationService.revalidateTags(tags, {
        entityId: bobbleheadId,
        entityType: 'bobblehead',
        operation: `bobblehead:photo:${operation}`,
        reason: `Bobblehead photo ${operation}`,
        userId,
      });
    },

    /**
     * revalidate after tag operations
     */
    onTagChange: (bobbleheadId: string, userId: string, operation: 'add' | 'remove'): RevalidationResult => {
      const tags = CacheTagInvalidation.onBobbleheadChange(bobbleheadId, userId);
      return CacheRevalidationService.revalidateTags(tags, {
        entityId: bobbleheadId,
        entityType: 'bobblehead',
        operation: `bobblehead:tag:${operation}`,
        reason: `Bobblehead tag ${operation}`,
        userId,
      });
    },

    /**
     * revalidate after bobblehead update
     */
    onUpdate: (bobbleheadId: string, userId: string, collectionId?: string): RevalidationResult => {
      const tags = CacheTagInvalidation.onBobbleheadChange(bobbleheadId, userId, collectionId);
      return CacheRevalidationService.revalidateTags(tags, {
        entityId: bobbleheadId,
        entityType: 'bobblehead',
        operation: 'bobblehead:update',
        reason: 'Bobblehead updated',
        userId,
      });
    },
  };

  /**
   * collection-specific revalidation utilities
   */
  static readonly collections = {
    /**
     * revalidate after bobblehead added/removed from a collection
     */
    onBobbleheadChange: (
      collectionId: string,
      bobbleheadId: string,
      userId: string,
      operation: 'add' | 'remove',
    ): RevalidationResult => {
      const tags = [
        ...CacheTagInvalidation.onCollectionChange(collectionId, userId),
        ...CacheTagInvalidation.onBobbleheadChange(bobbleheadId, userId, collectionId),
      ];
      return CacheRevalidationService.revalidateTags(tags, {
        entityId: collectionId,
        entityType: 'collection',
        operation: `collection:bobblehead:${operation}`,
        reason: `Bobblehead ${operation} to/from collection`,
        userId,
      });
    },

    /**
     * revalidate after collection creation
     */
    onCreate: (collectionId: string, userId: string): RevalidationResult => {
      const tags = CacheTagInvalidation.onCollectionChange(collectionId, userId);
      return CacheRevalidationService.revalidateTags(tags, {
        entityId: collectionId,
        entityType: 'collection',
        operation: 'collection:create',
        reason: 'New collection created',
        userId,
      });
    },

    /**
     * revalidate after collection deletion
     */
    onDelete: (collectionId: string, userId: string): RevalidationResult => {
      const tags = CacheTagInvalidation.onCollectionChange(collectionId, userId);
      return CacheRevalidationService.revalidateTags(tags, {
        entityId: collectionId,
        entityType: 'collection',
        operation: 'collection:delete',
        reason: 'Collection deleted',
        userId,
      });
    },

    /**
     * revalidate after collection update
     */
    onUpdate: (collectionId: string, userId: string): RevalidationResult => {
      const tags = CacheTagInvalidation.onCollectionChange(collectionId, userId);
      return CacheRevalidationService.revalidateTags(tags, {
        entityId: collectionId,
        entityType: 'collection',
        operation: 'collection:update',
        reason: 'Collection updated',
        userId,
      });
    },
  };

  /**
   * featured content revalidation utilities
   */
  static readonly featured = {
    /**
     * revalidate after featured content changes
     */
    onContentChange: (type?: string): RevalidationResult => {
      const tags = CacheTagInvalidation.onFeaturedContentChange();
      return CacheRevalidationService.revalidateTags(tags, {
        entityType: 'featured',
        operation: 'featured:content:change',
        reason: `Featured content updated${type ? ` (${type})` : ''}`,
      });
    },

    /**
     * revalidate all featured content
     */
    onMajorUpdate: (): RevalidationResult => {
      const tags = CacheTagInvalidation.onMajorDataChange();
      return CacheRevalidationService.revalidateTags(tags, {
        entityType: 'featured',
        operation: 'featured:major:update',
        reason: 'Major featured content update',
      });
    },
  };

  /**
   * social interaction revalidation utilities
   */
  static readonly social = {
    /**
     * revalidate after comment operations
     */
    onCommentChange: (
      entityType: CacheEntityType,
      entityId: string,
      userId: string,
      operation: 'add' | 'delete' | 'update',
    ): RevalidationResult => {
      const tags = CacheTagInvalidation.onSocialInteraction(entityType, entityId, userId);

      // Revalidate the specific page path where comments are displayed
      if (isCacheEnabled()) {
        try {
          switch (entityType) {
            case 'bobblehead':
              revalidatePath(`/bobbleheads/${entityId}`, 'page');
              break;
            case 'collection':
              revalidatePath(`/collections/${entityId}`, 'page');
              break;
            case 'subcollection':
              // For subcollections, we need to revalidate the subcollection page
              // The path pattern is /collections/[collectionId]/subcollection/[subcollectionId]
              // Since we don't have collectionId here, we'll use a layout revalidation
              revalidatePath(`/collections`, 'layout');
              break;
          }
        } catch (error) {
          console.error('[CacheRevalidation] Path revalidation error:', error);
        }
      }

      return CacheRevalidationService.revalidateTags(tags, {
        entityId,
        entityType,
        operation: `social:comment:${operation}`,
        reason: `Comment ${operation} on ${entityType}`,
        userId,
      });
    },

    /**
     * revalidate after follow/unfollow
     */
    onFollowChange: (
      followerId: string,
      followedId: string,
      operation: 'follow' | 'unfollow',
    ): RevalidationResult => {
      const tags = CacheTagInvalidation.onSocialInteraction('user', followedId, followerId);
      return CacheRevalidationService.revalidateTags(tags, {
        entityId: followedId,
        entityType: 'user',
        operation: `social:${operation}`,
        reason: `User ${operation}`,
        userId: followerId,
      });
    },

    /**
     * revalidate after like/unlike
     */
    onLikeChange: (
      entityType: CacheEntityType,
      entityId: string,
      userId: string,
      operation: 'like' | 'unlike',
    ): RevalidationResult => {
      const tags = CacheTagInvalidation.onSocialInteraction(entityType, entityId, userId);
      return CacheRevalidationService.revalidateTags(tags, {
        entityId,
        entityType,
        operation: `social:${operation}`,
        reason: `${entityType} ${operation}`,
        userId,
      });
    },
  };

  /**
   * user-specific revalidation utilities
   */
  static readonly users = {
    /**
     * revalidate after user profile update
     */
    onProfileUpdate: (userId: string): RevalidationResult => {
      const tags = CacheTagInvalidation.onUserChange(userId);
      return CacheRevalidationService.revalidateTags(tags, {
        entityType: 'user',
        operation: 'user:profile:update',
        reason: 'User profile updated',
        userId,
      });
    },

    /**
     * revalidate after user settings change
     */
    onSettingsChange: (userId: string): RevalidationResult => {
      const tags = CacheTagInvalidation.onUserChange(userId);
      return CacheRevalidationService.revalidateTags(tags, {
        entityType: 'user',
        operation: 'user:settings:change',
        reason: 'User settings changed',
        userId,
      });
    },
  };

  private static stats: RevalidationStats = {
    failedRevalidations: 0,
    successfulRevalidations: 0,
    tagsInvalidated: 0,
    totalRevalidations: 0,
  };

  /**
   * bet revalidation statistics
   */
  static getStats(): RevalidationStats {
    return { ...this.stats };
  }

  /**
   * reset revalidation statistics
   */
  static resetStats() {
    this.stats = {
      failedRevalidations: 0,
      successfulRevalidations: 0,
      tagsInvalidated: 0,
      totalRevalidations: 0,
    };
  }

  /**
   * generic tag revalidation with error handling and logging
   */
  static revalidateTags(tags: Array<string>, context?: RevalidationContext): RevalidationResult {
    if (!isCacheEnabled()) {
      this.logRevalidation('disabled', tags, context);
      return {
        context,
        isSuccess: true,
        tagsInvalidated: [],
      };
    }

    try {
      this.stats.totalRevalidations++;

      // revalidate each tag
      for (const tag of tags) {
        revalidateTag(tag, 'max');
      }

      this.stats.successfulRevalidations++;
      this.stats.tagsInvalidated += tags.length;
      this.stats.lastRevalidation = new Date();

      this.logRevalidation('success', tags, context);

      return {
        context,
        isSuccess: true,
        tagsInvalidated: tags,
      };
    } catch (error) {
      this.stats.failedRevalidations++;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logRevalidation('error', tags, context, errorMessage);

      return {
        context,
        error: errorMessage,
        isSuccess: false,
        tagsInvalidated: [],
      };
    }
  }

  /**
   * log revalidation operations for monitoring
   */
  private static logRevalidation(
    operation: 'disabled' | 'error' | 'success',
    tags: Array<string>,
    context?: RevalidationContext,
    error?: string,
  ) {
    if (!isCacheLoggingEnabled()) return;

    const logData = {
      context,
      operation,
      tags: tags.slice(0, 10), // log the first 10 tags to avoid spam
      tagsCount: tags.length,
      timestamp: new Date().toISOString(),
      ...(error && { error }),
    };

    // use an appropriate log level based on operation
    switch (operation) {
      case 'disabled':
        console.debug(`[CacheRevalidation] ${operation.toUpperCase()}:`, logData);
        break;
      case 'error':
        console.error(`[CacheRevalidation] ${operation.toUpperCase()}:`, logData);
        break;
      default:
        console.info(`[CacheRevalidation] ${operation.toUpperCase()}:`, logData);
        break;
    }
  }
}
