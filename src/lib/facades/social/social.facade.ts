import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';
import type {
  CommentTargetType,
  CommentWithDepth,
  CommentWithUser,
  UserLikeStatus,
} from '@/lib/queries/social/social.query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { InsertComment, InsertLike } from '@/lib/validations/social.validation';

import { ENUMS, type LikeTargetType, MAX_COMMENT_NESTING_DEPTH, OPERATIONS } from '@/lib/constants';
import { CACHE_CONFIG, CACHE_KEYS } from '@/lib/constants/cache';
import { db } from '@/lib/db';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { SocialQuery } from '@/lib/queries/social/social.query';
import { UsersQuery } from '@/lib/queries/users/users.query';
import { CacheService } from '@/lib/services/cache.service';
import { CacheTagGenerators } from '@/lib/utils/cache-tags.utils';
import { createHashFromObject } from '@/lib/utils/cache.utils';
import { isCommentEditable } from '@/lib/utils/comment.utils';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';
import { facadeBreadcrumb } from '@/lib/utils/sentry-server/breadcrumbs.server';

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

const facadeName = 'SOCIAL_FACADE';

export class SocialFacade extends BaseFacade {
  /**
   * Create a new comment on a target entity (bobblehead or collection)
   * Increments comment count for bobblehead targets only (collections use dynamic counts)
   *
   * Cache behavior: No direct caching (mutation). Cache invalidation handled at action layer.
   *
   * @param data - Comment data including content and target info
   * @param userId - ID of the user creating the comment
   * @param dbInstance - Optional database executor for transactions
   * @returns Result with created comment or null on failure
   */
  static async createCommentAsync(
    data: InsertComment,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<CommentMutationResult> {
    return executeFacadeOperation(
      {
        data: { targetId: data.targetId, targetType: data.targetType },
        facade: facadeName,
        method: 'createCommentAsync',
        operation: OPERATIONS.COMMENTS.CREATE_COMMENT,
        userId,
      },
      async () => {
        return dbInstance.transaction(async (tx) => {
          const context = this.getProtectedContext(userId, tx);

          // create the comment
          const newComment = await SocialQuery.createCommentAsync(data, userId, context);

          if (newComment) {
            // increment comment count on the target entity (only for bobblehead targets)
            // collections use dynamic counts calculated from comment table
            if (data.targetType === ENUMS.COMMENT.TARGET_TYPE[0]) {
              await SocialQuery.incrementCommentCountAsync(data.targetId, data.targetType, context);
            }

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
      },
      {
        includeResultSummary: (result) => ({
          commentId: result.comment?.id,
          isSuccessful: result.isSuccessful,
        }),
      },
    );
  }

  /**
   * Create a reply to an existing comment
   * Validates parent comment existence, depth limits, and target entity consistency
   *
   * Cache behavior: No direct caching (mutation). Cache invalidation handled at action layer.
   *
   * @param data - Comment data with parentCommentId for the reply
   * @param userId - ID of the user creating the reply
   * @param dbInstance - Optional database executor for transactions
   * @returns Result with created reply or error message
   */
  static async createCommentReplyAsync(
    data: InsertComment & { parentCommentId: string },
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<CommentMutationResult> {
    return executeFacadeOperation(
      {
        data: { parentCommentId: data.parentCommentId, targetId: data.targetId },
        facade: facadeName,
        method: 'createCommentReplyAsync',
        operation: OPERATIONS.COMMENTS.CREATE_COMMENT,
        userId,
      },
      async () => {
        return dbInstance.transaction(async (tx) => {
          const context = this.getProtectedContext(userId, tx);

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
          const currentDepth = await this.calculateCommentDepthAsync(data.parentCommentId, context);

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
            // increment comment count on the target entity (only for bobblehead targets)
            // collections use dynamic counts calculated from comment table
            if (data.targetType === ENUMS.COMMENT.TARGET_TYPE[0]) {
              await SocialQuery.incrementCommentCountAsync(data.targetId, data.targetType, context);
            }

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
      },
      {
        includeResultSummary: (result) => ({
          commentId: result.comment?.id,
          hasError: !!result.error,
          isSuccessful: result.isSuccessful,
        }),
      },
    );
  }

  /**
   * Delete a comment and cascade delete all nested replies
   * Implements soft deletion by setting isDeleted flag
   * Decrements comment count for each deleted comment in the tree
   *
   * Cache behavior: No direct caching (mutation). Cache invalidation handled at action layer.
   *
   * @param commentId - ID of the comment to delete
   * @param userId - ID of the user requesting deletion (must be owner)
   * @param dbInstance - Optional database executor for transactions
   * @returns True if deletion succeeded, false otherwise
   */
  static async deleteCommentAsync(
    commentId: string,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<boolean> {
    return executeFacadeOperation(
      {
        data: { commentId },
        facade: facadeName,
        method: 'deleteCommentAsync',
        operation: OPERATIONS.COMMENTS.DELETE_COMMENT,
        userId,
      },
      async () => {
        return dbInstance.transaction(async (tx) => {
          const context = this.getProtectedContext(userId, tx);

          // verify comment exists and user is the owner
          const existingComment = await SocialQuery.getCommentByIdAsync(commentId, context);

          if (!existingComment || existingComment.userId !== userId) {
            return false;
          }

          // check if comment has replies for cascade deletion
          const hasReplies = await SocialQuery.hasCommentRepliesAsync(commentId, context);

          if (hasReplies) {
            // recursively delete all child replies
            await this.deleteCommentRepliesRecursiveAsync(commentId, context);
          }

          // soft delete the comment
          const deletedComment = await SocialQuery.deleteCommentAsync(commentId, context);

          if (deletedComment) {
            // decrement comment count on the target entity (only for bobblehead targets)
            // collections use dynamic counts calculated from comment table
            if (deletedComment.targetType === ENUMS.COMMENT.TARGET_TYPE[0]) {
              await SocialQuery.decrementCommentCountAsync(
                deletedComment.targetId,
                deletedComment.targetType,
                context,
              );
            }

            return true;
          }

          return false;
        });
      },
      {
        includeResultSummary: (result) => ({
          deleted: result,
        }),
      },
    );
  }

  /**
   * Get batch content like data for multiple targets
   * Fetches like counts and user like statuses for multiple content items in parallel
   *
   * Cache behavior: Cached with SHORT TTL (5 min), invalidated when likes are toggled.
   *
   * @param targets - Array of target objects with targetId and targetType
   * @param viewerUserId - Optional user ID for personalized like status
   * @param dbInstance - Optional database executor (for transactions)
   * @returns Array of ContentLikeData with like counts and user status for each target
   */
  static async getBatchContentLikeDataAsync(
    targets: Array<{ targetId: string; targetType: LikeTargetType }>,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<ContentLikeData>> {
    return executeFacadeOperation(
      {
        data: { targetCount: targets.length },
        facade: facadeName,
        method: 'getBatchContentLikeDataAsync',
        operation: OPERATIONS.SOCIAL.GET_USER_LIKE_STATUSES,
        userId: viewerUserId,
      },
      async () => {
        if (targets.length === 0) return [];

        // Create a cache key with the hashed targets array
        const targetsHash = createHashFromObject(targets);
        const cacheKey = `${CACHE_KEYS.SOCIAL.LIKES('batch', 'data')}:${targetsHash}:${viewerUserId || 'public'}`;

        // Generate cache tags for each target entity
        const cacheTags = targets.flatMap(({ targetId, targetType }) =>
          CacheTagGenerators.social.like(targetType, targetId, viewerUserId || 'system'),
        );

        return CacheService.cached(
          async () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);

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
            const results = targets.map(({ targetId, targetType }) => {
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

            facadeBreadcrumb('Batch content like data fetched', {
              hasViewerUser: !!viewerUserId,
              targetCount: targets.length,
            });

            return results;
          },
          cacheKey,
          {
            context: {
              entityType: 'social',
              facade: facadeName,
              operation: 'getBatchContentLikeDataAsync',
              userId: viewerUserId,
            },
            tags: cacheTags,
            ttl: CACHE_CONFIG.TTL.SHORT,
          },
        );
      },
    );
  }

  /**
   * Get a single comment by ID with ownership information
   *
   * Cache behavior: Cached with SHORT TTL (5 min), invalidated on comment changes.
   *
   * @param commentId - ID of the comment to fetch
   * @param userId - ID of the requesting user (for ownership check)
   * @param dbInstance - Optional database executor
   * @returns Comment data with ownership flag, or null if not found
   */
  static async getCommentByIdAsync(
    commentId: string,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<CommentData | null> {
    return executeFacadeOperation(
      {
        data: { commentId },
        facade: facadeName,
        method: 'getCommentByIdAsync',
        operation: OPERATIONS.COMMENTS.GET_COMMENTS,
        userId,
      },
      async () => {
        return CacheService.cached(
          async () => {
            const context = this.getUserContext(userId, dbInstance ?? db);

            // fetch the comment with user data using efficient method
            const commentWithUser = await SocialQuery.getCommentByIdWithUserAsync(commentId, context);

            if (!commentWithUser) {
              return null;
            }

            return {
              comment: commentWithUser,
              isOwner: commentWithUser.userId === userId,
            };
          },
          CACHE_KEYS.SOCIAL.COMMENTS('comment', commentId),
          {
            context: {
              entityId: commentId,
              entityType: 'social',
              facade: facadeName,
              operation: 'getCommentByIdAsync',
            },
            tags: CacheTagGenerators.social.comment(commentId, userId),
            ttl: CACHE_CONFIG.TTL.SHORT,
          },
        );
      },
    );
  }

  /**
   * Get paginated comments for a target entity
   *
   * Cache behavior: Cached with default TTL, segmented by pagination params and viewer.
   *
   * @param targetId - ID of the target entity (bobblehead or collection)
   * @param targetType - Type of the target ('bobblehead' or 'collection')
   * @param options - Pagination options (limit, offset)
   * @param viewerUserId - Optional viewer user ID for context
   * @param dbInstance - Optional database executor
   * @returns Paginated comment list with hasMore flag and total count
   */
  static async getCommentsAsync(
    targetId: string,
    targetType: CommentTargetType,
    options: FindOptions = {},
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<CommentListData> {
    return executeFacadeOperation(
      {
        data: { targetId, targetType },
        facade: facadeName,
        method: 'getCommentsAsync',
        operation: OPERATIONS.COMMENTS.GET_COMMENTS,
        userId: viewerUserId,
      },
      async () => {
        // Create cache key with pagination parameters for proper cache segmentation
        const limit = options.limit || 10;
        const offset = options.offset || 0;
        const cacheKey = `${CACHE_KEYS.SOCIAL.COMMENTS(targetType, targetId)}:list:${limit}:${offset}:${viewerUserId || 'public'}`;

        return CacheService.cached(
          async () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);

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
              facade: facadeName,
              operation: 'getCommentsAsync',
            },
            tags: CacheTagGenerators.social.comments(targetType, targetId),
          },
        );
      },
    );
  }

  /**
   * Get comments with nested replies for a target entity
   * Fetches root comments (parentCommentId is null) with recursively loaded replies
   * Returns comments in a threaded structure with depth tracking
   *
   * Cache behavior: Cached with default TTL, segmented by pagination and viewer.
   *
   * @param targetId - ID of the target entity
   * @param targetType - Type of the target ('bobblehead' or 'collection')
   * @param options - Pagination options
   * @param viewerUserId - Optional viewer user ID
   * @param dbInstance - Optional database executor
   * @returns Threaded comment list with depth info, hasMore, and total count
   */
  static async getCommentsWithRepliesAsync(
    targetId: string,
    targetType: CommentTargetType,
    options: FindOptions = {},
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<CommentListWithRepliesData> {
    return executeFacadeOperation(
      {
        data: { targetId, targetType },
        facade: facadeName,
        method: 'getCommentsWithRepliesAsync',
        operation: OPERATIONS.COMMENTS.GET_COMMENTS,
        userId: viewerUserId,
      },
      async () => {
        // Create cache key with pagination parameters for proper cache segmentation
        const limit = options.limit || 10;
        const offset = options.offset || 0;
        const cacheKey = `${CACHE_KEYS.SOCIAL.COMMENTS(targetType, targetId)}:threaded:${limit}:${offset}:${viewerUserId || 'public'}`;

        return CacheService.cached(
          async () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);

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
              facade: facadeName,
              operation: 'getCommentsWithRepliesAsync',
            },
            tags: CacheTagGenerators.social.comments(targetType, targetId),
          },
        );
      },
    );
  }

  /**
   * Get like data for a single content item including count and user status
   *
   * Cache behavior: Cached with SHORT TTL (5 min), invalidated on like toggle.
   *
   * @param targetId - ID of the target content
   * @param targetType - Type of target ('bobblehead', 'collection', 'comment')
   * @param viewerUserId - Optional user ID for personalized like status
   * @param dbInstance - Optional database executor
   * @returns Content like data with count and user status
   */
  static async getContentLikeDataAsync(
    targetId: string,
    targetType: LikeTargetType,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<ContentLikeData> {
    return executeFacadeOperation(
      {
        data: { targetId, targetType },
        facade: facadeName,
        method: 'getContentLikeDataAsync',
        operation: OPERATIONS.SOCIAL.GET_USER_LIKE_STATUS,
        userId: viewerUserId,
      },
      async () => {
        // Create cache key with viewer context for proper cache segmentation
        const cacheKey = `${CACHE_KEYS.SOCIAL.LIKES(targetType, targetId)}:data:${viewerUserId || 'public'}`;

        return CacheService.cached(
          async () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);

            // get like count and user status in parallel
            const [likeCount, userStatus] = await Promise.all([
              SocialQuery.getLikeCountAsync(targetId, targetType, context),
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
          },
          cacheKey,
          {
            context: {
              entityId: targetId,
              entityType: 'social',
              facade: facadeName,
              operation: 'getContentLikeDataAsync',
              userId: viewerUserId,
            },
            tags: CacheTagGenerators.social.like(
              targetType as 'bobblehead' | 'collection' | 'comment',
              targetId,
              viewerUserId || 'system',
            ),
            ttl: CACHE_CONFIG.TTL.SHORT,
          },
        );
      },
    );
  }

  /**
   * Get the like count for a target content item
   *
   * Cache behavior: Cached with default TTL, invalidated on like changes.
   *
   * @param targetId - ID of the target content
   * @param targetType - Type of target
   * @param dbInstance - Optional database executor
   * @returns Number of likes for the target
   */
  static async getLikeCountAsync(
    targetId: string,
    targetType: LikeTargetType,
    dbInstance?: DatabaseExecutor,
  ): Promise<number> {
    return executeFacadeOperation(
      {
        data: { targetId, targetType },
        facade: facadeName,
        method: 'getLikeCountAsync',
        operation: OPERATIONS.SOCIAL.GET_LIKE_COUNT,
      },
      async () => {
        return CacheService.cached(
          () => {
            const context = this.getPublicContext(dbInstance);
            return SocialQuery.getLikeCountAsync(targetId, targetType, context);
          },
          CACHE_KEYS.SOCIAL.LIKES(targetType, targetId),
          {
            context: {
              entityId: targetId,
              entityType: 'social',
              facade: facadeName,
              operation: 'getLikeCountAsync',
            },
            tags: CacheTagGenerators.social.like(targetType, targetId, 'system'),
          },
        );
      },
    );
  }

  /**
   * Get like data for multiple content items in batch
   *
   * Cache behavior: Cached with SHORT TTL (5 min), tags generated per content item.
   *
   * @param contentIds - Array of content IDs to fetch likes for
   * @param contentType - Type of content
   * @param viewerUserId - Optional user ID for personalized status
   * @param dbInstance - Optional database executor
   * @returns Map of content ID to like data
   */
  static async getLikesForMultipleContentItemsAsync(
    contentIds: Array<string>,
    contentType: LikeTargetType,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Map<string, { isLiked: boolean; likeCount: number; likeId: null | string }>> {
    type LikeDataMap = Map<string, { isLiked: boolean; likeCount: number; likeId: null | string }>;

    return executeFacadeOperation<LikeDataMap>(
      {
        data: { contentCount: contentIds.length, contentType },
        facade: facadeName,
        method: 'getLikesForMultipleContentItemsAsync',
        operation: OPERATIONS.SOCIAL.GET_USER_LIKE_STATUSES,
        userId: viewerUserId,
      },
      async (): Promise<LikeDataMap> => {
        if (contentIds.length === 0) return new Map();

        // Create cache key with hashed content IDs for proper cache segmentation
        const contentIdsHash = createHashFromObject(contentIds);
        const cacheKey = `${CACHE_KEYS.SOCIAL.LIKES(contentType, 'batch')}:${contentIdsHash}:${viewerUserId || 'public'}`;

        // Generate cache tags for each content item
        const cacheTags = contentIds.flatMap((contentId) =>
          CacheTagGenerators.social.like(
            contentType as 'bobblehead' | 'collection' | 'comment',
            contentId,
            viewerUserId || 'system',
          ),
        );

        // CacheService returns serializable data, so we cache an array and convert to Map
        type LikeDataEntry = [string, { isLiked: boolean; likeCount: number; likeId: null | string }];

        const cachedResult = await CacheService.cached<Array<LikeDataEntry>>(
          async () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);

            const resultMap = await SocialQuery.getLikesForMultipleContentItemsAsync(
              contentIds,
              contentType,
              context,
            );

            // Convert Map to array of entries for caching (Maps are not JSON-serializable)
            return Array.from(resultMap.entries()) as Array<LikeDataEntry>;
          },
          cacheKey,
          {
            context: {
              entityType: 'social',
              facade: facadeName,
              operation: 'getLikesForMultipleContentItemsAsync',
              userId: viewerUserId,
            },
            tags: cacheTags,
            ttl: CACHE_CONFIG.TTL.SHORT,
          },
        );

        // Convert cached array back to Map
        return new Map<string, { isLiked: boolean; likeCount: number; likeId: null | string }>(cachedResult);
      },
    );
  }

  /**
   * Get recent like activity for a target content item
   *
   * Cache behavior: Cached with SHORT TTL (5 min), segmented by pagination.
   *
   * @param targetId - ID of the target content
   * @param targetType - Type of target
   * @param options - Pagination options
   * @param viewerUserId - Optional viewer user ID
   * @param dbInstance - Optional database executor
   * @returns Array of recent like activity with user info
   */
  static async getRecentLikeActivityAsync(
    targetId: string,
    targetType: LikeTargetType,
    options: FindOptions = {},
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<LikeActivity>> {
    return executeFacadeOperation(
      {
        data: { targetId, targetType },
        facade: facadeName,
        method: 'getRecentLikeActivityAsync',
        operation: OPERATIONS.SOCIAL.GET_RECENT_LIKES,
        userId: viewerUserId,
      },
      async () => {
        // Create cache key with pagination parameters for proper cache segmentation
        const limit = options.limit || 10;
        const offset = options.offset || 0;
        const cacheKey = `${CACHE_KEYS.SOCIAL.LIKES(targetType, targetId)}:activity:${limit}:${offset}:${viewerUserId || 'public'}`;

        return CacheService.cached(
          async () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);

            const likes = await SocialQuery.getRecentLikesAsync(targetId, targetType, options, context);

            return likes.map((like) => ({
              createdAt: like.createdAt,
              id: like.id,
              targetId: like.targetId,
              targetType: like.targetType,
              user: like.user,
              userId: like.userId,
            }));
          },
          cacheKey,
          {
            context: {
              entityId: targetId,
              entityType: 'social',
              facade: facadeName,
              operation: 'getRecentLikeActivityAsync',
              userId: viewerUserId,
            },
            tags: CacheTagGenerators.social.like(
              targetType as 'bobblehead' | 'collection' | 'comment',
              targetId,
              viewerUserId || 'system',
            ),
            ttl: CACHE_CONFIG.TTL.SHORT,
          },
        );
      },
    );
  }

  /**
   * Get trending content based on like activity
   *
   * Cache behavior: Cached with REALTIME TTL (30 sec) for fresh trending data.
   *
   * @param targetType - Type of content to get trending for
   * @param options - Pagination options
   * @param viewerUserId - Optional viewer user ID
   * @param dbInstance - Optional database executor
   * @returns Array of trending content with like counts
   */
  static async getTrendingContentAsync(
    targetType: LikeTargetType,
    options: FindOptions = {},
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<TrendingContent>> {
    return executeFacadeOperation(
      {
        data: { targetType },
        facade: facadeName,
        method: 'getTrendingContentAsync',
        operation: OPERATIONS.SOCIAL.GET_TRENDING_CONTENT,
        userId: viewerUserId,
      },
      async () => {
        // Create cache key with pagination parameters for proper cache segmentation
        const limit = options.limit || 10;
        const offset = options.offset || 0;
        const optionsHash = createHashFromObject({ limit, offset });
        const cacheKey = `${CACHE_KEYS.SOCIAL.LIKES(targetType, 'trending')}:${optionsHash}`;

        return CacheService.cached(
          async () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);

            return SocialQuery.getTrendingContentAsync(targetType, options, context);
          },
          cacheKey,
          {
            context: {
              entityType: 'social',
              facade: facadeName,
              operation: 'getTrendingContentAsync',
              userId: viewerUserId,
            },
            tags: CacheTagGenerators.analytics.trending(),
            ttl: CACHE_CONFIG.TTL.REALTIME,
          },
        );
      },
    );
  }

  /**
   * Get the like status for a specific user on a target content item
   *
   * Cache behavior: Cached with SHORT TTL (5 min), invalidated on like toggle.
   *
   * @param targetId - ID of the target content
   * @param targetType - Type of target
   * @param userId - ID of the user to check status for
   * @param dbInstance - Optional database executor
   * @returns User's like status including isLiked and likeId
   */
  static async getUserLikeStatusAsync(
    targetId: string,
    targetType: LikeTargetType,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<UserLikeStatus> {
    return executeFacadeOperation(
      {
        data: { targetId, targetType },
        facade: facadeName,
        method: 'getUserLikeStatusAsync',
        operation: OPERATIONS.SOCIAL.GET_USER_LIKE_STATUS,
        userId,
      },
      async () => {
        // Create cache key with user context for proper cache segmentation
        const cacheKey = `${CACHE_KEYS.SOCIAL.LIKES(targetType, targetId)}:status:${userId}`;

        return CacheService.cached(
          async () => {
            const context = this.getUserContext(userId, dbInstance ?? db);
            return SocialQuery.getUserLikeStatusAsync(targetId, targetType, userId, context);
          },
          cacheKey,
          {
            context: {
              entityId: targetId,
              entityType: 'social',
              facade: facadeName,
              operation: 'getUserLikeStatusAsync',
              userId,
            },
            tags: CacheTagGenerators.social.like(
              targetType as 'bobblehead' | 'collection' | 'comment',
              targetId,
              userId,
            ),
            ttl: CACHE_CONFIG.TTL.SHORT,
          },
        );
      },
    );
  }

  /**
   * Toggle like status for a user on a target content item
   * Creates or removes a like and updates the like count
   *
   * Cache behavior: No direct caching (mutation). Cache invalidation handled at action layer.
   *
   * @param targetId - ID of the target content
   * @param targetType - Type of target
   * @param userId - ID of the user toggling the like
   * @param dbInstance - Optional database executor
   * @returns Result with new like status and updated count
   */
  static async toggleLikeAsync(
    targetId: string,
    targetType: LikeTargetType,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<LikeToggleResult> {
    return executeFacadeOperation(
      {
        data: { targetId, targetType },
        facade: facadeName,
        method: 'toggleLikeAsync',
        operation: OPERATIONS.SOCIAL.TOGGLE_LIKE,
        userId,
      },
      async () => {
        return dbInstance.transaction(async (tx) => {
          const context = this.getProtectedContext(userId, tx);

          // check current like status
          const currentStatus = await SocialQuery.getUserLikeStatusAsync(
            targetId,
            targetType,
            userId,
            context,
          );

          if (currentStatus.isLiked) {
            // unlike: delete the like and decrement count
            const deletedLike = await SocialQuery.deleteLikeAsync(targetId, targetType, userId, context);

            if (deletedLike && targetType !== 'collection') {
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

            if (newLike && targetType !== 'collection') {
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
      },
      {
        includeResultSummary: (result) => ({
          isLiked: result.isLiked,
          isSuccessful: result.isSuccessful,
          likeCount: result.likeCount,
        }),
      },
    );
  }

  /**
   * Update an existing comment's content
   * Validates ownership and edit window (admins bypass edit window)
   *
   * Cache behavior: No direct caching (mutation). Cache invalidation handled at action layer.
   *
   * @param commentId - ID of the comment to update
   * @param content - New content for the comment
   * @param userId - ID of the user requesting update (must be owner)
   * @param dbInstance - Optional database executor
   * @returns Result with updated comment or error message
   */
  static async updateCommentAsync(
    commentId: string,
    content: string,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<CommentMutationResult> {
    return executeFacadeOperation(
      {
        data: { commentId },
        facade: facadeName,
        method: 'updateCommentAsync',
        operation: OPERATIONS.COMMENTS.UPDATE_COMMENT,
        userId,
      },
      async () => {
        return dbInstance.transaction(async (tx) => {
          const context = this.getProtectedContext(userId, tx);

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
          const user = await UsersQuery.getUserByUserIdForAdminAsync(userId, context);
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
      },
      {
        includeResultSummary: (result) => ({
          commentId: result.comment?.id,
          hasError: !!result.error,
          isSuccessful: result.isSuccessful,
        }),
      },
    );
  }

  /**
   * Calculate the current nesting depth of a comment
   * Traverses up the comment tree to find the depth level
   * Returns 0 for root comments (no parent)
   */
  private static async calculateCommentDepthAsync(commentId: string, context: QueryContext): Promise<number> {
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
  private static async deleteCommentRepliesRecursiveAsync(
    commentId: string,
    context: QueryContext,
  ): Promise<void> {
    // fetch all direct replies
    const replies = await SocialQuery.getCommentRepliesAsync(commentId, {}, context);

    // recursively delete nested replies for each direct reply
    for (const reply of replies) {
      const hasNestedReplies = await SocialQuery.hasCommentRepliesAsync(reply.id, context);

      if (hasNestedReplies) {
        await this.deleteCommentRepliesRecursiveAsync(reply.id, context);
      }

      // soft delete the reply
      const deletedReply = await SocialQuery.deleteCommentAsync(reply.id, context);

      if (deletedReply) {
        // decrement comment count for each deleted reply (only for bobblehead targets)
        // collections use dynamic counts calculated from the comment table
        if (deletedReply.targetType === ENUMS.COMMENT.TARGET_TYPE[0]) {
          await SocialQuery.decrementCommentCountAsync(
            deletedReply.targetId,
            deletedReply.targetType,
            context,
          );
        }
      }
    }
  }
}
