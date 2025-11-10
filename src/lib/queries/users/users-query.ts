import { eq } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';

import { users } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export type UserRecord = typeof users.$inferSelect;

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
}
