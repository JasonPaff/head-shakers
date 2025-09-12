import { and, count, desc, eq, or, sql } from 'drizzle-orm';

import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { InsertLike, PublicLike, SelectLike } from '@/lib/validations/social.validation';

import { db } from '@/lib/db';
import { bobbleheads, collections, likes, subCollections } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export type LikeCountByTarget = {
  likeCount: number;
  targetId: string;
  targetType: 'bobblehead' | 'collection' | 'subcollection';
};

/**
 * type definitions for query results
 */
export type LikeRecord = SelectLike;

export type LikeWithUserInfo = LikeRecord & {
  user: {
    displayName: null | string;
    id: string;
    username: null | string;
  };
};

export type UserLikeStatus = {
  isLiked: boolean;
  likeId: null | string;
  targetId: string;
  targetType: 'bobblehead' | 'collection' | 'subcollection';
};

/**
 * social domain query service
 * handles all database operations for likes and social interactions
 */
export class SocialQuery extends BaseQuery {
  /**
   * create a new like
   */
  static async createLike(data: InsertLike, userId: string, dbInstance: DatabaseExecutor = db): Promise<LikeRecord | null> {
    const dbToUse = dbInstance ?? db;

    try {
      const result = await dbToUse
        .insert(likes)
        .values({ ...data, userId })
        .returning();

      return result?.[0] || null;
    } catch (error) {
      // unique constraint violation - user already liked this content
      if (error instanceof Error && 'code' in error && error.code === '23505') {
        return null;
      }
      throw error;
    }
  }

  /**
   * decrement like count for a target (used after successful like deletion)
   */
  static async decrementLikeCount(
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'subcollection',
    dbInstance: DatabaseExecutor = db,
  ): Promise<void> {
    const dbToUse = dbInstance ?? db;

    switch (targetType) {
      case 'bobblehead':
        await dbToUse
          .update(bobbleheads)
          .set({ likeCount: sql`GREATEST(0, ${bobbleheads.likeCount} - 1)` })
          .where(eq(bobbleheads.id, targetId));
        break;
      case 'collection':
        await dbToUse
          .update(collections)
          .set({ likeCount: sql`GREATEST(0, ${collections.likeCount} - 1)` })
          .where(eq(collections.id, targetId));
        break;
      case 'subcollection':
        await dbToUse
          .update(subCollections)
          .set({ likeCount: sql`GREATEST(0, ${subCollections.likeCount} - 1)` })
          .where(eq(subCollections.id, targetId));
        break;
      default:
        throw new Error(`Unknown target type: ${targetType as string}`);
    }
  }

  /**
   * delete a like (unlike)
   */
  static async deleteLike(
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'subcollection',
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<LikeRecord | null> {
    const dbToUse = dbInstance ?? db;

    const result = await dbToUse
      .delete(likes)
      .where(
        and(
          eq(likes.targetId, targetId),
          eq(likes.targetType, targetType),
          eq(likes.userId, userId),
        ),
      )
      .returning();

    return result?.[0] || null;
  }

  /**
   * get like count for a specific target
   */
  static async getLikeCount(
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'subcollection',
    context: QueryContext,
  ): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ count: count() })
      .from(likes)
      .where(
        and(
          eq(likes.targetId, targetId),
          eq(likes.targetType, targetType),
        ),
      );

    return result[0]?.count || 0;
  }

  /**
   * get like counts for multiple targets (batch operation)
   */
  static async getLikeCounts(
    targets: Array<{ targetId: string; targetType: 'bobblehead' | 'collection' | 'subcollection' }>,
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
      result.map(item => [`${item.targetType}:${item.targetId}`, item.likeCount])
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
   * get recent likes for a target with user information
   */
  static async getRecentLikes(
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'subcollection',
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<PublicLike & { user: { displayName: null | string; id: string; username: null | string } }>> {
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
      .where(
        and(
          eq(likes.targetId, targetId),
          eq(likes.targetType, targetType),
        ),
      )
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
   * get trending content based on recent like activity
   */
  static async getTrendingContent(
    targetType: 'bobblehead' | 'collection' | 'subcollection',
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
   * get user's like status for a specific target
   */
  static async getUserLikeStatus(
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'subcollection',
    userId: string,
    context: QueryContext,
  ): Promise<UserLikeStatus> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ id: likes.id })
      .from(likes)
      .where(
        and(
          eq(likes.targetId, targetId),
          eq(likes.targetType, targetType),
          eq(likes.userId, userId),
        ),
      )
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
   * get multiple user like statuses for batch operations
   */
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
      .where(
        and(
          eq(likes.userId, userId),
          or(...targetConditions),
        ),
      );

    // create a map of liked targets
    const likedTargets = new Map(
      result.map(like => [`${like.targetType}:${like.targetId}`, like.id])
    );

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
   * increment like count for a target (used after successful like creation)
   */
  static async incrementLikeCount(
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'subcollection',
    dbInstance: DatabaseExecutor = db,
  ): Promise<void> {
    const dbToUse = dbInstance ?? db;

    switch (targetType) {
      case 'bobblehead':
        await dbToUse
          .update(bobbleheads)
          .set({ likeCount: sql`${bobbleheads.likeCount} + 1` })
          .where(eq(bobbleheads.id, targetId));
        break;
      case 'collection':
        await dbToUse
          .update(collections)
          .set({ likeCount: sql`${collections.likeCount} + 1` })
          .where(eq(collections.id, targetId));
        break;
      case 'subcollection':
        await dbToUse
          .update(subCollections)
          .set({ likeCount: sql`${subCollections.likeCount} + 1` })
          .where(eq(subCollections.id, targetId));
        break;
      default:
        throw new Error(`Unknown target type: ${targetType as string}`);
    }
  }
}