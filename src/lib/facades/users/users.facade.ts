import { eq } from 'drizzle-orm';

import type { AdminUserListRecord, UserRecord, UserStats } from '@/lib/queries/users/users-query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { AdminUsersFilter, AssignableRole } from '@/lib/validations/admin-users.validation';

import { CACHE_ENTITY_TYPE, OPERATIONS, SCHEMA_LIMITS } from '@/lib/constants';
import { isReservedUsername } from '@/lib/constants/reserved-usernames';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { createPublicQueryContext } from '@/lib/queries/base/query-context';
import { UsersQuery } from '@/lib/queries/users/users-query';
import { CacheService } from '@/lib/services/cache.service';
import { CacheTagGenerators } from '@/lib/utils/cache-tags.utils';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';
import { facadeBreadcrumb } from '@/lib/utils/sentry-server/breadcrumbs.server';

const facadeName = 'UsersFacade';

/**
 * unified Users Facade
 * combines query operations with business logic validation
 * provides a clean API for all user operations
 */
export class UsersFacade extends BaseFacade {
  /**
   * check if user can change their username (cooldown period has passed)
   */
  static async canChangeUsername(userId: string, dbInstance?: DatabaseExecutor): Promise<boolean> {
    const user = await this.getUserByIdAsync(userId, dbInstance);

    if (!user) {
      return false;
    }

    // If user has never changed their username, they can change it
    if (!user.usernameChangedAt) {
      return true;
    }

    const daysSinceLastChange = this.getDaysUntilUsernameChangeAllowed(user);

    return daysSinceLastChange <= 0;
  }

