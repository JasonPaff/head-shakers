import { unstable_cache } from 'next/cache';
import { cache } from 'react';

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
   * get user by Clerk ID with React cache (request-level deduplication)
   */
  private static getUserByClerkIdBase = cache(
    async (clerkId: string, dbInstance?: DatabaseExecutor): Promise<null | UserRecord> => {
      const context = createPublicQueryContext({ dbInstance });
      return UsersQuery.findByClerkIdAsync(clerkId, context);
    },
  );

  /**
   * get user by Clerk ID with Next.js unstable_cache (persistent caching)
   */
  static getUserByClerkId = unstable_cache(
    async (clerkId: string, dbInstance?: DatabaseExecutor): Promise<null | UserRecord> => {
      return await UsersFacade.getUserByClerkIdBase(clerkId, dbInstance);
    },
    ['users-by-clerk-id'],
    {
      revalidate: 600, // 10 minutes - users don't change often
      tags: ['users'],
    },
  );
}
