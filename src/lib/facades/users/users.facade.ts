import { eq } from 'drizzle-orm';

import type { UserRecord } from '@/lib/queries/users/users-query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { SCHEMA_LIMITS } from '@/lib/constants';
import { isReservedUsername } from '@/lib/constants/reserved-usernames';
import { users } from '@/lib/db/schema';
import { createPublicQueryContext } from '@/lib/queries/base/query-context';
import { UsersQuery } from '@/lib/queries/users/users-query';
import { CacheService } from '@/lib/services/cache.service';
import { CacheTagGenerators } from '@/lib/utils/cache-tags.utils';

/**
 * unified Users Facade
 * combines query operations with business logic validation
 * provides a clean API for all user operations
 */
export class UsersFacade {
  /**
   * check if user can change their username (cooldown period has passed)
   */
  static async canChangeUsername(userId: string, dbInstance?: DatabaseExecutor): Promise<boolean> {
    const user = await this.getUserById(userId, dbInstance);

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
   * get user by Clerk ID
   */
  static async getUserByClerkId(clerkId: string, dbInstance?: DatabaseExecutor): Promise<null | UserRecord> {
    return CacheService.users.profile(
      () => {
        const context = createPublicQueryContext({ dbInstance });
        return UsersQuery.findByClerkIdAsync(clerkId, context);
      },
      clerkId,
      { context: { entityType: 'user', facade: 'UsersFacade', operation: 'getByClerkId', userId: clerkId } },
    );
  }

  /**
   * get user by user ID
   */
  static async getUserById(userId: string, dbInstance?: DatabaseExecutor): Promise<null | UserRecord> {
    return CacheService.users.profile(
      () => {
        const context = createPublicQueryContext({ dbInstance });
        return UsersQuery.findByIdAsync(userId, context);
      },
      userId,
      { context: { entityType: 'user', facade: 'UsersFacade', operation: 'getByUserId', userId } },
    );
  }

  /**
   * get user by username
   */
  static async getUserByUsername(
    username: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | UserRecord> {
    const context = createPublicQueryContext({ dbInstance });
    return UsersQuery.findByUsernameAsync(username, context);
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
    displayName: string;
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
}
