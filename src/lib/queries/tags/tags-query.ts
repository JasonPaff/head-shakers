import { and, count, desc, eq, ilike, inArray, isNull, or, sql } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';
import type { InsertTag, UpdateTag } from '@/lib/validations/tags.validation';

import { bobbleheadTags, tags } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

/**
 * tag record with usage statistics
 */
export type TagRecord = typeof tags.$inferSelect;

export type TagStats = {
  bobbleheadCount: number;
  isSystem: boolean;
  lastUsed: Date | null;
};

export type TagWithUsage = TagRecord & {
  usageCount: number;
};

/**
 * tag domain query service
 * handles all database operations for tags with consistent patterns
 */
export class TagsQuery extends BaseQuery {
  /**
   * attach tags to a bobblehead
   */
  static async attachToBobblehead(
    bobbleheadId: string,
    tagIds: Array<string>,
    context: QueryContext,
  ): Promise<boolean> {
    const dbInstance = this.getDbInstance(context);

    try {
      // insert new associations (ignore duplicates with ON CONFLICT)
      const insertData = tagIds.map((tagId) => ({
        bobbleheadId,
        tagId,
      }));

      await dbInstance.insert(bobbleheadTags).values(insertData).onConflictDoNothing();

      // increment usage count for each tag
      if (tagIds.length > 0) {
        await dbInstance
          .update(tags)
          .set({
            updatedAt: sql`now()`,
            usageCount: sql`${tags.usageCount} + 1`,
          })
          .where(inArray(tags.id, tagIds));
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * count total custom tags for a user
   */
  static async countUserTags(userId: string, context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ count: count() })
      .from(tags)
      .where(eq(tags.userId, userId));

    return result[0]?.count || 0;
  }

  /**
   * create a new tag
   */
  static async create(data: InsertTag, userId: string, context: QueryContext): Promise<null | TagRecord> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .insert(tags)
      .values({ ...data, userId })
      .returning();

    return result?.[0] || null;
  }

  /**
   * delete a tag (only if not in use and user owns it)
   */
  static async delete(tagId: string, userId: string, context: QueryContext): Promise<null | TagRecord> {
    const dbInstance = this.getDbInstance(context);

    // verify ownership and that tag is not a system tag
    const tag = await this.findById(tagId, userId, context);
    if (!tag || tag.userId !== userId) {
      return null;
    }

    // check if tag is in use
    const isInUse = await this.isTagInUse(tagId, context);
    if (isInUse) {
      return null;
    }

    const result = await dbInstance
      .delete(tags)
      .where(and(eq(tags.id, tagId), eq(tags.userId, userId)))
      .returning();

    return result?.[0] || null;
  }

