import type { AdminUserListRecord, UserRecord, UserStats } from '@/lib/queries/users/users.query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { AdminUsersFilter, AssignableRole } from '@/lib/validations/admin-users.validation';

import { CACHE_ENTITY_TYPE, OPERATIONS, SCHEMA_LIMITS } from '@/lib/constants';
import { isReservedUsername } from '@/lib/constants/reserved-usernames';
import { db } from '@/lib/db';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { UsersQuery } from '@/lib/queries/users/users.query';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { CacheService } from '@/lib/services/cache.service';
import { createFacadeError } from '@/lib/utils/error-builders';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';

const facadeName = 'USERS_FACADE';

/**
 * Unified Users Facade
 * Combines query operations with business logic validation
 * Provides a clean API for all user operations
 */
export class UsersFacade extends BaseFacade {
  /**
   * Check if user can change their username (cooldown period has passed).
   * Returns false if user not found or cooldown period hasn't elapsed.
   *
   * Cache behavior: No caching - always queries fresh data for accurate cooldown check.
   *
   * @param userId - The unique ID of the user
   * @param dbInstance - Optional database instance for transactions
   * @returns True if the user can change their username, false otherwise
   */
  static async canChangeUsernameAsync(userId: string, dbInstance?: DatabaseExecutor): Promise<boolean> {
    return executeFacadeOperation(
      {
        data: { userId },
        facade: facadeName,
        method: 'canChangeUsernameAsync',
        operation: OPERATIONS.USERS.CAN_CHANGE_USERNAME,
        userId,
      },
      async () => {
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
      },
      {
        includeResultSummary: (result) => ({ canChange: result }),
      },
    );
  }

