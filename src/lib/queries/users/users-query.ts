import { eq } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';

import { users } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export type UserRecord = typeof users.$inferSelect;

export class UsersQuery extends BaseQuery {
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
}