  /**
   * detach tags from a bobblehead
   */
  static async detachFromBobblehead(
    bobbleheadId: string,
    tagIds: Array<string>,
    context: QueryContext,
  ): Promise<boolean> {
    const dbInstance = this.getDbInstance(context);

    try {
      // remove associations
      await dbInstance
        .delete(bobbleheadTags)
        .where(and(eq(bobbleheadTags.bobbleheadId, bobbleheadId), inArray(bobbleheadTags.tagId, tagIds)));

      // decrement usage count for each tag
      if (tagIds.length > 0) {
        await dbInstance
          .update(tags)
          .set({
            updatedAt: sql`now()`,
            usageCount: sql`GREATEST(${tags.usageCount} - 1, 0)`,
          })
          .where(inArray(tags.id, tagIds));
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * find all tags accessible to a user (system tags + user's custom tags)
   */
  static async findAll(userId: null | string, context: QueryContext): Promise<Array<TagRecord>> {
    const dbInstance = this.getDbInstance(context);

    const conditions = [];

    if (userId) {
      // return system tags (userId = null) and user's custom tags
      conditions.push(or(isNull(tags.userId), eq(tags.userId, userId)));
    } else {
      // return only system tags for anonymous users
      conditions.push(isNull(tags.userId));
    }

    const whereCondition = this.combineFilters(...conditions);

    return dbInstance
      .select()
      .from(tags)
      .where(whereCondition)
      .orderBy(
        // system tags first (userId is null), then by usage count descending
        sql`CASE WHEN ${tags.userId} IS NULL THEN 0 ELSE 1 END`,
        desc(tags.usageCount),
        tags.name,
      );
  }

  /**
   * find tag by ID with permission checking
   */
  static async findById(tagId: string, userId: null | string, context: QueryContext): Promise<null | TagRecord> {
    const dbInstance = this.getDbInstance(context);

    const conditions = [eq(tags.id, tagId)];

    if (userId !== null) {
      // user can access system tags or their own tags
      const userCondition = or(isNull(tags.userId), eq(tags.userId, userId));
      if (userCondition) {
        conditions.push(userCondition);
      }
    } else {
      // anonymous users can only access system tags
      conditions.push(isNull(tags.userId));
    }

    const whereCondition = this.combineFilters(...conditions);

    const result = await dbInstance
      .select()
      .from(tags)
      .where(whereCondition)
      .limit(1);

    return result[0] || null;
  }

  /**
   * find tag by name within user's namespace
   */
  static async findByName(name: string, userId: null | string, context: QueryContext): Promise<null | TagRecord> {
    const dbInstance = this.getDbInstance(context);

    const conditions = [eq(sql`lower(${tags.name})`, name.toLowerCase())];

    if (userId !== null) {
      // check both system tags and user tags
      const userCondition = or(isNull(tags.userId), eq(tags.userId, userId));
      if (userCondition) {
        conditions.push(userCondition);
      }
    } else {
      // only system tags for anonymous users
      conditions.push(isNull(tags.userId));
    }

    const whereCondition = this.combineFilters(...conditions);

    const result = await dbInstance
      .select()
      .from(tags)
      .where(whereCondition)
      .limit(1);

    return result[0] || null;
  }

  /**
   * get tags associated with a bobblehead
   */
  static async getByBobbleheadId(bobbleheadId: string, context: QueryContext): Promise<Array<TagRecord>> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select({
        color: tags.color,
        createdAt: tags.createdAt,
        id: tags.id,
        name: tags.name,
        updatedAt: tags.updatedAt,
        usageCount: tags.usageCount,
        userId: tags.userId,
      })
      .from(bobbleheadTags)
      .innerJoin(tags, eq(bobbleheadTags.tagId, tags.id))
      .where(eq(bobbleheadTags.bobbleheadId, bobbleheadId))
      .orderBy(tags.name);
  }

  /**
   * get popular tags by usage count
   */
  static async getPopular(limit: number, userId: null | string, context: QueryContext): Promise<Array<TagRecord>> {
    const dbInstance = this.getDbInstance(context);

    const conditions = [];

    if (userId) {
      // mix system and user tags based on usage
      conditions.push(or(isNull(tags.userId), eq(tags.userId, userId)));
    } else {
      // only system tags for anonymous users
      conditions.push(isNull(tags.userId));
    }

    return dbInstance
      .select()
      .from(tags)
      .where(this.combineFilters(...conditions))
      .orderBy(desc(tags.usageCount), tags.name)
      .limit(Math.min(limit, 50)); // cap at 50 for performance
  }

  /**
   * get tag statistics
   */
  static async getTagStats(tagId: string, context: QueryContext): Promise<null | TagStats> {
    const dbInstance = this.getDbInstance(context);

    // get the tag first
    const tag = await dbInstance.select().from(tags).where(eq(tags.id, tagId)).limit(1);

    if (!tag[0]) {
      return null;
    }

    // count bobbleheads using this tag
    const countResult = await dbInstance
      .select({ count: count() })
      .from(bobbleheadTags)
      .where(eq(bobbleheadTags.tagId, tagId));

    // get the most recent usage
    const lastUsedResult = await dbInstance
      .select({ lastUsed: bobbleheadTags.createdAt })
      .from(bobbleheadTags)
      .where(eq(bobbleheadTags.tagId, tagId))
      .orderBy(desc(bobbleheadTags.createdAt))
      .limit(1);

    return {
      bobbleheadCount: countResult[0]?.count || 0,
      isSystem: tag[0].userId === null,
      lastUsed: lastUsedResult[0]?.lastUsed || null,
    };
  }

  /**
   * check if a tag is currently in use
   */
  static async isTagInUse(tagId: string, context: QueryContext): Promise<boolean> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ count: count() })
      .from(bobbleheadTags)
      .where(eq(bobbleheadTags.tagId, tagId));

    return (result[0]?.count || 0) > 0;
  }

  /**
   * search tags with fuzzy matching
   */
  static async search(
    query: string,
    userId: null | string,
    limit: number,
    context: QueryContext,
  ): Promise<Array<TagRecord>> {
    const dbInstance = this.getDbInstance(context);

    const escapedQuery = query.replace(/[%_]/g, '\\$&');
    const conditions = [ilike(tags.name, `%${escapedQuery}%`)];

    if (userId !== null) {
      // search both system and user tags
      const userCondition = or(isNull(tags.userId), eq(tags.userId, userId));
      if (userCondition) {
        conditions.push(userCondition);
      }
    } else {
      // only system tags for anonymous users
      conditions.push(isNull(tags.userId));
    }

    const whereCondition = this.combineFilters(...conditions);

    return dbInstance
      .select()
      .from(tags)
      .where(whereCondition)
      .orderBy(
        // exact matches first
        sql`CASE WHEN lower(${tags.name}) = lower(${escapedQuery}) THEN 0 ELSE 1 END`,
        desc(tags.usageCount),
        tags.name,
      )
      .limit(Math.min(limit, 15)); // limit for autocomplete performance
  }

  /**
   * update a tag (only if user owns it and it's not a system tag)
   */
  static async update(
    tagId: string,
    data: UpdateTag,
    userId: string,
    context: QueryContext,
  ): Promise<null | TagRecord> {
    const dbInstance = this.getDbInstance(context);

    // verify ownership (prevent system tag modification)
    const existing = await this.findById(tagId, userId, context);
    if (!existing || existing.userId !== userId) {
      return null;
    }

    const result = await dbInstance
      .update(tags)
      .set({
        ...data,
        updatedAt: sql`now()`,
      })
      .where(and(eq(tags.id, tagId), eq(tags.userId, userId)))
      .returning();

    return result?.[0] || null;
  }
}