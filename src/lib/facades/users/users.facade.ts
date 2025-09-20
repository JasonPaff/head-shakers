import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { createPublicQueryContext } from '@/lib/queries/base/query-context';
import { type UserRecord, UsersQuery } from '@/lib/queries/users/users-query';
import { CacheService } from '@/lib/services/cache.service';

/**
 * unified Users Facade
 * combines query operations with business logic validation
 * provides a clean API for all user operations
 */
export class UsersFacade {
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
}
