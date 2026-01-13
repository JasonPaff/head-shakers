import { and, count, desc, eq, ilike, inArray, isNull, or, sql } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';
import type { InsertTag, UpdateTag } from '@/lib/validations/tags.validation';

import { bobbleheadTags, tags } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export type TagRecord = typeof tags.$inferSelect;

export class TagsQuery extends BaseQuery {
  static async attachToBobbleheadAsync(
    bobbleheadId: string,
    tagIds: Array<string>,
    context: QueryContext,
  ): Promise<boolean> {
    const dbInstance = this.getDbInstance(context);

    try {
      // insert new bobblehead tags
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

  static async countUserTagsAsync(userId: string, context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.select({ count: count() }).from(tags).where(eq(tags.userId, userId));

    return result[0]?.count || 0;
  }

  static async createAsync(
    data: InsertTag,
    userId: string,
    context: QueryContext,
  ): Promise<null | TagRecord> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .insert(tags)
      .values({ ...data, userId })
      .returning();

    return result?.[0] || null;
  }

  static async deleteAsync(tagId: string, userId: string, context: QueryContext): Promise<null | TagRecord> {
    const dbInstance = this.getDbInstance(context);

    // verify ownership and that tag is not a system tag
    const tag = await this.findByIdAsync(tagId, userId, context);
    if (!tag || tag.userId !== userId) {
      return null;
    }

    // check if the tag is in use
    const isInUse = await this.isTagInUseAsync(tagId, context);
    if (isInUse) return null;

    const result = await dbInstance
      .delete(tags)
      .where(and(eq(tags.id, tagId), eq(tags.userId, userId)))
      .returning();

    return result?.[0] || null;
  }

  static async detachFromBobbleheadAsync(
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

  static async findAllAsync(userId: null | string, context: QueryContext): Promise<Array<TagRecord>> {
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

  static async findByIdAsync(
    tagId: string,
    userId: null | string,
    context: QueryContext,
  ): Promise<null | TagRecord> {
    const dbInstance = this.getDbInstance(context);

    const conditions = [eq(tags.id, tagId)];

    if (userId !== null) {
      // user can access system tags or their own tags
      const userCondition = or(isNull(tags.userId), eq(tags.userId, userId));
      if (userCondition) conditions.push(userCondition);
    } else {
      // anonymous users can only access system tags
      conditions.push(isNull(tags.userId));
    }

    const whereCondition = this.combineFilters(...conditions);

    const result = await dbInstance.select().from(tags).where(whereCondition).limit(1);

    return result[0] || null;
  }

  static async findByNameAsync(
    name: string,
    userId: null | string,
    context: QueryContext,
  ): Promise<null | TagRecord> {
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

    const result = await dbInstance.select().from(tags).where(whereCondition).limit(1);

    return result[0] || null;
  }

  static async getByBobbleheadIdAsync(
    bobbleheadId: string,
    context: QueryContext,
  ): Promise<Array<TagRecord>> {
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

  static async isTagInUseAsync(tagId: string, context: QueryContext): Promise<boolean> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ count: count() })
      .from(bobbleheadTags)
      .where(eq(bobbleheadTags.tagId, tagId));

    return (result[0]?.count || 0) > 0;
  }

  static async removeAllFromBobbleheadAsync(bobbleheadId: string, context: QueryContext): Promise<boolean> {
    const dbInstance = this.getDbInstance(context);

    try {
      // fetch associated tag IDs
      const associatedTags = await dbInstance
        .select({ tagId: bobbleheadTags.tagId })
        .from(bobbleheadTags)
        .where(eq(bobbleheadTags.bobbleheadId, bobbleheadId));

      const tagIds = associatedTags.map((tag) => tag.tagId);

      // remove associations
      await dbInstance.delete(bobbleheadTags).where(eq(bobbleheadTags.bobbleheadId, bobbleheadId));

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

  static async searchAsync(
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

  static async updateAsync(
    tagId: string,
    data: UpdateTag,
    userId: string,
    context: QueryContext,
  ): Promise<null | TagRecord> {
    const dbInstance = this.getDbInstance(context);

    // verify ownership (prevent system tag modification)
    const existing = await this.findByIdAsync(tagId, userId, context);
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
