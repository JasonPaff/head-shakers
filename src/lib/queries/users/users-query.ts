import { and, asc, count, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';
import type { AdminUsersFilter } from '@/lib/validations/admin-users.validation';

import { bobbleheads, collections, users } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';
import { buildSoftDeleteFilter } from '@/lib/queries/base/permission-filters';

/**
 * Admin user list record with computed fields for admin listing
 */
export type AdminUserListRecord = UserRecord & {
  bobbleheadsCount: number;
  collectionsCount: number;
};

export type UserRecord = typeof users.$inferSelect;

/**
 * User statistics for admin dashboard
 */
export type UserStats = {
  bobbleheadsCount: number;
  collectionsCount: number;
  publicBobbleheadsCount: number;
  publicCollectionsCount: number;
  userId: string;
};

export class UsersQuery extends BaseQuery {
  /**
   * check if username exists, optionally excluding a specific user
   */
  static async checkUsernameExistsAsync(
    username: string,
    context: QueryContext,
    excludeUserId?: string,
  ): Promise<boolean> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (result.length === 0) {
      return false;
    }

    const foundUser = result[0];

    if (!foundUser) {
      return false;
    }

    // If we found a user with this username and we're excluding a specific user,
    // check if the found user is the one we're excluding
    if (excludeUserId && foundUser.id === excludeUserId) {
      return false;
    }

    return true;
  }

  /**
   * Count users for admin listing with filters
   * Used for pagination metadata
   */
  static async countUsersForAdminAsync(filters: AdminUsersFilter, context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const whereConditions = this._buildAdminFilterConditions(filters);

    const result = await dbInstance.select({ count: count() }).from(users).where(whereConditions);

    return result[0]?.count || 0;
  }

  /**
   * find user by clerk id
   */
  static async findByClerkIdAsync(clerkId: string, context: QueryContext): Promise<null | UserRecord> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);

    return result[0] || null;
  }

  /**
   * find user by user id
   */
  static async findByIdAsync(userId: string, context: QueryContext): Promise<null | UserRecord> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.select().from(users).where(eq(users.id, userId)).limit(1);

    return result[0] || null;
  }

  /**
   * find user by username
   */
  static async findByUsernameAsync(username: string, context: QueryContext): Promise<null | UserRecord> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.select().from(users).where(eq(users.username, username)).limit(1);

    return result[0] || null;
  }

  // ============================================================================
  // Admin Query Methods
  // ============================================================================

  /**
   * Find users for admin listing with pagination, sorting, and filtering
   * Includes computed fields for collections and bobbleheads counts
   *
   * @param filters - Filtering, sorting, and pagination options
   * @param context - Query context with database instance
   * @returns Array of users with counts
   */
  static async findUsersForAdminAsync(
    filters: AdminUsersFilter,
    context: QueryContext,
  ): Promise<Array<AdminUserListRecord>> {
    const dbInstance = this.getDbInstance(context);

    const whereConditions = this._buildAdminFilterConditions(filters);
    const orderByClause = this._getAdminSortOrder(filters.sortBy, filters.sortOrder);
    const pagination = this.applyPagination({
      limit: filters.limit,
      offset: filters.offset,
    });

    // Use subqueries for counts to leverage existing indexes
    const result = await dbInstance
      .select({
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        bobbleheadsCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${bobbleheads}
          WHERE ${bobbleheads.userId} = ${users.id}
            AND ${bobbleheads.deletedAt} IS NULL
        )`,
        clerkId: users.clerkId,
        collectionsCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${collections}
          WHERE ${collections.userId} = ${users.id}
        )`,
        createdAt: users.createdAt,
        deletedAt: users.deletedAt,
        email: users.email,
        id: users.id,
        lastActiveAt: users.lastActiveAt,
        location: users.location,
        lockedUntil: users.lockedUntil,
        role: users.role,
        updatedAt: users.updatedAt,
        username: users.username,
        usernameChangedAt: users.usernameChangedAt,
      })
      .from(users)
      .where(whereConditions)
      .orderBy(orderByClause)
      .limit(pagination.limit ?? 25)
      .offset(pagination.offset ?? 0);

    return result;
  }

  /**
   * Get user by ID for admin detail view
   */
  static async getUserByIdForAdminAsync(userId: string, context: QueryContext): Promise<null | UserRecord> {
    const dbInstance = this.getDbInstance(context);

    const user = await dbInstance.select().from(users).where(eq(users.id, userId)).limit(1);

    return user[0] || null;
  }

  /**
   * Get total users count (excluding deleted)
   * @param context
   */
  static async getUserCountAsync(context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ count: count() })
      .from(users)
      .where(buildSoftDeleteFilter(users.deletedAt, context))
      .then((result) => result[0]?.count || 0);

    return result;
  }

  /**
   * get user metadata for SEO and social sharing
   * returns minimal fields needed for metadata generation
   */
  static async getUserMetadata(
    username: string,
    context: QueryContext,
  ): Promise<null | {
    avatarUrl: null | string;
    bio: null | string;
    id: string;
    username: string;
  }> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        id: users.id,
        username: users.username,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get user statistics for admin dashboard
   * Returns counts for collections and bobbleheads
   */
  static async getUserStatsAsync(userId: string, context: QueryContext): Promise<null | UserStats> {
    const dbInstance = this.getDbInstance(context);

    // Verify user exists first
    const user = await dbInstance.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);

    if (!user[0]) {
      return null;
    }

    // Get all stats in parallel using subqueries
    const [collectionsResult, bobbleheadsResult, publicCollectionsResult, publicBobbleheadsResult] =
      await Promise.all([
        // Total collections count
        dbInstance.select({ count: count() }).from(collections).where(eq(collections.userId, userId)),

        // Total bobbleheads count (non-deleted)
        dbInstance
          .select({ count: count() })
          .from(bobbleheads)
          .where(and(eq(bobbleheads.userId, userId), isNull(bobbleheads.deletedAt))),

        // Public collections count
        dbInstance
          .select({ count: count() })
          .from(collections)
          .where(and(eq(collections.userId, userId), eq(collections.isPublic, true))),

        // Public bobbleheads count
        dbInstance
          .select({ count: count() })
          .from(bobbleheads)
          .where(
            and(
              eq(bobbleheads.userId, userId),
              isNull(bobbleheads.deletedAt),
              eq(bobbleheads.isPublic, true),
            ),
          ),
      ]);

    return {
      bobbleheadsCount: bobbleheadsResult[0]?.count || 0,
      collectionsCount: collectionsResult[0]?.count || 0,
      publicBobbleheadsCount: publicBobbleheadsResult[0]?.count || 0,
      publicCollectionsCount: publicCollectionsResult[0]?.count || 0,
      userId,
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Build WHERE conditions for admin user filtering
   */
  private static _buildAdminFilterConditions(filters: AdminUsersFilter) {
    const conditions = [];

    // Exclude deleted users by default (admin can still see them via status filter)
    conditions.push(isNull(users.deletedAt));

    // Role filter - uses users_role_idx
    if (filters.role) {
      conditions.push(eq(users.role, filters.role));
    }

    // Status filter
    if (filters.status) {
      const now = new Date();
      switch (filters.status) {
        case 'active':
          // Not locked (lockedUntil is null or in the past)
          conditions.push(or(sql`${users.lockedUntil} IS NULL`, sql`${users.lockedUntil} < ${now}`));
          break;
        case 'locked':
          // Currently locked (lockedUntil is in the future)
          conditions.push(sql`${users.lockedUntil} > ${now}`);
          break;
      }
    }

    // Search filter - searches across username and email
    // Uses users_username_search_idx (GIN trigram) and users_email_lower_idx
    if (filters.search && filters.search.trim()) {
      const searchTerm = `%${filters.search.trim()}%`;
      conditions.push(or(ilike(users.username, searchTerm), ilike(users.email, searchTerm)));
    }

    return this.combineFilters(...conditions);
  }

  /**
   * Get ORDER BY clause for admin user sorting
   */
  private static _getAdminSortOrder(sortBy?: string, sortOrder?: 'asc' | 'desc') {
    const direction = sortOrder === 'asc' ? asc : desc;

    switch (sortBy) {
      case 'email':
        return direction(sql`lower(${users.email})`);
      case 'lastActiveAt':
        // Handle nulls - put inactive users at the end
        return sortOrder === 'asc' ?
            sql`${users.lastActiveAt} ASC NULLS LAST`
          : sql`${users.lastActiveAt} DESC NULLS LAST`;
      case 'role':
        return direction(users.role);
      case 'updatedAt':
        return direction(users.updatedAt);
      case 'username':
        return direction(sql`lower(${users.username})`);
      case 'createdAt':
      default:
        return direction(users.createdAt);
    }
  }
}
