import { and, count, desc, eq, or, sql } from 'drizzle-orm';

import type { LikeTargetType } from '@/lib/constants';
import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';
import type { InsertLike, PublicLike, SelectLike } from '@/lib/validations/social.validation';

import { ENUMS } from '@/lib/constants';
import { bobbleheads, collections, likes, subCollections } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

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
  static async createLike(
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

  static async decrementLikeCount(
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

  static async deleteLike(
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

  static async getLikeCount(
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

  static async getLikeCounts(
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

  static async getRecentLikes(
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

  static async getTrendingContent(
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

  static async getUserLikeStatus(
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

  static async getUserLikeStatuses(
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

  static async incrementLikeCount(
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
}
