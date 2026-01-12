import { and, count, desc, eq, inArray, isNull, or, sql } from 'drizzle-orm';

import type { ENUMS, LikeTargetType } from '@/lib/constants';
import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';
import type {
  InsertComment,
  InsertLike,
  PublicComment,
  PublicLike,
  SelectComment,
  SelectLike,
} from '@/lib/validations/social.validation';

import { MAX_COMMENT_NESTING_DEPTH } from '@/lib/constants';
import { bobbleheads, comments, likes, userBlocks, users } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export type CommentRecord = SelectComment;

export type CommentTargetType = (typeof ENUMS.COMMENT.TARGET_TYPE)[number];

export type CommentWithDepth = CommentWithUser & {
  depth: number;
  replies?: Array<CommentWithDepth>;
  replyCount?: number;
};

export type CommentWithUser = PublicComment & {
  user: null | {
    avatarUrl: null | string;
    id: string;
    username: null | string;
  };
};

export type LikeCountByTarget = {
  likeCount: number;
  targetId: string;
  targetType: LikeTargetType;
};

export type LikeRecord = SelectLike;

export type UserLikeStatus = {
  isLiked: boolean;
  likeId: null | string;
  targetId: string;
  targetType: LikeTargetType;
};

/**
 * Social query class for database operations related to comments and likes.
 * Provides methods for creating, reading, updating, and deleting social interactions
 * on various content types (bobbleheads, collections, etc.)
 */
export class SocialQuery extends BaseQuery {
  /**
   * Create a new comment on a target entity
   */
  static async createCommentAsync(
    data: InsertComment,
    userId: string,
    context: QueryContext,
  ): Promise<CommentRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .insert(comments)
      .values({ ...data, userId })
      .returning();