  /**
   * get days until user can change their username
   * returns 0 or negative if user can change now
   */
  static getDaysUntilUsernameChangeAllowed(user: UserRecord): number {
    if (!user.usernameChangedAt) {
      return 0;
    }

    const daysSinceLastChange = Math.floor(
      (Date.now() - user.usernameChangedAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    return SCHEMA_LIMITS.USER.USERNAME_CHANGE_COOLDOWN_DAYS - daysSinceLastChange;
  }

  /**
   * get email by user ID
   * @param userId
   * @param dbInstance
   */
  static async getEmailByUserIdAsync(
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | string> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getEmailByUserIdAsync',
        operation: OPERATIONS.USERS.GET_EMAIL_BY_USER_ID,
      },
      async () => {
        return await CacheService.users.profile(
          () => {
            const context = this.publicContext(dbInstance);
            return UsersQuery.getEmailByUserIdAsync(userId, context);
          },
          userId,
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.USER,
              facade: facadeName,
              operation: OPERATIONS.USERS.GET_EMAIL_BY_USER_ID,
              userId,
            },
          },
        );
      },
    );
  }

  /**
   * get user by Clerk ID
   * @param clerkId
   * @param dbInstance
   */
  static async getUserByClerkIdAsync(
    clerkId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | UserRecord> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getUserByClerkIdAsync',
        operation: OPERATIONS.USERS.GET_USER_BY_CLERK_ID,
      },
      async () => {
        return await CacheService.users.profile(
          () => {
            const context = this.publicContext(dbInstance);
            return UsersQuery.getUserByClerkIdAsync(clerkId, context);
          },
          clerkId,
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.USER,
              facade: facadeName,
              operation: OPERATIONS.USERS.GET_USER_BY_CLERK_ID,
              userId: clerkId,
            },
          },
        );
      },
    );
  }

  /**
   * Get user by user ID
   *
   * Retrieves a user record by their unique ID, with caching for performance.
   *
   * Cache behavior:
   * - TTL: 5 minutes (default from CacheService.users.profile)
   * - Invalidation: User profile updates, username changes, role changes
   *
   * @param userId - The unique ID of the user to fetch
   * @param dbInstance - Optional database instance for transactions
   * @returns User record if found, null otherwise
   */
  static async getUserByIdAsync(userId: string, dbInstance?: DatabaseExecutor): Promise<null | UserRecord> {
    const user = await CacheService.users.profile(
      () => {
        const context = createPublicQueryContext({ dbInstance });
        return UsersQuery.getUserByUserIdAsync(userId, context);
      },
      userId,
      { context: { entityType: 'user', facade: 'UsersFacade', operation: 'getByUserId', userId } },
    );

    if (user) {
      facadeBreadcrumb('User fetched by ID successfully', { ...user });
    }

    return user;
  }

  /**
   * get user by username
   */
  static async getUserByUsername(
    username: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | UserRecord> {
    const context = createPublicQueryContext({ dbInstance });
    return UsersQuery.getUserByUsernameAsync(username, context);
  }

  /**
   * Get comprehensive user details for admin view
   * Includes user data and statistics
   *
   * @param userId - User ID to fetch details for
   * @param dbInstance - Optional database instance for transactions
   * @returns User with stats, or null if not found
   */
  static async getUserDetailsForAdminAsync(
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | {
    stats: UserStats;
    user: UserRecord;
  }> {
    const context = createPublicQueryContext({ dbInstance });

    // Fetch user and stats in parallel
    const [user, stats] = await Promise.all([
      UsersQuery.getUserByUserIdForAdminAsync(userId, context),
      UsersQuery.getUserStatsAsync(userId, context),
    ]);

    if (!user || !stats) {
      return null;
    }

    return { stats, user };
  }

  /**
   * get user ID by Clerk ID
   * @param clerkId
   * @param dbInstance
   */
  static async getUserIdByClerkIdAsync(
    clerkId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | string> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getUserIdByClerkIdAsync',
        operation: OPERATIONS.USERS.GET_USER_ID_BY_CLERK_ID,
      },
      async () => {
        return await CacheService.users.profile(
          () => {
            const context = this.publicContext(dbInstance);
            return UsersQuery.getUserIdByClerkIdAsync(clerkId, context);
          },
          clerkId,
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.USER,
              facade: facadeName,
              operation: OPERATIONS.USERS.GET_USER_ID_BY_CLERK_ID,
              userId: clerkId,
            },
          },
        );
      },
    );
  }

  /**
   * get user metadata for SEO and social sharing
   * returns minimal user information optimized for metadata generation
   *
   * Cache invalidation triggers:
   * - User profile updates (display name, bio, avatar)
   * - Username changes
   *
   * @param username - User's unique username
   * @param dbInstance - Optional database instance for transactions
   * @returns User metadata or null if user not found
   */
  static async getUserSeoMetadata(
    username: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | {
    avatarUrl: null | string;
    bio: null | string;
    id: string;
    username: string;
  }> {
    return CacheService.users.profile(
      () => {
        const context = createPublicQueryContext({ dbInstance });
        return UsersQuery.getUserMetadata(username, context);
      },
      username,
      {
        context: { entityType: 'user', facade: 'UsersFacade', operation: 'getSeoMetadata' },
        ttl: 3600, // 1 hour - user profiles are relatively stable
      },
    );
  }

  /**
   * Get paginated users for admin listing with filters and sorting
   *
   * @param filters - Filter, sort, and pagination options
   * @param dbInstance - Optional database instance for transactions
   * @returns Paginated users with counts and total
   */
  static async getUsersForAdminAsync(
    filters: AdminUsersFilter,
    dbInstance?: DatabaseExecutor,
  ): Promise<{
    total: number;
    users: Array<AdminUserListRecord>;
  }> {
    const context = createPublicQueryContext({ dbInstance });

    // Execute count and data queries in parallel
    const [users, total] = await Promise.all([
      UsersQuery.getUsersForAdminAsync(filters, context),
      UsersQuery.countUsersForAdminAsync(filters, context),
    ]);

    return { total, users };
  }

  // ============================================================================
  // Admin Operations
  // ============================================================================

  /**
   * check if username is available (not taken and not reserved)
   * optionally exclude a specific user (for username changes)
   */
  static async isUsernameAvailable(
    username: string,
    excludeUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<boolean> {
    // Check if username is reserved
    if (isReservedUsername(username)) {
      return false;
    }

    // Check if username is taken by another user
    const context = createPublicQueryContext({ dbInstance });
    const exists = await UsersQuery.checkUsernameExistsAsync(username, context, excludeUserId);

    return !exists;
  }

  /**
   * Lock a user account
   *
   * Business rules:
   * - Cannot lock admin users
   * - Cannot lock yourself
   *
   * @param targetUserId - User ID to lock
   * @param actingAdminId - ID of the admin performing the action
   * @param lockDurationHours - Optional lock duration in hours (indefinite if not provided)
   * @param dbInstance - Optional database instance for transactions
   * @returns Updated user record
   */
  static async lockUserAsync(
    targetUserId: string,
    actingAdminId: string,
    lockDurationHours?: number,
    dbInstance?: DatabaseExecutor,
  ): Promise<UserRecord> {
    // Business rule: Cannot lock yourself
    if (targetUserId === actingAdminId) {
      throw new Error('Cannot lock your own account');
    }

    const executor = dbInstance ?? db;

    // Fetch target user to check if they're an admin
    const context = createPublicQueryContext({ dbInstance: executor });
    const targetUser = await UsersQuery.getUserByUserIdAsync(targetUserId, context);

    if (!targetUser) {
      throw new Error('User not found');
    }

    // Business rule: Cannot lock admin users
    if (targetUser.role === 'admin') {
      throw new Error('Cannot lock admin users');
    }

    // Calculate lock expiration time
    const lockedUntil =
      lockDurationHours ?
        new Date(Date.now() + lockDurationHours * 60 * 60 * 1000)
      : new Date('9999-12-31T23:59:59.999Z'); // Far future date for indefinite lock

    const result = await executor
      .update(users)
      .set({
        lockedUntil,
        updatedAt: new Date(),
      })
      .where(eq(users.id, targetUserId))
      .returning();

    const updatedUser = result[0];

    if (!updatedUser) {
      throw new Error('Failed to lock user');
    }

    // Invalidate cache for this user
    const tags = CacheTagGenerators.user.update(targetUserId);
    tags.forEach((tag) => CacheService.invalidateByTag(tag));

    return updatedUser;
  }

  /**
   * Unlock a user account
   *
   * @param targetUserId - User ID to unlock
   * @param dbInstance - Optional database instance for transactions
   * @returns Updated user record
   */
  static async unlockUserAsync(targetUserId: string, dbInstance?: DatabaseExecutor): Promise<UserRecord> {
    const executor = dbInstance ?? db;

    const result = await executor
      .update(users)
      .set({
        lockedUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, targetUserId))
      .returning();

    const updatedUser = result[0];

    if (!updatedUser) {
      throw new Error('User not found');
    }

    // Invalidate cache for this user
    const tags = CacheTagGenerators.user.update(targetUserId);
    tags.forEach((tag) => CacheService.invalidateByTag(tag));

    return updatedUser;
  }

  /**
   * update username and set usernameChangedAt timestamp
   */
  static async updateUsername(
    userId: string,
    newUsername: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<UserRecord> {
    const context = createPublicQueryContext({ dbInstance });
    const db = context.dbInstance;

    if (!db) {
      throw new Error('Database instance is not available');
    }

    const result = await db
      .update(users)
      .set({
        updatedAt: new Date(),
        username: newUsername,
        usernameChangedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    const updatedUser = result[0];

    if (!updatedUser) {
      throw new Error('Failed to update user username');
    }

    // Invalidate cache for this user
    const tags = CacheTagGenerators.user.update(userId);
    tags.forEach((tag) => CacheService.invalidateByTag(tag));

    return updatedUser;
  }

  /**
   * Update a user's role
   *
   * Business rules:
   * - Cannot demote yourself
   * - Cannot assign 'admin' role (only 'user' or 'moderator')
   *
   * @param targetUserId - User ID to update
   * @param newRole - New role to assign ('user' or 'moderator')
   * @param actingAdminId - ID of the admin performing the action
   * @param dbInstance - Optional database instance for transactions
   * @returns Updated user record
   */
  static async updateUserRoleAsync(
    targetUserId: string,
    newRole: AssignableRole,
    actingAdminId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<UserRecord> {
    // Business rule: Cannot demote yourself
    if (targetUserId === actingAdminId) {
      throw new Error('Cannot change your own role');
    }

    const executor = dbInstance ?? db;

    const result = await executor
      .update(users)
      .set({
        role: newRole,
        updatedAt: new Date(),
      })
      .where(eq(users.id, targetUserId))
      .returning();

    const updatedUser = result[0];

    if (!updatedUser) {
      throw new Error('User not found');
    }

    // Invalidate cache for this user
    const tags = CacheTagGenerators.user.update(targetUserId);
    tags.forEach((tag) => CacheService.invalidateByTag(tag));

    return updatedUser;
  }
}
