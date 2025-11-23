import { and, asc, count, desc, eq, gt, ilike, or, sql } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';
import type { AdminUsersFilter } from '@/lib/validations/admin-users.validation';

import { bobbleheads, collections, userActivity, users } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

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
  recentActivityCount: number;
  userId: string;
};

/**
 * User with recent activity for admin detail view
 */
export type UserWithActivity = UserRecord & {
  recentActivity: Array<{
    actionType: string;
    createdAt: Date;
    id: string;
    targetType: null | string;
  }>;
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
            AND ${bobbleheads.isDeleted} = false
        )`,
        clerkId: users.clerkId,
        collectionsCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${collections}
          WHERE ${collections.userId} = ${users.id}
        )`,
        createdAt: users.createdAt,
        deletedAt: users.deletedAt,
        displayName: users.displayName,
        email: users.email,
        failedLoginAttempts: users.failedLoginAttempts,
        id: users.id,
        isDeleted: users.isDeleted,
        isVerified: users.isVerified,
        lastActiveAt: users.lastActiveAt,
        lastFailedLoginAt: users.lastFailedLoginAt,
        location: users.location,
        lockedUntil: users.lockedUntil,
        memberSince: users.memberSince,
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
   * get user metadata for SEO and social sharing
   * returns minimal fields needed for metadata generation
   */
  static async getUserMetadata(
    username: string,
    context: QueryContext,
  ): Promise<null | {
    avatarUrl: null | string;
    bio: null | string;
    displayName: string;
    id: string;
    username: string;
  }> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        displayName: users.displayName,
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
   * Returns counts for collections, bobbleheads, and recent activity
   */
  static async getUserStatsAsync(userId: string, context: QueryContext): Promise<null | UserStats> {
    const dbInstance = this.getDbInstance(context);

    // Verify user exists first
    const user = await dbInstance.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);

    if (!user[0]) {
      return null;
    }

    // Get all stats in parallel using subqueries
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      collectionsResult,
      bobbleheadsResult,
      publicCollectionsResult,
      publicBobbleheadsResult,
      activityResult,
    ] = await Promise.all([
      // Total collections count
      dbInstance.select({ count: count() }).from(collections).where(eq(collections.userId, userId)),

      // Total bobbleheads count (non-deleted)
      dbInstance
        .select({ count: count() })
        .from(bobbleheads)
        .where(and(eq(bobbleheads.userId, userId), eq(bobbleheads.isDeleted, false))),

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
            eq(bobbleheads.isDeleted, false),
            eq(bobbleheads.isPublic, true),
          ),
        ),

      // Recent activity count (last 30 days)
      dbInstance
        .select({ count: count() })
        .from(userActivity)
        .where(and(eq(userActivity.userId, userId), gt(userActivity.createdAt, thirtyDaysAgo))),
    ]);

    return {
      bobbleheadsCount: bobbleheadsResult[0]?.count || 0,
      collectionsCount: collectionsResult[0]?.count || 0,
      publicBobbleheadsCount: publicBobbleheadsResult[0]?.count || 0,
      publicCollectionsCount: publicCollectionsResult[0]?.count || 0,
      recentActivityCount: activityResult[0]?.count || 0,
      userId,
    };
  }

  /**
   * Get user with recent activity for admin detail view
   * Returns user data with last 10 activity entries
   */
  static async getUserWithActivityAsync(
    userId: string,
    context: QueryContext,
  ): Promise<null | UserWithActivity> {
    const dbInstance = this.getDbInstance(context);

    // Get user data
    const user = await dbInstance.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user[0]) {
      return null;
    }

    // Get recent activity (last 10 entries)
    const activity = await dbInstance
      .select({
        actionType: userActivity.actionType,
        createdAt: userActivity.createdAt,
        id: userActivity.id,
        targetType: userActivity.targetType,
      })
      .from(userActivity)
      .where(eq(userActivity.userId, userId))
      .orderBy(desc(userActivity.createdAt))
      .limit(10);

    return {
      ...user[0],
      recentActivity: activity,
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
    conditions.push(eq(users.isDeleted, false));

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
        case 'unverified':
          conditions.push(eq(users.isVerified, false));
          break;
        case 'verified':
          // Uses users_verified_created_idx
          conditions.push(eq(users.isVerified, true));
          break;
      }
    }

    // Search filter - searches across username, email, and displayName
    // Uses users_username_lower_idx, users_email_lower_idx, and users_display_name_search_idx
    if (filters.search && filters.search.trim()) {
      const searchTerm = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(users.username, searchTerm),
          ilike(users.email, searchTerm),
          ilike(users.displayName, searchTerm),
        ),
      );
    }

    return this.combineFilters(...conditions);
  }

  /**
   * Get ORDER BY clause for admin user sorting
   */
  private static _getAdminSortOrder(sortBy?: string, sortOrder?: 'asc' | 'desc') {
    const direction = sortOrder === 'asc' ? asc : desc;

    switch (sortBy) {
      case 'displayName':
        return direction(sql`lower(${users.displayName})`);
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