    return result?.[0] || null;
  }

  /**
   * Create a new like on a target entity
   * Checks for existing like to prevent duplicates
   */
  static async createLikeAsync(
    data: InsertLike,
    userId: string,
    context: QueryContext,
  ): Promise<LikeRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const isAlreadyLiked = await dbInstance
      .select({ id: likes.id })
      .from(likes)
      .where(
        and(
          eq(likes.targetId, data.targetId),
          eq(likes.targetType, data.targetType),
          eq(likes.userId, userId),
        ),
      )
      .limit(1);

    if (isAlreadyLiked.length > 0) return null;

    const result = await dbInstance
      .insert(likes)
      .values({ ...data, userId })
      .returning();

    return result?.[0] || null;
  }

  /**
   * Decrement comment count on a target entity
   * Uses GREATEST to prevent negative counts
   */
  static async decrementCommentCountAsync(
    targetId: string,
    targetType: CommentTargetType,
    context: QueryContext,
  ): Promise<void> {
    const dbInstance = this.getDbInstance(context);

    // Currently only supports 'bobblehead' target type
    if (targetType === 'bobblehead') {
      await dbInstance
        .update(bobbleheads)
        .set({ commentCount: sql`GREATEST(0, ${bobbleheads.commentCount} - 1)` })
        .where(eq(bobbleheads.id, targetId));
      return;
    }

    throw new Error(`Unknown target type: ${targetType as string}`);
  }

  /**
   * Decrement like count on a target entity
   * Uses GREATEST to prevent negative counts
   */
  static async decrementLikeCountAsync(
    targetId: string,
    targetType: LikeTargetType,
    context: QueryContext,
  ): Promise<void> {
    const dbInstance = this.getDbInstance(context);

    // Currently only supports 'bobblehead' target type
    if (targetType === 'bobblehead') {
      await dbInstance
        .update(bobbleheads)
        .set({ likeCount: sql`GREATEST(0, ${bobbleheads.likeCount} - 1)` })
        .where(eq(bobbleheads.id, targetId));
      return;
    }

    throw new Error(`Unknown target type: ${targetType as string}`);
  }

  /**
   * Soft delete a comment by setting deletedAt timestamp
   */
  static async deleteCommentAsync(commentId: string, context: QueryContext): Promise<CommentRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(comments)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(comments.id, commentId))
      .returning();

    return result?.[0] || null;
  }

  /**
   * Hard delete a like from the database
   */
  static async deleteLikeAsync(
    targetId: string,
    targetType: LikeTargetType,
    userId: string,
    context: QueryContext,
  ): Promise<LikeRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .delete(likes)
      .where(and(eq(likes.targetId, targetId), eq(likes.targetType, targetType), eq(likes.userId, userId)))
      .returning();

    return result?.[0] || null;
  }

  /**
   * Get a comment by ID without user data
   */
  static async getCommentByIdAsync(commentId: string, context: QueryContext): Promise<CommentRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select()
      .from(comments)
      .where(and(eq(comments.id, commentId), isNull(comments.deletedAt)))
      .limit(1);

    return result?.[0] || null;
  }

  /**
   * Get a comment by ID with user data
   * Uses left join to include user info even if user is deleted
   */
  static async getCommentByIdWithUserAsync(
    commentId: string,
    context: QueryContext,
  ): Promise<CommentWithUser | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select(this._selectCommentWithUser())
      .from(comments)
      .leftJoin(users, and(eq(comments.userId, users.id), isNull(users.deletedAt)))
      .where(and(eq(comments.id, commentId), isNull(comments.deletedAt)))
      .limit(1);

    return result?.[0] || null;
  }

  /**
   * Get the count of top-level comments for a target
   */
  static async getCommentCountAsync(
    targetId: string,
    targetType: CommentTargetType,
    context: QueryContext,
  ): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ count: count() })
      .from(comments)
      .where(
        and(
          eq(comments.targetId, targetId),
          eq(comments.targetType, targetType),
          isNull(comments.parentCommentId),
          isNull(comments.deletedAt),
        ),
      );

    return result[0]?.count || 0;
  }

  /**
   * Get comment replies for a specific parent comment
   * Uses composite index on (parentCommentId, createdAt) for optimal performance
   */
  static async getCommentRepliesAsync(
    parentCommentId: string,
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<CommentWithUser>> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    const query = dbInstance
      .select(this._selectCommentWithUser())
      .from(comments)
      .leftJoin(users, and(eq(comments.userId, users.id), isNull(users.deletedAt)))
      .where(and(eq(comments.parentCommentId, parentCommentId), isNull(comments.deletedAt)))
      .orderBy(desc(comments.createdAt));

    if (pagination.limit) {
      query.limit(pagination.limit);
    }

    if (pagination.offset) {
      query.offset(pagination.offset);
    }

    return query;
  }

  /**
   * Get count of direct replies for a comment
   * Uses composite index on (parentCommentId, createdAt)
   */
  static async getCommentReplyCountAsync(parentCommentId: string, context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ count: count() })
      .from(comments)
      .where(and(eq(comments.parentCommentId, parentCommentId), isNull(comments.deletedAt)));

    return result[0]?.count || 0;
  }

  /**
   * Get all comments for a target entity with user data
   */
  static async getCommentsAsync(
    targetId: string,
    targetType: CommentTargetType,
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<CommentWithUser>> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    const query = dbInstance
      .select(this._selectCommentWithUser())
      .from(comments)
      .leftJoin(users, and(eq(comments.userId, users.id), isNull(users.deletedAt)))
      .where(
        and(eq(comments.targetId, targetId), eq(comments.targetType, targetType), isNull(comments.deletedAt)),
      )
      .orderBy(desc(comments.createdAt));

    if (pagination.limit) {
      query.limit(pagination.limit);
    }

    if (pagination.offset) {
      query.offset(pagination.offset);
    }

    return query;
  }

  /**
   * Get top-level comments for a target with nested replies
   * Fetches root comments (parentCommentId is null) and recursively loads replies
   *
   * @param targetId - The target entity ID (bobblehead, collection)
   * @param targetType - The type of target entity
   * @param options - Pagination and filtering options
   * @param context - Query context with database instance
   * @returns Array of root comments with nested replies and depth tracking
   */
  static async getCommentsWithRepliesAsync(
    targetId: string,
    targetType: CommentTargetType,
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<CommentWithDepth>> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    // fetch only root comments (no parent)
    const query = dbInstance
      .select(this._selectCommentWithUser())
      .from(comments)
      .leftJoin(users, and(eq(comments.userId, users.id), isNull(users.deletedAt)))
      .where(
        and(
          eq(comments.targetId, targetId),
          eq(comments.targetType, targetType),
          isNull(comments.parentCommentId),
          isNull(comments.deletedAt),
        ),
      )
      .orderBy(desc(comments.createdAt));

    if (pagination.limit) {
      query.limit(pagination.limit);
    }

    if (pagination.offset) {
      query.offset(pagination.offset);
    }

    const rootComments = await query;

    // recursively fetch replies for each root comment
    const commentsWithDepth = await Promise.all(
      rootComments.map(async (comment) => {
        const replies = await this.getCommentRepliesAsync(comment.id, {}, context);

        const repliesWithDepth =
          replies.length > 0 ?
            await Promise.all(
              replies.map((reply) => this.getCommentThreadWithRepliesAsync(reply.id, 1, context)),
            )
          : [];

        return {
          ...comment,
          depth: 0,
          replies: repliesWithDepth.filter((reply): reply is CommentWithDepth => reply !== null),
          replyCount: replies.length,
        };
      }),
    );

    return commentsWithDepth;
  }

  /**
   * Get comment thread with nested replies up to MAX_COMMENT_NESTING_DEPTH
   * Recursively fetches child comments and calculates depth for each level
   * Uses composite index on (parentCommentId, createdAt) for performance
   *
   * @param commentId - The root comment ID to fetch thread for
   * @param currentDepth - Current nesting depth (0 for root comment)
   * @param context - Query context with database instance
   * @returns Comment with nested replies and depth tracking
   */
  static async getCommentThreadWithRepliesAsync(
    commentId: string,
    currentDepth: number = 0,
    context: QueryContext,
  ): Promise<CommentWithDepth | null> {
    // fetch the comment with user data
    const comment = await this.getCommentByIdWithUserAsync(commentId, context);

    if (!comment) {
      return null;
    }

    // initialize with depth tracking
    const commentWithDepth: CommentWithDepth = {
      ...comment,
      depth: currentDepth,
      replies: [],
    };

    // stop recursion at max depth to prevent performance issues and maintain UI usability
    if (currentDepth >= MAX_COMMENT_NESTING_DEPTH) {
      return commentWithDepth;
    }

    // fetch direct replies using indexed query
    const replies = await this.getCommentRepliesAsync(commentId, {}, context);

    // recursively fetch nested replies for each direct reply
    if (replies.length > 0) {
      const repliesWithDepth = await Promise.all(
        replies.map((reply) => this.getCommentThreadWithRepliesAsync(reply.id, currentDepth + 1, context)),
      );

      // filter out null results and add to comment
      commentWithDepth.replies = repliesWithDepth.filter(
        (reply): reply is CommentWithDepth => reply !== null,
      );
      commentWithDepth.replyCount = replies.length;
    }

    return commentWithDepth;
  }

  /**
   * Get the like count for a specific target
   */
  static async getLikeCountAsync(
    targetId: string,
    targetType: LikeTargetType,
    context: QueryContext,
  ): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ count: count() })
      .from(likes)
      .where(and(eq(likes.targetId, targetId), eq(likes.targetType, targetType)));

    return result[0]?.count || 0;
  }

  /**
   * Get like counts for multiple targets in a single query
   * Returns counts for all requested targets (0 if not found)
   */
  static async getLikeCountsAsync(
    targets: Array<{ targetId: string; targetType: LikeTargetType }>,
    context: QueryContext,
  ): Promise<Array<LikeCountByTarget>> {
    const dbInstance = this.getDbInstance(context);

    if (targets.length === 0) {
      return [];
    }

    // build conditions for each target
    const targetConditions = targets.map(({ targetId, targetType }) =>
      and(eq(likes.targetId, targetId), eq(likes.targetType, targetType)),
    );

    const result = await dbInstance
      .select({
        likeCount: count(),
        targetId: likes.targetId,
        targetType: likes.targetType,
      })
      .from(likes)
      .where(or(...targetConditions))
      .groupBy(likes.targetId, likes.targetType);

    // create a map of like counts
    const likeCountMap = new Map(
      result.map((item) => [`${item.targetType}:${item.targetId}`, item.likeCount]),
    );

    // return counts for all requested targets (0 if not found)
    return targets.map(({ targetId, targetType }) => {
      const key = `${targetType}:${targetId}`;
      const likeCount = likeCountMap.get(key) || 0;

      return {
        likeCount,
        targetId,
        targetType,
      };
    });
  }

  /**
   * Get like data for multiple content items in a single query
   * Returns a map with like count and user's like status for each content item
   */
  static async getLikesForMultipleContentItemsAsync(
    contentIds: Array<string>,
    contentType: LikeTargetType,
    context: QueryContext,
  ): Promise<Map<string, { isLiked: boolean; likeCount: number; likeId: null | string }>> {
    const dbInstance = this.getDbInstance(context);
    const result = new Map<string, { isLiked: boolean; likeCount: number; likeId: null | string }>();

    if (contentIds.length === 0) {
      return result;
    }

    const likeCountQuery = await dbInstance
      .select({
        likeCount: count(),
        targetId: likes.targetId,
      })
      .from(likes)
      .where(and(inArray(likes.targetId, contentIds), eq(likes.targetType, contentType)))
      .groupBy(likes.targetId);

    const likeCountMap = new Map(likeCountQuery.map((item) => [item.targetId, item.likeCount]));

    let userLikeMap = new Map<string, string>();
    if (context.userId) {
      const userLikesQuery = await dbInstance
        .select({
          id: likes.id,
          targetId: likes.targetId,
        })
        .from(likes)
        .where(
          and(
            inArray(likes.targetId, contentIds),
            eq(likes.targetType, contentType),
            eq(likes.userId, context.userId),
          ),
        );

      userLikeMap = new Map(userLikesQuery.map((like) => [like.targetId, like.id]));
    }

    for (const contentId of contentIds) {
      const likeCount = likeCountMap.get(contentId) || 0;
      const likeId = userLikeMap.get(contentId) || null;

      result.set(contentId, {
        isLiked: !!likeId,
        likeCount,
        likeId,
      });
    }

    return result;
  }

  /**
   * Get recent likes for a target with user data
   */
  static async getRecentLikesAsync(
    targetId: string,
    targetType: LikeTargetType,
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<PublicLike & { user: { id: string; username: null | string } }>> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    const query = dbInstance
      .select(this._selectLikeWithUser())
      .from(likes)
      .leftJoin(users, and(eq(likes.userId, users.id), isNull(users.deletedAt)))
      .where(and(eq(likes.targetId, targetId), eq(likes.targetType, targetType)))
      .orderBy(desc(likes.createdAt));

    if (pagination.limit) {
      query.limit(pagination.limit);
    }

    if (pagination.offset) {
      query.offset(pagination.offset);
    }

    return query;
  }

  /**
   * Get trending content based on recent like activity
   * Returns content with high like activity in the last 7 days
   */
  static async getTrendingContentAsync(
    targetType: LikeTargetType,
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<{ likeCount: number; recentLikeCount: number; targetId: string }>> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    // get content with high recent like activity (last 7 days)
    const query = dbInstance
      .select({
        likeCount: count(likes.id),
        recentLikeCount: count(sql`CASE WHEN ${likes.createdAt} >= NOW() - INTERVAL '7 days' THEN 1 END`),
        targetId: likes.targetId,
      })
      .from(likes)
      .where(eq(likes.targetType, targetType))
      .groupBy(likes.targetId)
      .having(sql`COUNT(CASE WHEN ${likes.createdAt} >= NOW() - INTERVAL '7 days' THEN 1 END) > 0`)
      .orderBy(
        desc(sql`COUNT(CASE WHEN ${likes.createdAt} >= NOW() - INTERVAL '7 days' THEN 1 END)`),
        desc(count(likes.id)),
      );

    if (pagination.limit) {
      query.limit(pagination.limit);
    }

    if (pagination.offset) {
      query.offset(pagination.offset);
    }

    return query;
  }

  /**
   * Get a user's like status for a specific target
   */
  static async getUserLikeStatusAsync(
    targetId: string,
    targetType: LikeTargetType,
    userId: string,
    context: QueryContext,
  ): Promise<UserLikeStatus> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ id: likes.id })
      .from(likes)
      .where(and(eq(likes.targetId, targetId), eq(likes.targetType, targetType), eq(likes.userId, userId)))
      .limit(1);

    const like = result[0];

    return {
      isLiked: !!like,
      likeId: like?.id || null,
      targetId,
      targetType,
    };
  }

  /**
   * Get a user's like status for multiple targets in a single query
   */
  static async getUserLikeStatusesAsync(
    targets: Array<{ targetId: string; targetType: 'bobblehead' | 'collection' }>,
    userId: string,
    context: QueryContext,
  ): Promise<Array<UserLikeStatus>> {
    const dbInstance = this.getDbInstance(context);

    if (targets.length === 0) {
      return [];
    }

    // build conditions for each target
    const targetConditions = targets.map(({ targetId, targetType }) =>
      and(eq(likes.targetId, targetId), eq(likes.targetType, targetType)),
    );

    const result = await dbInstance
      .select({
        id: likes.id,
        targetId: likes.targetId,
        targetType: likes.targetType,
      })
      .from(likes)
      .where(and(eq(likes.userId, userId), or(...targetConditions)));

    // create a map of liked targets
    const likedTargets = new Map(result.map((like) => [`${like.targetType}:${like.targetId}`, like.id]));

    // return status for all requested targets
    return targets.map(({ targetId, targetType }) => {
      const key = `${targetType}:${targetId}`;
      const likeId = likedTargets.get(key) || null;

      return {
        isLiked: !!likeId,
        likeId,
        targetId,
        targetType,
      };
    });
  }

  /**
   * Check if a comment has any replies
   * Useful for showing deletion warnings and UI states
   */
  static async hasCommentRepliesAsync(commentId: string, context: QueryContext): Promise<boolean> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ id: comments.id })
      .from(comments)
      .where(and(eq(comments.parentCommentId, commentId), isNull(comments.deletedAt)))
      .limit(1);

    return result.length > 0;
  }

  /**
   * Increment comment count on a target entity
   */
  static async incrementCommentCountAsync(
    targetId: string,
    targetType: CommentTargetType,
    context: QueryContext,
  ): Promise<void> {
    const dbInstance = this.getDbInstance(context);

    // Currently only supports 'bobblehead' target type
    if (targetType === 'bobblehead') {
      await dbInstance
        .update(bobbleheads)
        .set({ commentCount: sql`${bobbleheads.commentCount} + 1` })
        .where(eq(bobbleheads.id, targetId));
      return;
    }

    throw new Error(`Unknown target type: ${targetType as string}`);
  }

  /**
   * Increment like count on a target entity
   */
  static async incrementLikeCountAsync(
    targetId: string,
    targetType: LikeTargetType,
    context: QueryContext,
  ): Promise<void> {
    const dbInstance = this.getDbInstance(context);

    // Currently only supports 'bobblehead' target type
    if (targetType === 'bobblehead') {
      await dbInstance
        .update(bobbleheads)
        .set({ likeCount: sql`${bobbleheads.likeCount} + 1` })
        .where(eq(bobbleheads.id, targetId));
      return;
    }

    throw new Error(`Unknown target type: ${targetType as string}`);
  }

  /**
   * Check if a user is blocked by another user
   * Returns true if blockedUserId has been blocked by blockerUserId
   */
  static async isUserBlockedByAsync(
    blockedUserId: string,
    blockerUserId: string,
    context: QueryContext,
  ): Promise<boolean> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ id: userBlocks.id })
      .from(userBlocks)
      .where(and(eq(userBlocks.blockerId, blockerUserId), eq(userBlocks.blockedId, blockedUserId)))
      .limit(1);

    return result.length > 0;
  }

  /**
   * Update a comment's content and set editedAt timestamp
   */
  static async updateCommentAsync(
    commentId: string,
    content: string,
    context: QueryContext,
  ): Promise<CommentRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(comments)
      .set({
        content,
        editedAt: new Date(),
      })
      .where(eq(comments.id, commentId))
      .returning();

    return result?.[0] || null;
  }

  /**
   * Private helper to build the select pattern for comments with user data.
   * Uses SQL expressions for user fields to maintain null handling when user is deleted.
   */
  private static _selectCommentWithUser() {
    return {
      content: comments.content,
      createdAt: comments.createdAt,
      editedAt: comments.editedAt,
      id: comments.id,
      likeCount: comments.likeCount,
      parentCommentId: comments.parentCommentId,
      targetId: comments.targetId,
      targetType: comments.targetType,
      user: {
        avatarUrl: sql<null | string>`${users.avatarUrl}`,
        id: sql<string>`${users.id}`,
        username: sql<null | string>`${users.username}`,
      },
      userId: comments.userId,
    };
  }

  /**
   * Private helper to build the select pattern for likes with user data.
   * Uses SQL expressions for user fields to maintain null handling when user is deleted.
   */
  private static _selectLikeWithUser() {
    return {
      createdAt: likes.createdAt,
      id: likes.id,
      targetId: likes.targetId,
      targetType: likes.targetType,
      user: {
        id: sql<string>`${users.id}`,
        username: sql<null | string>`${users.username}`,
      },
      userId: likes.userId,
    };
  }
}
