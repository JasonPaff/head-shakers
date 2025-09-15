import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { createPublicQueryContext } from '@/lib/queries/base/query-context';
import { type UserRecord, UsersQuery } from '@/lib/queries/users/users-query';

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
    const context = createPublicQueryContext({ dbInstance });
    return UsersQuery.findByClerkIdAsync(clerkId, context);
  }
}