  /**
   * Get days until user can change their username.
   * Returns 0 or negative if user can change now.
   * This is a synchronous helper method.
   *
   * @param user - The user record to check
   * @returns Number of days until username change is allowed (0 or negative means allowed now)
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
   * Get email by user ID.
   *
   * Cache behavior: Uses user profile cache (SHORT TTL, 5 min).
   * Invalidated by: User profile updates.
   *
   * @param userId - The unique ID of the user
   * @param dbInstance - Optional database instance for transactions
   * @returns The user's email address or null if not found
   */
  static async getEmailByUserIdAsync(
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | string> {
    return executeFacadeOperation(
      {
        data: { userId },
        facade: facadeName,
        method: 'getEmailByUserIdAsync',
        operation: OPERATIONS.USERS.GET_EMAIL_BY_USER_ID,
        userId,
      },
      async () => {
        return await CacheService.users.profile(
          () => {
            const context = this.getPublicContext(dbInstance);
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
   * Get user by Clerk ID.
   *
   * Cache behavior: Uses user profile cache (SHORT TTL, 5 min).
   * Invalidated by: User profile updates, role changes.
   *
   * @param clerkId - The Clerk authentication ID
   * @param dbInstance - Optional database instance for transactions
   * @returns The user record or null if not found
   */
  static async getUserByClerkIdAsync(
    clerkId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | UserRecord> {
    return executeFacadeOperation(
      {
        data: { clerkId },
        facade: facadeName,
        method: 'getUserByClerkIdAsync',
        operation: OPERATIONS.USERS.GET_USER_BY_CLERK_ID,
      },
      async () => {
        return await CacheService.users.profile(
          () => {
            const context = this.getPublicContext(dbInstance);
            return UsersQuery.getUserByClerkIdAsync(clerkId, context);
          },
          clerkId,
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.USER,
              facade: facadeName,
              operation: OPERATIONS.USERS.GET_USER_BY_CLERK_ID,
            },
          },
        );
      },
    );
  }

  /**
   * Get user by user ID.
   *
   * Retrieves a user record by their unique ID, with caching for performance.
   *
   * Cache behavior: Uses user profile cache (SHORT TTL, 5 min).
   * Invalidated by: User profile updates, username changes, role changes.
   *
   * @param userId - The unique ID of the user to fetch
   * @param dbInstance - Optional database instance for transactions
   * @returns User record if found, null otherwise
   */
  static async getUserByIdAsync(userId: string, dbInstance?: DatabaseExecutor): Promise<null | UserRecord> {
    return executeFacadeOperation(
      {
        data: { userId },
        facade: facadeName,
        method: 'getUserByIdAsync',
        operation: OPERATIONS.USERS.GET_BY_ID,
        userId,
      },
      async () => {
        return await CacheService.users.profile(
          () => {
            const context = this.getPublicContext(dbInstance);
            return UsersQuery.getUserByUserIdAsync(userId, context);
          },
          userId,
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.USER,
              facade: facadeName,
              operation: OPERATIONS.USERS.GET_BY_ID,
              userId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({ found: result !== null }),
      },
    );
  }

  /**
   * Get user by username.
   *
   * Cache behavior: Uses user profile cache (SHORT TTL, 5 min).
   * Invalidated by: User profile updates, username changes.
   *
   * @param username - The username to search for
   * @param dbInstance - Optional database instance for transactions
   * @returns The user record or null if not found
   */
  static async getUserByUsernameAsync(
    username: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | UserRecord> {
    return executeFacadeOperation(
      {
        data: { username },
        facade: facadeName,
        method: 'getUserByUsernameAsync',
        operation: OPERATIONS.USERS.GET_BY_USERNAME,
      },
      async () => {
        return await CacheService.users.profile(
          () => {
            const context = this.getPublicContext(dbInstance);
            return UsersQuery.getUserByUsernameAsync(username, context);
          },
          username,
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.USER,
              facade: facadeName,
              operation: OPERATIONS.USERS.GET_BY_USERNAME,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({ found: result !== null }),
      },
    );
  }

  /**
   * Get comprehensive user details for admin view.
   * Includes user data and statistics.
   *
   * Cache behavior: No caching - admin operations always fetch fresh data.
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
    return executeFacadeOperation(
      {
        data: { userId },
        facade: facadeName,
        method: 'getUserDetailsForAdminAsync',
        operation: OPERATIONS.USERS.GET_DETAILS_FOR_ADMIN,
        userId,
      },
      async () => {
        const context = this.getPublicContext(dbInstance);

        // Fetch user and stats in parallel
        const [user, stats] = await Promise.all([
          UsersQuery.getUserByUserIdForAdminAsync(userId, context),
          UsersQuery.getUserStatsAsync(userId, context),
        ]);

        if (!user || !stats) {
          return null;
        }

        return { stats, user };
      },
      {
        includeResultSummary: (result) => ({
          found: result !== null,
          hasStats: result?.stats !== undefined,
        }),
      },
    );
  }

  /**
   * Get user ID by Clerk ID.
   *
   * Cache behavior: Uses user profile cache (SHORT TTL, 5 min).
   * Invalidated by: User profile updates.
   *
   * @param clerkId - The Clerk authentication ID
   * @param dbInstance - Optional database instance for transactions
   * @returns The user ID or null if not found
   */
  static async getUserIdByClerkIdAsync(
    clerkId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | string> {
    return executeFacadeOperation(
      {
        data: { clerkId },
        facade: facadeName,
        method: 'getUserIdByClerkIdAsync',
        operation: OPERATIONS.USERS.GET_USER_ID_BY_CLERK_ID,
      },
      async () => {
        return await CacheService.users.profile(
          () => {
            const context = this.getPublicContext(dbInstance);
            return UsersQuery.getUserIdByClerkIdAsync(clerkId, context);
          },
          clerkId,
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.USER,
              facade: facadeName,
              operation: OPERATIONS.USERS.GET_USER_ID_BY_CLERK_ID,
            },
          },
        );
      },
    );
  }

  /**
   * Get user metadata for SEO and social sharing.
   * Returns minimal user information optimized for metadata generation.
   *
   * Cache behavior: Uses user profile cache (LONG TTL, 1 hour).
   * Invalidated by: User profile updates (display name, bio, avatar), username changes.
   *
   * @param username - User's unique username
   * @param dbInstance - Optional database instance for transactions
   * @returns User metadata or null if user not found
   */
  static async getUserSeoMetadataAsync(
    username: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | {
    avatarUrl: null | string;
    bio: null | string;
    id: string;
    username: string;
  }> {
    return executeFacadeOperation(
      {
        data: { username },
        facade: facadeName,
        method: 'getUserSeoMetadataAsync',
        operation: OPERATIONS.USERS.GET_SEO_METADATA,
      },
      async () => {
        return CacheService.users.profile(
          () => {
            const context = this.getPublicContext(dbInstance);
            return UsersQuery.getUserMetadataAsync(username, context);
          },
          username,
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.USER,
              facade: facadeName,
              operation: OPERATIONS.USERS.GET_SEO_METADATA,
            },
            ttl: 3600, // 1 hour - user profiles are relatively stable
          },
        );
      },
      {
        includeResultSummary: (result) => ({ found: result !== null }),
      },
    );
  }

  /**
   * Get paginated users for admin listing with filters and sorting.
   *
   * Cache behavior: No caching - admin operations always fetch fresh data.
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
    return executeFacadeOperation(
      {
        data: { limit: filters.limit, offset: filters.offset, role: filters.role, status: filters.status },
        facade: facadeName,
        method: 'getUsersForAdminAsync',
        operation: OPERATIONS.USERS.GET_USERS_FOR_ADMIN,
      },
      async () => {
        const context = this.getPublicContext(dbInstance);

        // Execute count and data queries in parallel
        const [users, total] = await Promise.all([
          UsersQuery.getUsersForAdminAsync(filters, context),
          UsersQuery.countUsersForAdminAsync(filters, context),
        ]);

        return { total, users };
      },
      {
        includeResultSummary: (result) => ({
          total: result.total,
          usersCount: result.users.length,
        }),
      },
    );
  }

  /**
   * Check if username is available (not taken and not reserved).
   * Optionally exclude a specific user (for username changes).
   *
   * Cache behavior: No caching - always queries fresh data for accuracy.
   *
   * @param username - The username to check
   * @param excludeUserId - Optional user ID to exclude from the check
   * @param dbInstance - Optional database instance for transactions
   * @returns True if the username is available, false otherwise
   */
  static async isUsernameAvailableAsync(
    username: string,
    excludeUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<boolean> {
    return executeFacadeOperation(
      {
        data: { hasExcludeUserId: Boolean(excludeUserId), username },
        facade: facadeName,
        method: 'isUsernameAvailableAsync',
        operation: OPERATIONS.USERS.CHECK_USERNAME_AVAILABLE,
      },
      async () => {
        // Check if username is reserved
        if (isReservedUsername(username)) {
          return false;
        }

        // Check if username is taken by another user
        const context = this.getPublicContext(dbInstance);
        const exists = await UsersQuery.checkUsernameExistsAsync(username, context, excludeUserId);

        return !exists;
      },
      {
        includeResultSummary: (result) => ({ isAvailable: result }),
      },
    );
  }

  // ============================================================================
  // Admin Operations
  // ============================================================================

  /**
   * Lock a user account.
   *
   * Business rules:
   * - Cannot lock admin users
   * - Cannot lock yourself
   *
   * Cache behavior: Invalidates user profile cache after successful lock.
   *
   * @param targetUserId - User ID to lock
   * @param actingAdminId - ID of the admin performing the action
   * @param lockDurationHours - Optional lock duration in hours (indefinite if not provided)
   * @param dbInstance - Optional database instance for transactions
   * @returns Updated user record
   * @throws Error if user not found, trying to lock yourself, or trying to lock an admin
   */
  static async lockUserAsync(
    targetUserId: string,
    actingAdminId: string,
    lockDurationHours?: number,
    dbInstance?: DatabaseExecutor,
  ): Promise<UserRecord> {
    return executeFacadeOperation(
      {
        data: { actingAdminId, lockDurationHours, targetUserId },
        facade: facadeName,
        method: 'lockUserAsync',
        operation: OPERATIONS.USERS.LOCK_USER,
        userId: actingAdminId,
      },
      async () => {
        const executor = dbInstance ?? db;

        return await executor.transaction(async (tx) => {
          // Business rule: Cannot lock yourself
          if (targetUserId === actingAdminId) {
            const errorContext = {
              data: { actingAdminId, targetUserId },
              facade: facadeName,
              method: 'lockUserAsync',
              operation: OPERATIONS.USERS.LOCK_USER,
              userId: actingAdminId,
            };
            throw createFacadeError(errorContext, new Error('Cannot lock your own account'));
          }

          // Fetch target user to check if they're an admin
          const context = this.getPublicContext(tx);
          const targetUser = await UsersQuery.getUserByUserIdAsync(targetUserId, context);

          if (!targetUser) {
            const errorContext = {
              data: { targetUserId },
              facade: facadeName,
              method: 'lockUserAsync',
              operation: OPERATIONS.USERS.LOCK_USER,
              userId: actingAdminId,
            };
            throw createFacadeError(errorContext, new Error('User not found'));
          }

          // Business rule: Cannot lock admin users
          if (targetUser.role === 'admin') {
            const errorContext = {
              data: { targetRole: targetUser.role, targetUserId },
              facade: facadeName,
              method: 'lockUserAsync',
              operation: OPERATIONS.USERS.LOCK_USER,
              userId: actingAdminId,
            };
            throw createFacadeError(errorContext, new Error('Cannot lock admin users'));
          }

          // Calculate lock expiration time
          const lockedUntil =
            lockDurationHours ?
              new Date(Date.now() + lockDurationHours * 60 * 60 * 1000)
            : new Date('9999-12-31T23:59:59.999Z'); // Far future date for indefinite lock

          const updatedUser = await UsersQuery.updateUserLockAsync(targetUserId, lockedUntil, context);

          if (!updatedUser) {
            const errorContext = {
              data: { targetUserId },
              facade: facadeName,
              method: 'lockUserAsync',
              operation: OPERATIONS.USERS.LOCK_USER,
              userId: actingAdminId,
            };
            throw createFacadeError(errorContext, new Error('Failed to lock user'));
          }

          // Invalidate cache for this user
          CacheRevalidationService.users.onProfileUpdate(targetUserId);

          return updatedUser;
        });
      },
      {
        includeResultSummary: (result) => ({
          lockedUntil: result.lockedUntil?.toISOString(),
          targetUserId: result.id,
        }),
      },
    );
  }

  /**
   * Unlock a user account.
   *
   * Cache behavior: Invalidates user profile cache after successful unlock.
   *
   * @param targetUserId - User ID to unlock
   * @param dbInstance - Optional database instance for transactions
   * @returns Updated user record
   * @throws Error if user not found
   */
  static async unlockUserAsync(targetUserId: string, dbInstance?: DatabaseExecutor): Promise<UserRecord> {
    return executeFacadeOperation(
      {
        data: { targetUserId },
        facade: facadeName,
        method: 'unlockUserAsync',
        operation: OPERATIONS.USERS.UNLOCK_USER,
      },
      async () => {
        const context = this.getPublicContext(dbInstance);
        const updatedUser = await UsersQuery.updateUserLockAsync(targetUserId, null, context);

        if (!updatedUser) {
          const errorContext = {
            data: { targetUserId },
            facade: facadeName,
            method: 'unlockUserAsync',
            operation: OPERATIONS.USERS.UNLOCK_USER,
          };
          throw createFacadeError(errorContext, new Error('User not found'));
        }

        // Invalidate cache for this user
        CacheRevalidationService.users.onProfileUpdate(targetUserId);

        return updatedUser;
      },
      {
        includeResultSummary: (result) => ({ targetUserId: result.id, unlocked: true }),
      },
    );
  }

  /**
   * Update username and set usernameChangedAt timestamp.
   *
   * Cache behavior: Invalidates user profile cache after successful update.
   *
   * @param userId - The user ID to update
   * @param newUsername - The new username to set
   * @param dbInstance - Optional database instance for transactions
   * @returns Updated user record
   * @throws Error if update fails
   */
  static async updateUsernameAsync(
    userId: string,
    newUsername: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<UserRecord> {
    return executeFacadeOperation(
      {
        data: { userId },
        facade: facadeName,
        method: 'updateUsernameAsync',
        operation: OPERATIONS.USERS.UPDATE_USERNAME,
        userId,
      },
      async () => {
        const context = this.getPublicContext(dbInstance);
        const updatedUser = await UsersQuery.updateUsernameAsync(userId, newUsername, context);

        if (!updatedUser) {
          const errorContext = {
            data: { userId },
            facade: facadeName,
            method: 'updateUsernameAsync',
            operation: OPERATIONS.USERS.UPDATE_USERNAME,
            userId,
          };
          throw createFacadeError(errorContext, new Error('Failed to update user username'));
        }

        // Invalidate cache for this user
        CacheRevalidationService.users.onProfileUpdate(userId);

        return updatedUser;
      },
      {
        includeResultSummary: (result) => ({ userId: result.id, usernameUpdated: true }),
      },
    );
  }

  /**
   * Update a user's role.
   *
   * Business rules:
   * - Cannot demote yourself
   * - Cannot assign 'admin' role (only 'user' or 'moderator')
   *
   * Cache behavior: Invalidates user profile cache after successful update.
   *
   * @param targetUserId - User ID to update
   * @param newRole - New role to assign ('user' or 'moderator')
   * @param actingAdminId - ID of the admin performing the action
   * @param dbInstance - Optional database instance for transactions
   * @returns Updated user record
   * @throws Error if user not found or trying to change your own role
   */
  static async updateUserRoleAsync(
    targetUserId: string,
    newRole: AssignableRole,
    actingAdminId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<UserRecord> {
    return executeFacadeOperation(
      {
        data: { actingAdminId, newRole, targetUserId },
        facade: facadeName,
        method: 'updateUserRoleAsync',
        operation: OPERATIONS.USERS.UPDATE_ROLE,
        userId: actingAdminId,
      },
      async () => {
        const executor = dbInstance ?? db;

        return await executor.transaction(async (tx) => {
          // Business rule: Cannot demote yourself
          if (targetUserId === actingAdminId) {
            const errorContext = {
              data: { actingAdminId, targetUserId },
              facade: facadeName,
              method: 'updateUserRoleAsync',
              operation: OPERATIONS.USERS.UPDATE_ROLE,
              userId: actingAdminId,
            };
            throw createFacadeError(errorContext, new Error('Cannot change your own role'));
          }

          const context = this.getPublicContext(tx);
          const updatedUser = await UsersQuery.updateUserRoleAsync(targetUserId, newRole, context);

          if (!updatedUser) {
            const errorContext = {
              data: { newRole, targetUserId },
              facade: facadeName,
              method: 'updateUserRoleAsync',
              operation: OPERATIONS.USERS.UPDATE_ROLE,
              userId: actingAdminId,
            };
            throw createFacadeError(errorContext, new Error('User not found'));
          }

          // Invalidate cache for this user
          CacheRevalidationService.users.onProfileUpdate(targetUserId);

          return updatedUser;
        });
      },
      {
        includeResultSummary: (result) => ({
          newRole: result.role,
          targetUserId: result.id,
        }),
      },
    );
  }
}
