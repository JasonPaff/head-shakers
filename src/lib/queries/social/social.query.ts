import { and, count, desc, eq, inArray, or, sql } from 'drizzle-orm';

import type { LikeTargetType } from '@/lib/constants';
import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';
import type {
  InsertComment,
  InsertLike,
  PublicComment,
  PublicLike,
  SelectComment,
  SelectLike,
} from '@/lib/validations/social.validation';

import { ENUMS } from '@/lib/constants';
import { bobbleheads, collections, comments, likes, subCollections, users } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export type CommentRecord = SelectComment;

export type CommentTargetType = (typeof ENUMS.COMMENT.TARGET_TYPE)[number];

export type CommentWithUser = PublicComment & {
  user: null | {
    avatarUrl: null | string;
    displayName: null | string;
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

export class SocialQuery extends BaseQuery {
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

  static async decrementCommentCountAsync(
    targetId: string,
    targetType: CommentTargetType,
    context: QueryContext,
  ): Promise<void> {
    const dbInstance = this.getDbInstance(context);

    switch (targetType) {
      case ENUMS.COMMENT.TARGET_TYPE[0]:
        await dbInstance
          .update(bobbleheads)
          .set({ commentCount: sql`GREATEST(0, ${bobbleheads.commentCount} - 1)` })
          .where(eq(bobbleheads.id, targetId));
        break;
      case ENUMS.COMMENT.TARGET_TYPE[1]:
        await dbInstance
          .update(collections)
          .set({ commentCount: sql`GREATEST(0, ${collections.commentCount} - 1)` })
          .where(eq(collections.id, targetId));
        break;
      case ENUMS.COMMENT.TARGET_TYPE[2]:
        await dbInstance
          .update(subCollections)
          .set({ commentCount: sql`GREATEST(0, ${subCollections.commentCount} - 1)` })
          .where(eq(subCollections.id, targetId));
        break;
      default:
        throw new Error(`Unknown target type: ${targetType as string}`);
    }
  }

  static async decrementLikeCountAsync(
    targetId: string,
    targetType: LikeTargetType,
    context: QueryContext,
  ): Promise<void> {
    const dbInstance = this.getDbInstance(context);

    switch (targetType) {
      case ENUMS.LIKE.TARGET_TYPE[0]:
        await dbInstance
          .update(bobbleheads)
          .set({ likeCount: sql`GREATEST(0, ${bobbleheads.likeCount} - 1)` })
          .where(eq(bobbleheads.id, targetId));
        break;
      case ENUMS.LIKE.TARGET_TYPE[1]:
        await dbInstance
          .update(collections)
          .set({ likeCount: sql`GREATEST(0, ${collections.likeCount} - 1)` })
          .where(eq(collections.id, targetId));
        break;
      case ENUMS.LIKE.TARGET_TYPE[2]:
        await dbInstance
          .update(subCollections)
          .set({ likeCount: sql`GREATEST(0, ${subCollections.likeCount} - 1)` })
          .where(eq(subCollections.id, targetId));
        break;
      default:
        throw new Error(`Unknown target type: ${targetType as string}`);
    }
  }

  static async deleteCommentAsync(commentId: string, context: QueryContext): Promise<CommentRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(comments)
      .set({
        deletedAt: new Date(),
        isDeleted: true,
      })
      .where(eq(comments.id, commentId))
      .returning();

    return result?.[0] || null;
  }

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

  static async getCommentByIdAsync(commentId: string, context: QueryContext): Promise<CommentRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select()
      .from(comments)
      .where(and(eq(comments.id, commentId), eq(comments.isDeleted, false)))
      .limit(1);

    return result?.[0] || null;
  }

  static async getCommentByIdWithUserAsync(
    commentId: string,
    context: QueryContext,
  ): Promise<CommentWithUser | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({
        content: comments.content,
        createdAt: comments.createdAt,
        editedAt: comments.editedAt,
        id: comments.id,
        isEdited: comments.isEdited,
        likeCount: comments.likeCount,
        parentCommentId: comments.parentCommentId,
        targetId: comments.targetId,
        targetType: comments.targetType,
        user: {
          avatarUrl: users.avatarUrl,
          displayName: users.displayName,
          id: users.id,
          username: users.username,
        },
        userId: comments.userId,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(and(eq(comments.id, commentId), eq(comments.isDeleted, false)))
      .limit(1);

    return result?.[0] || null;
  }

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
        and(eq(comments.targetId, targetId), eq(comments.targetType, targetType), eq(comments.isDeleted, false)),
      );

    return result[0]?.count || 0;
  }

  static async getCommentsAsync(
    targetId: string,
    targetType: CommentTargetType,
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<CommentWithUser>> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    const query = dbInstance
      .select({
        content: comments.content,
        createdAt: comments.createdAt,
        editedAt: comments.editedAt,
        id: comments.id,
        isEdited: comments.isEdited,
        likeCount: comments.likeCount,
        parentCommentId: comments.parentCommentId,
        targetId: comments.targetId,
        targetType: comments.targetType,
        user: {
          avatarUrl: users.avatarUrl,
          displayName: users.displayName,
          id: users.id,
          username: users.username,
        },
        userId: comments.userId,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(
        and(
          eq(comments.targetId, targetId),
          eq(comments.targetType, targetType),
          eq(comments.isDeleted, false),
        ),
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

  // ==================== Comment Methods ====================

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

  static async getRecentLikesAsync(
    targetId: string,
    targetType: LikeTargetType,
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<
    Array<PublicLike & { user: { displayName: null | string; id: string; username: null | string } }>
  > {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    const query = dbInstance
      .select({
        createdAt: likes.createdAt,
        id: likes.id,
        targetId: likes.targetId,
        targetType: likes.targetType,
        user: {
          displayName: sql<null | string>`users.display_name`,
          id: sql<string>`users.id`,
          username: sql<null | string>`users.username`,
        },
        userId: likes.userId,
      })
      .from(likes)
      .leftJoin(sql`users`, eq(likes.userId, sql`users.id`))
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

  static async getUserLikeStatusesAsync(
    targets: Array<{ targetId: string; targetType: 'bobblehead' | 'collection' | 'subcollection' }>,
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

  static async incrementCommentCountAsync(
    targetId: string,
    targetType: CommentTargetType,
    context: QueryContext,
  ): Promise<void> {
    const dbInstance = this.getDbInstance(context);

    switch (targetType) {
      case ENUMS.COMMENT.TARGET_TYPE[0]:
        await dbInstance
          .update(bobbleheads)
          .set({ commentCount: sql`${bobbleheads.commentCount} + 1` })
          .where(eq(bobbleheads.id, targetId));
        break;
      case ENUMS.COMMENT.TARGET_TYPE[1]:
        await dbInstance
          .update(collections)
          .set({ commentCount: sql`${collections.commentCount} + 1` })
          .where(eq(collections.id, targetId));
        break;
      case ENUMS.COMMENT.TARGET_TYPE[2]:
        await dbInstance
          .update(subCollections)
          .set({ commentCount: sql`${subCollections.commentCount} + 1` })
          .where(eq(subCollections.id, targetId));
        break;
      default:
        throw new Error(`Unknown target type: ${targetType as string}`);
    }
  }

  static async incrementLikeCountAsync(
    targetId: string,
    targetType: LikeTargetType,
    context: QueryContext,
  ): Promise<void> {
    const dbInstance = this.getDbInstance(context);

    switch (targetType) {
      case ENUMS.LIKE.TARGET_TYPE[0]:
        await dbInstance
          .update(bobbleheads)
          .set({ likeCount: sql`${bobbleheads.likeCount} + 1` })
          .where(eq(bobbleheads.id, targetId));
        break;
      case ENUMS.LIKE.TARGET_TYPE[1]:
        await dbInstance
          .update(collections)
          .set({ likeCount: sql`${collections.likeCount} + 1` })
          .where(eq(collections.id, targetId));
        break;
      case ENUMS.LIKE.TARGET_TYPE[2]:
        await dbInstance
          .update(subCollections)
          .set({ likeCount: sql`${subCollections.likeCount} + 1` })
          .where(eq(subCollections.id, targetId));
        break;
      default:
        throw new Error(`Unknown target type: ${targetType as string}`);
    }
  }

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
        isEdited: true,
      })
      .where(eq(comments.id, commentId))
      .returning();

    return result?.[0] || null;
  }
}
