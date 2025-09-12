import { cache } from 'react';

import type { FindOptions } from '@/lib/queries/base/query-context';
import type { UserLikeStatus } from '@/lib/queries/social/social.query';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { InsertLike } from '@/lib/validations/social.validation';

import { OPERATIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import {
  createProtectedQueryContext,
  createPublicQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';
import { SocialQuery } from '@/lib/queries/social/social.query';
import { createFacadeError } from '@/lib/utils/error-builders';

/**
 * aggregated like data for content display
 */
export interface ContentLikeData {
  isLiked: boolean;
  likeCount: number;
  likeId: null | string;
  targetId: string;
  targetType: 'bobblehead' | 'collection' | 'subcollection';
}

/**
 * like activity data with user information
 */
export interface LikeActivity {
  createdAt: Date;
  id: string;
  targetId: string;
  targetType: 'bobblehead' | 'collection' | 'subcollection';
  user: {
    displayName: null | string;
    id: string;
    username: null | string;
  };
  userId: string;
}

/**
 * like toggle result with updated counts
 */
export interface LikeToggleResult {
  isLiked: boolean;
  isSuccessful: boolean;
  likeCount: number;
  likeId: null | string;
}

/**
 * trending content data
 */
export interface TrendingContent {
  likeCount: number;
  recentLikeCount: number;
  targetId: string;
}

/**
 * handles all business logic and orchestration for social features (likes, etc.)
 */
export class SocialFacade {
  /**
   * get like data for multiple targets (batch operation)
   */
  static getBatchContentLikeData = cache(
    async (
      targets: Array<{ targetId: string; targetType: 'bobblehead' | 'collection' | 'subcollection' }>,
      viewerUserId?: string,
      dbInstance?: DatabaseExecutor,
    ): Promise<Array<ContentLikeData>> => {
      try {
        if (targets.length === 0) {
          return [];
        }

        const context = viewerUserId
          ? createUserQueryContext(viewerUserId, { dbInstance })
          : createPublicQueryContext({ dbInstance });

        // get like counts and user statuses in parallel
        const [likeCounts, userStatuses] = await Promise.all([
          SocialQuery.getLikeCounts(targets, context),
          viewerUserId
            ? SocialQuery.getUserLikeStatuses(targets, viewerUserId, context)
            : Promise.resolve(
                targets.map(({ targetId, targetType }): UserLikeStatus => ({
                  isLiked: false,
                  likeId: null,
                  targetId,
                  targetType,
                })),
              ),
        ]);

        // create maps for efficient lookup
        const likeCountMap = new Map(
          likeCounts.map(item => [`${item.targetType}:${item.targetId}`, item.likeCount])
        );
        const userStatusMap = new Map(
          userStatuses.map(status => [`${status.targetType}:${status.targetId}`, status])
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
    },
  );

  /**
   * get comprehensive like data for content (status + count)
   */
  static getContentLikeData = cache(
    async (
      targetId: string,
      targetType: 'bobblehead' | 'collection' | 'subcollection',
      viewerUserId?: string,
      dbInstance?: DatabaseExecutor,
    ): Promise<ContentLikeData> => {
      try {
        const context = viewerUserId 
          ? createUserQueryContext(viewerUserId, { dbInstance })
          : createPublicQueryContext({ dbInstance });

        // get like count and user status in parallel
        const [likeCount, userStatus] = await Promise.all([
          SocialQuery.getLikeCount(targetId, targetType, context),
          viewerUserId 
            ? SocialQuery.getUserLikeStatus(targetId, targetType, viewerUserId, context)
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
    },
  );

  /**
   * get like count for a specific target
   */
  static getLikeCount = cache(
    async (
      targetId: string,
      targetType: 'bobblehead' | 'collection' | 'subcollection',
      dbInstance?: DatabaseExecutor,
    ): Promise<number> => {
      try {
        const context = createPublicQueryContext({ dbInstance });
        return SocialQuery.getLikeCount(targetId, targetType, context);
      } catch (error) {
        const context: FacadeErrorContext = {
          data: { targetId, targetType },
          facade: 'SocialFacade',
          method: 'getLikeCount',
          operation: OPERATIONS.SOCIAL.GET_LIKE_COUNT,
        };
        throw createFacadeError(context, error);
      }
    },
  );

  /**
   * get recent like activity for a target with user information
   */
  static getRecentLikeActivity = cache(
    async (
      targetId: string,
      targetType: 'bobblehead' | 'collection' | 'subcollection',
      options: FindOptions = {},
      viewerUserId?: string,
      dbInstance?: DatabaseExecutor,
    ): Promise<Array<LikeActivity>> => {
      try {
        const context = viewerUserId
          ? createUserQueryContext(viewerUserId, { dbInstance })
          : createPublicQueryContext({ dbInstance });

        const likes = await SocialQuery.getRecentLikes(targetId, targetType, options, context);

        return likes.map(like => ({
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
    },
  );

  /**
   * get trending content based on recent like activity
   */
  static getTrendingContent = cache(
    async (
      targetType: 'bobblehead' | 'collection' | 'subcollection',
      options: FindOptions = {},
      viewerUserId?: string,
      dbInstance?: DatabaseExecutor,
    ): Promise<Array<TrendingContent>> => {
      try {
        const context = viewerUserId
          ? createUserQueryContext(viewerUserId, { dbInstance })
          : createPublicQueryContext({ dbInstance });

        return SocialQuery.getTrendingContent(targetType, options, context);
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
    },
  );

  /**
   * get user's like status for a specific target
   */
  static getUserLikeStatus = cache(
    async (
      targetId: string,
      targetType: 'bobblehead' | 'collection' | 'subcollection',
      userId: string,
      dbInstance?: DatabaseExecutor,
    ): Promise<UserLikeStatus> => {
      try {
        const context = createUserQueryContext(userId, { dbInstance });
        return SocialQuery.getUserLikeStatus(targetId, targetType, userId, context);
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
    },
  );

  /**
   * helper method to create like data for insertion
   */
  static createLikeData(
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'subcollection',
  ): InsertLike {
    return {
      targetId,
      targetType,
    };
  }

  /**
   * toggle like status for a target (like or unlike)
   * handles the full business logic including count updates
   */
  static async toggleLike(
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'subcollection',
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<LikeToggleResult> {
    try {
      return await (dbInstance ?? db).transaction(async (tx) => {
        const context = createProtectedQueryContext(userId, { dbInstance: tx });

        // check current like status
        const currentStatus = await SocialQuery.getUserLikeStatus(targetId, targetType, userId, context);

        if (currentStatus.isLiked) {
          // unlike: delete the like and decrement count
          const deletedLike = await SocialQuery.deleteLike(targetId, targetType, userId, tx);

          if (deletedLike) {
            await SocialQuery.decrementLikeCount(targetId, targetType, tx);
          }

          // get updated count
          const updatedCount = await SocialQuery.getLikeCount(targetId, targetType, context);

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

          const newLike = await SocialQuery.createLike(likeData, userId, tx);

          if (newLike) {
            await SocialQuery.incrementLikeCount(targetId, targetType, tx);
          }

          // get updated count
          const updatedCount = await SocialQuery.getLikeCount(targetId, targetType, context);

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

  /**
   * helper method to validate target type
   */
  static validateTargetType(targetType: string): targetType is 'bobblehead' | 'collection' | 'subcollection' {
    return ['bobblehead', 'collection', 'subcollection'].includes(targetType);
  }
}