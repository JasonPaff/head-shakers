import type { SQL } from 'drizzle-orm';

import { and, count, desc, eq, ilike, inArray, isNull, or, sql } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';
import type { InsertTag, UpdateTag } from '@/lib/validations/tags.validation';

import { bobbleheadTags, tags } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export type TagRecord = typeof tags.$inferSelect;

export class TagsQuery extends BaseQuery {
  /**
   * Attach tags to a bobblehead by creating junction records
   * Increments usage count for each attached tag
   * @param bobbleheadId - The bobblehead to attach tags to
   * @param tagIds - Array of tag IDs to attach
   * @param context - Query context with database instance
   * @returns True on successful completion
   */
  static async attachToBobbleheadAsync(
    bobbleheadId: string,
    tagIds: Array<string>,
    context: QueryContext,
  ): Promise<boolean> {
    const dbInstance = this.getDbInstance(context);

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
  }

  /**
   * Count total tags belonging to a specific user
   * @param userId - The user whose tags to count
   * @param context - Query context with database instance
   * @returns The count of user's tags
   */
  static async countUserTagsAsync(userId: string, context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.select({ count: count() }).from(tags).where(eq(tags.userId, userId));

    return result[0]?.count || 0;
  }

  /**
   * Create a new tag for a user
   * @param data - Tag data to insert
   * @param userId - The user creating the tag
   * @param context - Query context with database instance
   * @returns The created tag record or null if creation failed
   */
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

    return result[0] || null;
  }

  /**
   * Delete a user-created tag if it's not in use
   * System tags (userId = null) cannot be deleted
   * @param tagId - The tag ID to delete
   * @param userId - The user attempting to delete
   * @param context - Query context with database instance
   * @returns The deleted tag record or null if deletion failed
   */
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

    return result[0] || null;
  }

  /**
   * Detach tags from a bobblehead by removing junction records
   * Decrements usage count for each detached tag
   * @param bobbleheadId - The bobblehead to detach tags from
   * @param tagIds - Array of tag IDs to detach
   * @param context - Query context with database instance
   * @returns True on successful completion
   */
  static async detachFromBobbleheadAsync(
    bobbleheadId: string,
    tagIds: Array<string>,
    context: QueryContext,
  ): Promise<boolean> {
    const dbInstance = this.getDbInstance(context);

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
  }

  /**
   * Find all tags accessible to a user
   * Returns system tags (userId = null) for all users
   * Returns user's custom tags if userId is provided
   * @param userId - The user ID or null for anonymous access
   * @param context - Query context with database instance
   * @returns Array of accessible tag records
   */
  static async findAllAsync(userId: null | string, context: QueryContext): Promise<Array<TagRecord>> {
    const dbInstance = this.getDbInstance(context);

    const permissionFilter = this._buildTagPermissionFilter(userId);

    return dbInstance
      .select()
      .from(tags)
      .where(permissionFilter)
      .orderBy(
        // system tags first (userId is null), then by usage count descending
        sql`CASE WHEN ${tags.userId} IS NULL THEN 0 ELSE 1 END`,
        desc(tags.usageCount),
        tags.name,
      );
  }

  /**
   * Find a tag by ID with permission filtering
   * Users can access system tags or their own tags
   * @param tagId - The tag ID to find
   * @param userId - The user ID or null for anonymous access
   * @param context - Query context with database instance
   * @returns The tag record or null if not found/not accessible
   */
  static async findByIdAsync(
    tagId: string,
    userId: null | string,
    context: QueryContext,
  ): Promise<null | TagRecord> {
    const dbInstance = this.getDbInstance(context);

    const permissionFilter = this._buildTagPermissionFilter(userId);
    const whereCondition = this.combineFilters(eq(tags.id, tagId), permissionFilter);

    const result = await dbInstance.select().from(tags).where(whereCondition).limit(1);

    return result[0] || null;
  }

  /**
   * Find a tag by name with permission filtering (case-insensitive)
   * Users can access system tags or their own tags
   * @param name - The tag name to search for
   * @param userId - The user ID or null for anonymous access
   * @param context - Query context with database instance
   * @returns The tag record or null if not found/not accessible
   */
  static async findByNameAsync(
    name: string,
    userId: null | string,
    context: QueryContext,
  ): Promise<null | TagRecord> {
    const dbInstance = this.getDbInstance(context);

    const permissionFilter = this._buildTagPermissionFilter(userId);
    const whereCondition = this.combineFilters(
      eq(sql`lower(${tags.name})`, name.toLowerCase()),
      permissionFilter,
    );

    const result = await dbInstance.select().from(tags).where(whereCondition).limit(1);

    return result[0] || null;
  }

  /**
   * Get all tags associated with a bobblehead
   * @param bobbleheadId - The bobblehead ID to get tags for
   * @param context - Query context with database instance
   * @returns Array of tag records associated with the bobblehead
   */
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

  /**
   * Check if a tag is currently in use by any bobblehead
   * @param tagId - The tag ID to check
   * @param context - Query context with database instance
   * @returns True if the tag is in use, false otherwise
   */
  static async isTagInUseAsync(tagId: string, context: QueryContext): Promise<boolean> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ count: count() })
      .from(bobbleheadTags)
      .where(eq(bobbleheadTags.tagId, tagId));

    return (result[0]?.count || 0) > 0;
  }

  /**
   * Remove all tag associations from a bobblehead
   * Decrements usage count for each removed tag
   * @param bobbleheadId - The bobblehead to remove all tags from
   * @param context - Query context with database instance
   * @returns True on successful completion
   */
  static async removeAllFromBobbleheadAsync(bobbleheadId: string, context: QueryContext): Promise<boolean> {
    const dbInstance = this.getDbInstance(context);

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
  }

  /**
   * Search tags by name with permission filtering
   * Returns matches from system tags and user's custom tags
   * Limit is capped at 15 for autocomplete performance optimization
   * @param query - The search query string
   * @param userId - The user ID or null for anonymous access
   * @param limit - Maximum results to return (capped at 15)
   * @param context - Query context with database instance
   * @returns Array of matching tag records
   */
  static async searchAsync(
    query: string,
    userId: null | string,
    limit: number,
    context: QueryContext,
  ): Promise<Array<TagRecord>> {
    const dbInstance = this.getDbInstance(context);

    const escapedQuery = query.replace(/[%_]/g, '\\$&');
    const permissionFilter = this._buildTagPermissionFilter(userId);
    const whereCondition = this.combineFilters(ilike(tags.name, `%${escapedQuery}%`), permissionFilter);

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
      .limit(Math.min(limit, 15)); // limit capped at 15 for autocomplete performance
  }

  /**
   * Update an existing user-created tag
   * System tags (userId = null) cannot be updated
   * @param tagId - The tag ID to update
   * @param data - The update data
   * @param userId - The user attempting to update
   * @param context - Query context with database instance
   * @returns The updated tag record or null if update failed
   */
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

    return result[0] || null;
  }

  /**
   * Build permission filter for tag access
   * Tags have a unique permission model:
   * - System tags (userId = null) are accessible by everyone
   * - User tags are only accessible by the owning user
   * @param userId - The user ID or null for anonymous access
   * @returns SQL filter for tag permissions
   */
  private static _buildTagPermissionFilter(userId: null | string): SQL {
    if (userId !== null) {
      // user can access system tags or their own tags
      return or(isNull(tags.userId), eq(tags.userId, userId))!;
    }

    // anonymous users can only access system tags
    return isNull(tags.userId);
  }
}
