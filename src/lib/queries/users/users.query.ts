import { and, asc, count, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm';

import type { UserRole } from '@/lib/constants/enums';
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

/**
 * Query class for user-related database operations
 * Provides methods for user lookup, admin filtering, and statistics
 */
export class UsersQuery extends BaseQuery {
  /**
   * Check if a username is already taken
   * Optionally excludes a specific user ID from the check (useful for profile updates)
   *
   * @param username - The username to check
   * @param context - Query context with database instance
   * @param excludeUserId - Optional user ID to exclude from the check
   * @returns True if the username exists (and is not the excluded user), false otherwise
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
    return !(excludeUserId && foundUser.id === excludeUserId);
  }

  /**
   * Count users for admin listing with filters applied
   *
   * @param filters - Admin filtering options (role, status, search)
   * @param context - Query context with database instance
   * @returns Total count of users matching the filters
   */
  static async countUsersForAdminAsync(filters: AdminUsersFilter, context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const whereConditions = this._buildAdminFilterConditions(filters);

    const result = await dbInstance.select({ count: count() }).from(users).where(whereConditions);

    return result[0]?.count || 0;
  }

  /**
   * Get user email by user ID
   *
   * @param userId - The user ID to look up
   * @param context - Query context with database instance
   * @returns The user's email address, or null if user does not exist or has no email
   */
  static async getEmailByUserIdAsync(userId: string, context: QueryContext): Promise<null | string> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return result[0]?.email || null;
  }

  /**
   * Find a user by their Clerk authentication ID
   *
   * @param clerkId - The Clerk user ID
   * @param context - Query context with database instance
   * @returns The user record, or null if not found
   */
  static async getUserByClerkIdAsync(clerkId: string, context: QueryContext): Promise<null | UserRecord> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);

    return result[0] || null;
  }

  /**
   * Find a user by their internal user ID
   *
   * @param userId - The internal user ID
   * @param context - Query context with database instance
   * @returns The user record, or null if not found
   */
  static async getUserByUserIdAsync(userId: string, context: QueryContext): Promise<null | UserRecord> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.select().from(users).where(eq(users.id, userId)).limit(1);

    return result[0] || null;
  }

  /**
   * Find a user by their internal user ID for admin operations
   * This method bypasses permission filters for admin access
   *
   * @param userId - The internal user ID
   * @param context - Query context with database instance
   * @returns The user record, or null if not found
   */
  static async getUserByUserIdForAdminAsync(
    userId: string,
    context: QueryContext,
  ): Promise<null | UserRecord> {
    const dbInstance = this.getDbInstance(context);

    const user = await dbInstance.select().from(users).where(eq(users.id, userId)).limit(1);

    return user[0] || null;
  }

  /**
   * Find a user by their username
   *
   * @param username - The username to search for
   * @param context - Query context with database instance
   * @returns The user record, or null if not found
   */
  static async getUserByUsernameAsync(username: string, context: QueryContext): Promise<null | UserRecord> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.select().from(users).where(eq(users.username, username)).limit(1);

    return result[0] || null;
  }

  /**
   * Get total users count (excluding deleted)
   *
   * @param context - Query context with database instance
   * @returns Total count of non-deleted users
   */
  static async getUserCountAsync(context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    return await dbInstance
      .select({ count: count() })
      .from(users)
      .where(buildSoftDeleteFilter(users.deletedAt, context))
      .then((result) => result[0]?.count || 0);
  }

  /**
   * Find user ID by Clerk authentication ID
   *
   * @param clerkId - The Clerk user ID
   * @param context - Query context with database instance
   * @returns The internal user ID, or null if not found
   */
  static async getUserIdByClerkIdAsync(clerkId: string, context: QueryContext): Promise<null | string> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ userId: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    return result[0]?.userId || null;
  }

  /**
   * Get user metadata for SEO and social sharing
   * Returns minimal fields needed for metadata generation
   *
   * @param username - The username to look up
   * @param context - Query context with database instance
   * @returns User metadata object, or null if user not found
   */
  static async getUserMetadataAsync(
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
   * Find users for admin listing with pagination, sorting, and filtering
   * Includes computed fields for collections and bobbleheads counts
   *
   * @param filters - Filtering, sorting, and pagination options
   * @param context - Query context with database instance
   * @returns Array of users with counts
   */
  static async getUsersForAdminAsync(
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
    return dbInstance
      .select({
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        bobbleheadsCount: sql<number>`(SELECT COUNT(*)::int
                                       FROM ${bobbleheads}
                                       WHERE ${bobbleheads.userId} = ${users.id}
                                         AND ${bobbleheads.deletedAt} IS NULL)`,
        clerkId: users.clerkId,
        collectionsCount: sql<number>`(SELECT COUNT(*)::int
                                       FROM ${collections}
                                       WHERE ${collections.userId} = ${users.id})`,
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
  }

  /**
   * Get user statistics for admin dashboard
   * Returns counts for collections and bobbleheads
   *
   * @param userId - The user ID to get statistics for
   * @param context - Query context with database instance
   * @returns User statistics object, or null if user not found
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

  /**
   * Update a user's lock status (lockedUntil)
   *
   * @param userId - The user ID to update
   * @param lockedUntil - The date until which the user is locked (null to unlock)
   * @param context - Query context with database instance
   * @returns Updated user record, or null if user not found
   */
  static async updateUserLockAsync(
    userId: string,
    lockedUntil: Date | null,
    context: QueryContext,
  ): Promise<null | UserRecord> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(users)
      .set({
        lockedUntil,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return result[0] || null;
  }

  /**
   * Update a user's username and set the usernameChangedAt timestamp
   *
   * @param userId - The user ID to update
   * @param username - The new username
   * @param context - Query context with database instance
   * @returns Updated user record, or null if user not found
   */
  static async updateUsernameAsync(
    userId: string,
    username: string,
    context: QueryContext,
  ): Promise<null | UserRecord> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(users)
      .set({
        updatedAt: new Date(),
        username,
        usernameChangedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return result[0] || null;
  }

  /**
   * Update a user's role
   *
   * @param userId - The user ID to update
   * @param role - The new role to assign
   * @param context - Query context with database instance
   * @returns Updated user record, or null if user not found
   */
  static async updateUserRoleAsync(
    userId: string,
    role: UserRole,
    context: QueryContext,
  ): Promise<null | UserRecord> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(users)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return result[0] || null;
  }

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
