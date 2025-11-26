import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';
import type {
  CommentTargetType,
  CommentWithDepth,
  CommentWithUser,
  UserLikeStatus,
} from '@/lib/queries/social/social.query';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { InsertComment, InsertLike } from '@/lib/validations/social.validation';

import { type LikeTargetType, MAX_COMMENT_NESTING_DEPTH, OPERATIONS } from '@/lib/constants';
import { CACHE_KEYS } from '@/lib/constants/cache';
import { db } from '@/lib/db';
import {
  createProtectedQueryContext,
  createPublicQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';
import { SocialQuery } from '@/lib/queries/social/social.query';
import { UsersQuery } from '@/lib/queries/users/users-query';
import { CacheService } from '@/lib/services/cache.service';
import { CacheTagGenerators } from '@/lib/utils/cache-tags.utils';
import { isCommentEditable } from '@/lib/utils/comment.utils';
import { createFacadeError } from '@/lib/utils/error-builders';

export interface CommentData {
  comment: CommentWithUser;
  isOwner: boolean;
}

export interface CommentListData {
  comments: Array<CommentWithUser>;
  hasMore: boolean;
  total: number;
}

export interface CommentListWithRepliesData {
  comments: Array<CommentWithDepth>;
  hasMore: boolean;
  total: number;
}

export interface CommentMutationResult {
  comment: CommentWithUser | null;
  error?: string;
  isSuccessful: boolean;
}

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
  static async createComment(
    data: InsertComment,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<CommentMutationResult> {
    try {
      return await (dbInstance ?? db).transaction(async (tx) => {
        const context = createProtectedQueryContext(userId, { dbInstance: tx });

        // create the comment
        const newComment = await SocialQuery.createCommentAsync(data, userId, context);

        if (newComment) {
          // increment comment count on the target entity
          await SocialQuery.incrementCommentCountAsync(data.targetId, data.targetType, context);

          // fetch the comment with user data using efficient method
          const commentWithUser = await SocialQuery.getCommentByIdWithUserAsync(newComment.id, context);

          return {
            comment: commentWithUser,
            isSuccessful: !!commentWithUser,
          };
        }

        return {
          comment: null,
          isSuccessful: false,
        };
      });
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { commentData: data },
        facade: 'SocialFacade',
        method: 'createComment',
        operation: OPERATIONS.COMMENTS.CREATE_COMMENT,
        userId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Create a reply to an existing comment
   * Validates parent comment existence, depth limits, and target entity consistency
   * Cache invalidation is handled at the action layer via CacheRevalidationService
   */
  static async createCommentReply(
    data: InsertComment & { parentCommentId: string },
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<CommentMutationResult> {
    try {
      return await (dbInstance ?? db).transaction(async (tx) => {
        const context = createProtectedQueryContext(userId, { dbInstance: tx });

        // Validation 1: Verify parent comment exists and is not deleted
        const parentComment = await SocialQuery.getCommentByIdAsync(data.parentCommentId, context);

        if (!parentComment) {
          return {
            comment: null,
            error: 'Parent comment not found or has been deleted',
            isSuccessful: false,
          };
        }

        // Validation 2: Ensure parent comment belongs to the same target entity
        if (parentComment.targetId !== data.targetId || parentComment.targetType !== data.targetType) {
          return {
            comment: null,
            error: 'Parent comment must belong to the same target entity',
            isSuccessful: false,
          };
        }

        // Validation 3: Check if the replying user is blocked by the parent comment author
        const isBlocked = await SocialQuery.isUserBlockedByAsync(userId, parentComment.userId, context);

        if (isBlocked) {
          return {
            comment: null,
            error: 'You cannot reply to this comment',
            isSuccessful: false,
          };
        }

        // Validation 4: Enforce depth does not exceed MAX_COMMENT_NESTING_DEPTH
        const currentDepth = await this.calculateCommentDepth(data.parentCommentId, context);

        if (currentDepth >= MAX_COMMENT_NESTING_DEPTH) {
          return {
            comment: null,
            error: `Maximum nesting depth of ${MAX_COMMENT_NESTING_DEPTH} exceeded`,
            isSuccessful: false,
          };
        }

        // create the reply comment
        const newComment = await SocialQuery.createCommentAsync(data, userId, context);

        if (newComment) {
          // increment comment count on the target entity
          await SocialQuery.incrementCommentCountAsync(data.targetId, data.targetType, context);

          // fetch the comment with user data using efficient method
          const commentWithUser = await SocialQuery.getCommentByIdWithUserAsync(newComment.id, context);

          // Note: Cache invalidation is handled at the action layer via CacheRevalidationService

          return {
            comment: commentWithUser,
            isSuccessful: !!commentWithUser,
          };
        }

        return {
          comment: null,
          isSuccessful: false,
        };
      });
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { commentData: data },
        facade: 'SocialFacade',
        method: 'createCommentReply',
        operation: OPERATIONS.COMMENTS.CREATE_COMMENT,
        userId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Delete a comment and cascade delete all nested replies
   * Implements soft deletion by setting isDeleted flag
   * Decrements comment count for each deleted comment in the tree
   */
  static async deleteComment(
    commentId: string,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<boolean> {
    try {
      return await (dbInstance ?? db).transaction(async (tx) => {
        const context = createProtectedQueryContext(userId, { dbInstance: tx });

        // verify comment exists and user is the owner
        const existingComment = await SocialQuery.getCommentByIdAsync(commentId, context);

        if (!existingComment || existingComment.userId !== userId) {
          return false;
        }

        // check if comment has replies for cascade deletion
        const hasReplies = await SocialQuery.hasCommentRepliesAsync(commentId, context);

        if (hasReplies) {
          // recursively delete all child replies
          await this.deleteCommentRepliesRecursive(commentId, context);
        }

        // soft delete the comment
        const deletedComment = await SocialQuery.deleteCommentAsync(commentId, context);

        if (deletedComment) {
          // decrement comment count on the target entity
          await SocialQuery.decrementCommentCountAsync(
            deletedComment.targetId,
            deletedComment.targetType,
            context,
          );

          // Note: Cache invalidation is handled at the action layer via CacheRevalidationService

          return true;
        }

        return false;
      });
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { commentId },
        facade: 'SocialFacade',
        method: 'deleteComment',
        operation: OPERATIONS.COMMENTS.DELETE_COMMENT,
        userId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

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

  static async getCommentById(
    commentId: string,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<CommentData | null> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      // fetch the comment with user data using efficient method
      const commentWithUser = await SocialQuery.getCommentByIdWithUserAsync(commentId, context);

      if (!commentWithUser) {
        return null;
      }

      // Now that we have the comment data, we can generate proper cache tags
      // Cache with tags based on the target entity (not the comment ID)
      return CacheService.cached(
        () =>
          Promise.resolve({
            comment: commentWithUser,
            isOwner: commentWithUser.userId === userId,
          }),
        CACHE_KEYS.SOCIAL.COMMENTS('comment', commentId),
        {
          context: {
            entityId: commentWithUser.targetId,
            entityType: 'social',
            facade: 'SocialFacade',
            operation: 'getCommentById',
          },
          tags: CacheTagGenerators.social.comment(commentId, userId),
        },
      );
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { commentId },
        facade: 'SocialFacade',
        method: 'getCommentById',
        operation: OPERATIONS.COMMENTS.GET_COMMENTS,
        userId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  static async getComments(
    targetId: string,
    targetType: CommentTargetType,
    options: FindOptions = {},
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<CommentListData> {
    try {
      // Create cache key with pagination parameters for proper cache segmentation
      const limit = options.limit || 10;
      const offset = options.offset || 0;
      const cacheKey = `${CACHE_KEYS.SOCIAL.COMMENTS(targetType, targetId)}:list:${limit}:${offset}:${viewerUserId || 'public'}`;

      return CacheService.cached(
        async () => {
          const context =
            viewerUserId ?
              createUserQueryContext(viewerUserId, { dbInstance })
            : createPublicQueryContext({ dbInstance });

          // fetch comments with pagination
          const comments = await SocialQuery.getCommentsAsync(targetId, targetType, options, context);

          // get total count
          const total = await SocialQuery.getCommentCountAsync(targetId, targetType, context);

          // determine if there are more comments
          const hasMore = offset + comments.length < total;

          return {
            comments,
            hasMore,
            total,
          };
        },
        cacheKey,
        {
          context: {
            entityId: targetId,
            entityType: 'social',
            facade: 'SocialFacade',
            operation: 'getComments',
          },
          tags: CacheTagGenerators.social.comments(
            targetType === 'subcollection' ? 'collection' : targetType,
            targetId,
          ),
        },
      );
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { options, targetId, targetType },
        facade: 'SocialFacade',
        method: 'getComments',
        operation: OPERATIONS.COMMENTS.GET_COMMENTS,
        userId: viewerUserId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Get comments with nested replies for a target entity
   * Fetches root comments (parentCommentId is null) with recursively loaded replies
   * Returns comments in a threaded structure with depth tracking
   */
  static async getCommentsWithReplies(
    targetId: string,
    targetType: CommentTargetType,
    options: FindOptions = {},
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<CommentListWithRepliesData> {
    try {
      // Create cache key with pagination parameters for proper cache segmentation
      const limit = options.limit || 10;
      const offset = options.offset || 0;
      const cacheKey = `${CACHE_KEYS.SOCIAL.COMMENTS(targetType, targetId)}:threaded:${limit}:${offset}:${viewerUserId || 'public'}`;

      return CacheService.cached(
        async () => {
          const context =
            viewerUserId ?
              createUserQueryContext(viewerUserId, { dbInstance })
            : createPublicQueryContext({ dbInstance });

          // fetch comments with nested replies
          const comments = await SocialQuery.getCommentsWithRepliesAsync(
            targetId,
            targetType,
            options,
            context,
          );

          // get total count of root comments only
          const total = await SocialQuery.getCommentCountAsync(targetId, targetType, context);

          // determine if there are more root comments
          const hasMore = offset + comments.length < total;

          return {
            comments,
            hasMore,
            total,
          };
        },
        cacheKey,
        {
          context: {
            entityId: targetId,
            entityType: 'social',
            facade: 'SocialFacade',
            operation: 'getCommentsWithReplies',
          },
          tags: CacheTagGenerators.social.comments(
            targetType === 'subcollection' ? 'collection' : targetType,
            targetId,
          ),
        },
      );
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { options, targetId, targetType },
        facade: 'SocialFacade',
        method: 'getCommentsWithReplies',
        operation: OPERATIONS.COMMENTS.GET_COMMENTS,
        userId: viewerUserId,
      };
      throw createFacadeError(errorContext, error);
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
        SocialFacade.getLikeCount(targetId, targetType, dbInstance),
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

  static async getLikeCount(
    targetId: string,
    targetType: LikeTargetType,
    dbInstance?: DatabaseExecutor,
  ): Promise<number> {
    try {
      return CacheService.cached(
        () => {
          const context = createPublicQueryContext({ dbInstance });
          return SocialQuery.getLikeCountAsync(targetId, targetType, context);
        },
        CACHE_KEYS.SOCIAL.LIKES(targetType, targetId),
        {
          context: {
            entityId: targetId,
            entityType: 'social',
            facade: 'SocialFacade',
            operation: 'getLikeCount',
          },
          tags: CacheTagGenerators.social.like(
            targetType === 'subcollection' ? 'collection' : targetType,
            targetId,
            'system',
          ),
        },
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

  // ==================== Comment Methods ====================

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

  static async updateComment(
    commentId: string,
    content: string,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<CommentMutationResult> {
    try {
      return await (dbInstance ?? db).transaction(async (tx) => {
        const context = createProtectedQueryContext(userId, { dbInstance: tx });

        // verify comment exists and user is the owner
        const existingComment = await SocialQuery.getCommentByIdAsync(commentId, context);

        if (!existingComment) {
          return {
            comment: null,
            isSuccessful: false,
          };
        }

        if (existingComment.userId !== userId) {
          return {
            comment: null,
            isSuccessful: false,
          };
        }

        // Check if comment is within edit window (admins bypass this restriction)
        const user = await UsersQuery.getUserByIdForAdminAsync(userId, context);
        const isAdmin = user?.role === 'admin';

        if (!isAdmin && !isCommentEditable(existingComment.createdAt)) {
          return {
            comment: null,
            error: 'Edit window expired',
            isSuccessful: false,
          };
        }

        // update the comment
        const updatedComment = await SocialQuery.updateCommentAsync(commentId, content, context);

        if (updatedComment) {
          // fetch the comment with user data using efficient method
          const commentWithUser = await SocialQuery.getCommentByIdWithUserAsync(updatedComment.id, context);

          return {
            comment: commentWithUser,
            isSuccessful: !!commentWithUser,
          };
        }

        return {
          comment: null,
          isSuccessful: false,
        };
      });
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { commentId, content },
        facade: 'SocialFacade',
        method: 'updateComment',
        operation: OPERATIONS.COMMENTS.UPDATE_COMMENT,
        userId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Calculate the current nesting depth of a comment
   * Traverses up the comment tree to find the depth level
   * Returns 0 for root comments (no parent)
   */
  private static async calculateCommentDepth(commentId: string, context: QueryContext): Promise<number> {
    const commentThread = await SocialQuery.getCommentThreadWithRepliesAsync(commentId, 0, context);

    if (!commentThread) {
      return 0;
    }

    // the depth of the comment itself indicates how deep it is in the tree
    return commentThread.depth;
  }

  /**
   * Recursively delete all replies for a comment
   * Used during cascade deletion to remove entire comment threads
   */
  private static async deleteCommentRepliesRecursive(
    commentId: string,
    context: QueryContext,
  ): Promise<void> {
    // fetch all direct replies
    const replies = await SocialQuery.getCommentRepliesAsync(commentId, {}, context);

    // recursively delete nested replies for each direct reply
    for (const reply of replies) {
      const hasNestedReplies = await SocialQuery.hasCommentRepliesAsync(reply.id, context);

      if (hasNestedReplies) {
        await this.deleteCommentRepliesRecursive(reply.id, context);
      }

      // soft delete the reply
      const deletedReply = await SocialQuery.deleteCommentAsync(reply.id, context);

      if (deletedReply) {
        // decrement comment count for each deleted reply
        await SocialQuery.decrementCommentCountAsync(deletedReply.targetId, deletedReply.targetType, context);
      }
    }
  }
}
