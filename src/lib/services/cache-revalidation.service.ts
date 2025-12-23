/**
 * cache revalidation service for NextJS cache invalidation
 * provides enterprise-grade cache invalidation patterns using revalidateTag
 */

import { revalidatePath, revalidateTag } from 'next/cache';

import {
  CACHE_CONFIG,
  CACHE_ENTITY_TYPE,
  CACHE_KEYS,
  isCacheEnabled,
  isCacheLoggingEnabled,
} from '@/lib/constants/cache';
import { type CacheEntityType, CacheTagGenerators, CacheTagInvalidation } from '@/lib/utils/cache-tags.utils';
import { RedisOperations } from '@/lib/utils/redis-client';

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
     * Also invalidates navigation cache for the collection to ensure
     * adjacent bobbleheads show correct prev/next links
     */
    onCreate: (
      bobbleheadId: string,
      userId: string,
      collectionId?: string,
      bobbleheadSlug?: string,
    ): RevalidationResult => {
      const tags = CacheTagInvalidation.onBobbleheadChange(bobbleheadId, userId, collectionId);

      // Add navigation cache invalidation for the collection
      // This ensures all bobbleheads in the collection have their navigation updated
      if (collectionId) {
        CacheRevalidationService.bobbleheads.onNavigationChange(collectionId, bobbleheadId);
      }

      // Path-based revalidation using slug if provided
      if (isCacheEnabled() && bobbleheadSlug) {
        try {
          revalidatePath(`/bobbleheads/${bobbleheadSlug}`, 'page');
        } catch (error) {
          console.error('[CacheRevalidation] Path revalidation error on create:', error);
        }
      }

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
     * Also invalidates navigation cache for the collection to ensure
     * adjacent bobbleheads show correct prev/next links
     */
    onDelete: (
      bobbleheadId: string,
      userId: string,
      collectionId?: string,
      bobbleheadSlug?: string,
    ): RevalidationResult => {
      const tags = CacheTagInvalidation.onBobbleheadChange(bobbleheadId, userId, collectionId);

      // Add navigation cache invalidation for the collection
      // This ensures all bobbleheads in the collection have their navigation updated
      if (collectionId) {
        CacheRevalidationService.bobbleheads.onNavigationChange(collectionId, bobbleheadId);
      }

      // Path-based revalidation using slug if provided
      if (isCacheEnabled() && bobbleheadSlug) {
        try {
          revalidatePath(`/bobbleheads/${bobbleheadSlug}`, 'page');
        } catch (error) {
          console.error('[CacheRevalidation] Path revalidation error on delete:', error);
        }
      }

      return CacheRevalidationService.revalidateTags(tags, {
        entityId: bobbleheadId,
        entityType: 'bobblehead',
        operation: 'bobblehead:delete',
        reason: 'Bobblehead deleted',
        userId,
      });
    },

    /**
     * revalidate navigation cache when collection structure changes
     * Invalidates the collection-bobbleheads tag to clear all navigation
     * data for bobbleheads in the affected collection
     *
     * @param collectionId - The collection whose navigation needs invalidation
     * @param bobbleheadId - Optional bobblehead ID that triggered the change
     */
    onNavigationChange: (collectionId: string, bobbleheadId?: string): RevalidationResult => {
      // Use the collection-bobbleheads tag pattern which matches
      // the tag used in getBobbleheadNavigationData caching
      const tags = [CACHE_CONFIG.TAGS.COLLECTION_BOBBLEHEADS(collectionId)];

      return CacheRevalidationService.revalidateTags(tags, {
        entityId: collectionId,
        entityType: 'collection',
        operation: 'bobblehead:navigation:change',
        reason:
          bobbleheadId ?
            `Navigation invalidated due to bobblehead ${bobbleheadId} change`
          : 'Navigation invalidated due to collection structure change',
      });
    },

    /**
     * revalidate after photo operations
     */
    onPhotoChange: (
      bobbleheadId: string,
      userId: string,
      operation: 'add' | 'delete' | 'reorder' | 'update',
      bobbleheadSlug?: string,
    ): RevalidationResult => {
      const tags = CacheTagInvalidation.onBobbleheadChange(bobbleheadId, userId);

      // Path-based revalidation using slug if provided
      if (isCacheEnabled() && bobbleheadSlug) {
        try {
          revalidatePath(`/bobbleheads/${bobbleheadSlug}`, 'page');
        } catch (error) {
          console.error('[CacheRevalidation] Path revalidation error on photo change:', error);
        }
      }

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
    onTagChange: (
      bobbleheadId: string,
      userId: string,
      operation: 'add' | 'remove',
      bobbleheadSlug?: string,
    ): RevalidationResult => {
      const tags = CacheTagInvalidation.onBobbleheadChange(bobbleheadId, userId);

      // Path-based revalidation using slug if provided
      if (isCacheEnabled() && bobbleheadSlug) {
        try {
          revalidatePath(`/bobbleheads/${bobbleheadSlug}`, 'page');
        } catch (error) {
          console.error('[CacheRevalidation] Path revalidation error on tag change:', error);
        }
      }

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
    onUpdate: (
      bobbleheadId: string,
      userId: string,
      collectionId?: string,
      bobbleheadSlug?: string,
    ): RevalidationResult => {
      const tags = CacheTagInvalidation.onBobbleheadChange(bobbleheadId, userId, collectionId);

      // Path-based revalidation using slug if provided
      if (isCacheEnabled() && bobbleheadSlug) {
        try {
          revalidatePath(`/bobbleheads/${bobbleheadSlug}`, 'page');
        } catch (error) {
          console.error('[CacheRevalidation] Path revalidation error on update:', error);
        }
      }

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
     * Also invalidates navigation cache to ensure adjacent bobbleheads
     * show correct prev/next links after structural changes
     */
    onBobbleheadChange: (
      collectionId: string,
      bobbleheadId: string,
      userId: string,
      operation: 'add' | 'remove',
      _collectionSlug?: string,
      bobbleheadSlug?: string,
    ): RevalidationResult => {
      const tags = [
        ...CacheTagInvalidation.onCollectionChange(collectionId, userId),
        ...CacheTagInvalidation.onBobbleheadChange(bobbleheadId, userId, collectionId),
      ];

      // Invalidate navigation cache for the collection
      // This ensures all bobbleheads in the collection have their navigation updated
      CacheRevalidationService.bobbleheads.onNavigationChange(collectionId, bobbleheadId);

      // Path-based revalidation - only for bobblehead, collection routes now require username
      if (isCacheEnabled()) {
        try {
          // Collection path revalidation disabled - routes now require username
          // if (collectionSlug) {
          //   revalidatePath(`/user/[username]/collection/${collectionSlug}`, 'page');
          // }
          if (bobbleheadSlug) {
            revalidatePath(`/bobbleheads/${bobbleheadSlug}`, 'page');
          }
        } catch (error) {
          console.error('[CacheRevalidation] Path revalidation error on bobblehead change:', error);
        }
      }

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
      const tags = CacheTagGenerators.collection.create(collectionId, userId);

      // Path-based revalidation disabled - collection routes now require username
      // Tag-based cache invalidation handles this case
      // if (isCacheEnabled() && collectionSlug) {
      //   try {
      //     revalidatePath(
      //       $path({
      //         route: '/user/[username]/collection/[collectionSlug]',
      //         routeParams: {
      //           collectionSlug,
      //           username, // not available in this context
      //         },
      //       }),
      //       'page',
      //     );
      //   } catch (error) {
      //     console.error('[CacheRevalidation] Path revalidation error on create:', error);
      //   }
      // }

      return CacheRevalidationService.revalidateTags(tags, {
        entityId: collectionId,
        entityType: CACHE_ENTITY_TYPE.COLLECTION,
        operation: `${CACHE_ENTITY_TYPE.COLLECTION}:create`,
        reason: 'New collection created',
        userId,
      });
    },

    /**
     * revalidate after collection deletion
     */
    onDelete: (collectionId: string, userId: string): RevalidationResult => {
      const tags = CacheTagInvalidation.onCollectionChange(collectionId, userId);

      // Path-based revalidation disabled - collection routes now require username
      // Tag-based cache invalidation handles this case
      // if (isCacheEnabled() && collectionSlug) {
      //   try {
      //     revalidatePath(`/user/[username]/collection/${collectionSlug}`, 'page');
      //   } catch (error) {
      //     console.error('[CacheRevalidation] Path revalidation error on delete:', error);
      //   }
      // }

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

      // Path-based revalidation disabled - collection routes now require username
      // Tag-based cache invalidation handles this case
      // if (isCacheEnabled() && collectionSlug) {
      //   try {
      //     revalidatePath(`/user/[username]/collection/${collectionSlug}`, 'page');
      //   } catch (error) {
      //     console.error('[CacheRevalidation] Path revalidation error on update:', error);
      //   }
      // }

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
     * also invalidates Redis cache for hero bobblehead, featured collections, and trending bobbleheads
     */
    onContentChange: (type?: string): RevalidationResult => {
      const tags = CacheTagInvalidation.onFeaturedContentChange();

      // Invalidate hero bobblehead Redis cache
      void RedisOperations.del(CACHE_KEYS.FEATURED.FEATURED_BOBBLEHEAD()).catch((error) => {
        console.error('[CacheRevalidation] Failed to invalidate hero bobblehead Redis cache:', error);
      });

      // Invalidate featured collections Redis cache (all user-specific keys)
      void RedisOperations.delByPattern(`${CACHE_KEYS.FEATURED.COLLECTIONS()}:*`).catch((error) => {
        console.error('[CacheRevalidation] Failed to invalidate featured collections Redis cache:', error);
      });

      // Invalidate trending bobbleheads Redis cache
      void RedisOperations.del(CACHE_KEYS.FEATURED.TRENDING_BOBBLEHEADS()).catch((error) => {
        console.error('[CacheRevalidation] Failed to invalidate trending bobbleheads Redis cache:', error);
      });

      return CacheRevalidationService.revalidateTags(tags, {
        entityType: 'featured',
        operation: 'featured:content:change',
        reason: `Featured content updated${type ? ` (${type})` : ''}`,
      });
    },

    /**
     * revalidate all featured content
     * also invalidates Redis cache for hero bobblehead, featured collections, and trending bobbleheads
     */
    onMajorUpdate: (): RevalidationResult => {
      const tags = CacheTagInvalidation.onMajorDataChange();

      // Invalidate hero bobblehead Redis cache
      void RedisOperations.del(CACHE_KEYS.FEATURED.FEATURED_BOBBLEHEAD()).catch((error) => {
        console.error('[CacheRevalidation] Failed to invalidate hero bobblehead Redis cache:', error);
      });

      // Invalidate featured collections Redis cache (all user-specific keys)
      void RedisOperations.delByPattern(`${CACHE_KEYS.FEATURED.COLLECTIONS()}:*`).catch((error) => {
        console.error('[CacheRevalidation] Failed to invalidate featured collections Redis cache:', error);
      });

      // Invalidate trending bobbleheads Redis cache
      void RedisOperations.del(CACHE_KEYS.FEATURED.TRENDING_BOBBLEHEADS()).catch((error) => {
        console.error('[CacheRevalidation] Failed to invalidate trending bobbleheads Redis cache:', error);
      });

      return CacheRevalidationService.revalidateTags(tags, {
        entityType: 'featured',
        operation: 'featured:major:update',
        reason: 'Major featured content update',
      });
    },
  };

  /**
   * newsletter-specific revalidation utilities
   */
  static readonly newsletter = {
    /**
     * revalidate after newsletter subscription status change
     * Invalidates cache for the specific email's subscription status
     *
     * @param email - The normalized email address
     * @param operation - The operation performed ('subscribe' | 'unsubscribe')
     */
    onSubscriptionChange: (email: string, operation: 'subscribe' | 'unsubscribe'): RevalidationResult => {
      const tags = [CACHE_CONFIG.TAGS.NEWSLETTER, CACHE_CONFIG.TAGS.NEWSLETTER_SUBSCRIPTION(email)];

      return CacheRevalidationService.revalidateTags(tags, {
        entityType: CACHE_ENTITY_TYPE.NEWSLETTER,
        operation: `${CACHE_ENTITY_TYPE.NEWSLETTER}:${operation}`,
        reason: `Newsletter subscription ${operation}d`,
      });
    },
  };

  /**
   * platform-level revalidation utilities
   */
  static readonly platform = {
    /**
     * revalidate platform statistics
     */
    onStatsChange: (): RevalidationResult => {
      const tags = [CACHE_CONFIG.TAGS.PLATFORM_STATS];
      return CacheRevalidationService.revalidateTags(tags, {
        entityType: CACHE_ENTITY_TYPE.PLATFORM,
        operation: `${CACHE_ENTITY_TYPE.PLATFORM}:stats:change`,
        reason: 'Platform statistics changed',
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
      entitySlug?: string,
      commentId?: string,
      parentCommentId?: string,
    ): RevalidationResult => {
      const tags = CacheTagInvalidation.onCommentChange(entityType, entityId, commentId, parentCommentId);

      // Revalidate the specific page path where comments are displayed using slug if provided
      if (isCacheEnabled() && entitySlug) {
        try {
          switch (entityType) {
            case 'bobblehead':
              revalidatePath(`/bobbleheads/${entitySlug}`, 'page');
              break;
            case 'collection':
              // Collection path revalidation disabled - routes now require username
              // revalidatePath(`/user/[username]/collection/${entitySlug}`, 'page');
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
        reason: `Comment ${operation} on ${entityType}${parentCommentId ? ' (reply)' : ''}`,
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
      entitySlug?: string,
    ): RevalidationResult => {
      const tags = CacheTagInvalidation.onSocialInteraction(entityType, entityId, userId);

      // Add path-based revalidation for immediate cache clearing using slug if provided
      if (isCacheEnabled() && entitySlug) {
        try {
          switch (entityType) {
            case 'bobblehead':
              revalidatePath(`/bobbleheads/${entitySlug}`, 'page');
              break;
            case 'collection':
              // Collection path revalidation disabled - routes now require username
              // revalidatePath(`/user/[username]/collection/${entitySlug}`, 'page');
              break;
          }
        } catch (error) {
          console.error('[CacheRevalidation] Path revalidation error on like change:', error);
        }
      }

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
