import type { FindOptions } from '@/lib/queries/base/query-context';
import type { UserLikeStatus } from '@/lib/queries/social/social.query';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { InsertLike } from '@/lib/validations/social.validation';

import { type LikeTargetType, OPERATIONS } from '@/lib/constants';
import { CACHE_KEYS } from '@/lib/constants/cache';
import { db } from '@/lib/db';
import {
  createProtectedQueryContext,
  createPublicQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';
import { SocialQuery } from '@/lib/queries/social/social.query';
import { CacheService } from '@/lib/services/cache.service';
import { CacheTagGenerators } from '@/lib/utils/cache-tags.utils';
import { createFacadeError } from '@/lib/utils/error-builders';

export interface ContentLikeData {
  isLiked: boolean;
  likeCount: number;
  likeId: null | string;
  targetId: string;
  targetType: LikeTargetType;
}

export interface LikeActivity {
  createdAt: Date;
  id: string;
  targetId: string;
  targetType: LikeTargetType;
  user: {
    displayName: null | string;
    id: string;
    username: null | string;
  };
  userId: string;
}

export interface LikeToggleResult {
  isLiked: boolean;
  isSuccessful: boolean;
  likeCount: number;
  likeId: null | string;
}

export interface TrendingContent {
  likeCount: number;
  recentLikeCount: number;
  targetId: string;
}

export class SocialFacade {
  static async getBatchContentLikeData(
    targets: Array<{ targetId: string; targetType: LikeTargetType }>,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<ContentLikeData>> {
    try {
      if (targets.length === 0) return [];

      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      // get like counts and user statuses in parallel
      const [likeCounts, userStatuses] = await Promise.all([
        SocialQuery.getLikeCountsAsync(targets, context),
        viewerUserId ?
          SocialQuery.getUserLikeStatusesAsync(targets, viewerUserId, context)
        : Promise.resolve(
            targets.map(
              ({ targetId, targetType }): UserLikeStatus => ({
                isLiked: false,
                likeId: null,
                targetId,
                targetType,
              }),
            ),
          ),
      ]);

      // create maps for efficient lookup
      const likeCountMap = new Map(
        likeCounts.map((item) => [`${item.targetType}:${item.targetId}`, item.likeCount]),
      );
      const userStatusMap = new Map(
        userStatuses.map((status) => [`${status.targetType}:${status.targetId}`, status]),
      );

      // combine data for each target
      return targets.map(({ targetId, targetType }) => {
        const key = `${targetType}:${targetId}`;
        const likeCount = likeCountMap.get(key) || 0;
        const userStatus = userStatusMap.get(key) || { isLiked: false, likeId: null };

        return {
          isLiked: userStatus.isLiked,
          likeCount,
          likeId: userStatus.likeId,
          targetId,
          targetType,
        };
      });
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { targetCount: targets.length },
        facade: 'SocialFacade',
        method: 'getBatchContentLikeData',
        operation: OPERATIONS.SOCIAL.GET_USER_LIKE_STATUSES,
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getContentLikeData(
    targetId: string,
    targetType: LikeTargetType,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<ContentLikeData> {
    try {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      // get like count and user status in parallel
      const [likeCount, userStatus] = await Promise.all([
        await SocialFacade.getLikeCount(targetId, targetType, dbInstance),
        viewerUserId ?
          SocialQuery.getUserLikeStatusAsync(targetId, targetType, viewerUserId, context)
        : Promise.resolve({ isLiked: false, likeId: null, targetId, targetType } as UserLikeStatus),
      ]);

      return {
        isLiked: userStatus.isLiked,
        likeCount,
        likeId: userStatus.likeId,
        targetId,
        targetType,
      };
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { targetId, targetType },
        facade: 'SocialFacade',
        method: 'getContentLikeData',
        operation: OPERATIONS.SOCIAL.GET_USER_LIKE_STATUS,
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getLikeCount(targetId: string, targetType: LikeTargetType, dbInstance?: DatabaseExecutor): Promise<number> {
    try {
      return CacheService.cached(
        () => {
          const context = createPublicQueryContext({ dbInstance });
          return SocialQuery.getLikeCountAsync(targetId, targetType, context);
        },
        CACHE_KEYS.SOCIAL.LIKES(targetType, targetId),
        {
          context: { entityId: targetId, entityType: 'social', facade: 'SocialFacade', operation: 'getLikeCount' },
          tags: CacheTagGenerators.social.like(targetType === 'subcollection' ? 'collection' : targetType, targetId, 'system')
        }
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { targetId, targetType },
        facade: 'SocialFacade',
        method: 'getLikeCount',
        operation: OPERATIONS.SOCIAL.GET_LIKE_COUNT,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getLikesForMultipleContentItems(
    contentIds: Array<string>,
    contentType: LikeTargetType,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Map<string, { isLiked: boolean; likeCount: number; likeId: null | string }>> {
    try {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      return SocialQuery.getLikesForMultipleContentItemsAsync(contentIds, contentType, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { contentIds, contentType },
        facade: 'SocialFacade',
        method: 'getLikesForMultipleContentItems',
        operation: OPERATIONS.SOCIAL.GET_USER_LIKE_STATUSES,
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getRecentLikeActivity(
    targetId: string,
    targetType: LikeTargetType,
    options: FindOptions = {},
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<LikeActivity>> {
    try {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      const likes = await SocialQuery.getRecentLikesAsync(targetId, targetType, options, context);

      return likes.map((like) => ({
        createdAt: like.createdAt,
        id: like.id,
        targetId: like.targetId,
        targetType: like.targetType,
        user: like.user,
        userId: like.userId,
      }));
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { options, targetId, targetType },
        facade: 'SocialFacade',
        method: 'getRecentLikeActivity',
        operation: OPERATIONS.SOCIAL.GET_RECENT_LIKES,
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getTrendingContent(
    targetType: LikeTargetType,
    options: FindOptions = {},
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<TrendingContent>> {
    try {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      return SocialQuery.getTrendingContentAsync(targetType, options, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { options, targetType },
        facade: 'SocialFacade',
        method: 'getTrendingContent',
        operation: OPERATIONS.SOCIAL.GET_TRENDING_CONTENT,
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getUserLikeStatus(
    targetId: string,
    targetType: LikeTargetType,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<UserLikeStatus> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      return SocialQuery.getUserLikeStatusAsync(targetId, targetType, userId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { targetId, targetType },
        facade: 'SocialFacade',
        method: 'getUserLikeStatus',
        operation: OPERATIONS.SOCIAL.GET_USER_LIKE_STATUS,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async toggleLike(
    targetId: string,
    targetType: LikeTargetType,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<LikeToggleResult> {
    try {
      return await (dbInstance ?? db).transaction(async (tx) => {
        const context = createProtectedQueryContext(userId, { dbInstance: tx });

        // check current like status
        const currentStatus = await SocialQuery.getUserLikeStatusAsync(targetId, targetType, userId, context);

        if (currentStatus.isLiked) {
          // unlike: delete the like and decrement count
          const deletedLike = await SocialQuery.deleteLikeAsync(targetId, targetType, userId, context);

          if (deletedLike) {
            await SocialQuery.decrementLikeCountAsync(targetId, targetType, context);
          }

          // get updated count
          const updatedCount = await SocialQuery.getLikeCountAsync(targetId, targetType, context);

          return {
            isLiked: false,
            isSuccessful: true,
            likeCount: updatedCount,
            likeId: null,
          };
        } else {
          // like: create the like and increment count
          const likeData: InsertLike = {
            targetId,
            targetType,
          };

          const newLike = await SocialQuery.createLikeAsync(likeData, userId, context);

          if (newLike) {
            await SocialQuery.incrementLikeCountAsync(targetId, targetType, context);
          }

          // get updated count
          const updatedCount = await SocialQuery.getLikeCountAsync(targetId, targetType, context);

          return {
            isLiked: !!newLike,
            isSuccessful: !!newLike,
            likeCount: updatedCount,
            likeId: newLike?.id || null,
          };
        }
      });
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { targetId, targetType },
        facade: 'SocialFacade',
        method: 'toggleLike',
        operation: OPERATIONS.SOCIAL.TOGGLE_LIKE,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }
}
