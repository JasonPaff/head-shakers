import type { User, UserJSON } from '@clerk/nextjs/server';

import * as Sentry from '@sentry/nextjs';
import { eq } from 'drizzle-orm';

import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { db } from '@/lib/db';
import { users, userSettings } from '@/lib/db/schema';

type ClerkUser = User | UserJSON;

/**
 * user sync service
 * centralizes logic for syncing Clerk users to the database
 * used by both webhook endpoint and auth middleware fallback
 */
export class UserSyncService {
  /**
   * soft delete user from database
   * sets deletedAt timestamp
   *
   * @param clerkId - Clerk user ID
   * @param txInstance - optional database transaction instance
   */
  static async deleteUserFromClerk(
    clerkId: string,
    txInstance?: DatabaseExecutor,
  ): Promise<null | typeof users.$inferSelect> {
    const dbInstance = txInstance || db;

    try {
      const [deletedUser] = await dbInstance
        .update(users)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, clerkId))
        .returning();

      if (deletedUser) {
        Sentry.addBreadcrumb({
          category: 'user-sync',
          data: {
            clerkId,
            userId: deletedUser.id,
          },
          level: 'info',
          message: 'User soft deleted from Clerk',
        });
      }

      return deletedUser || null;
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          clerkId,
        },
        tags: {
          component: 'UserSyncService',
          operation: 'deleteUserFromClerk',
        },
      });

      throw error;
    }
  }

  /**
   * sync user from Clerk to database
   * creates user + userSettings in a single transaction
   * handles duplicate clerkId errors gracefully (race conditions)
   *
   * @param clerkUser - Clerk user object from webhook or API
   * @param txInstance - optional database transaction instance
   * @returns the created or existing user record
   */
  static async syncUserFromClerk(
    clerkUser: ClerkUser,
    txInstance?: DatabaseExecutor,
  ): Promise<typeof users.$inferSelect> {
    const dbInstance = txInstance || db;

    try {
      // extract and map Clerk user data to database schema
      const email = getEmail(clerkUser);

      if (!email) {
        throw new Error('User email is required');
      }

      // generate username from Clerk username or email
      const baseUsername = clerkUser.username || email.split('@')[0] || 'user';
      const username = await this.generateUniqueUsername(baseUsername, dbInstance);

      // perform transaction: create user + settings
      const result = await dbInstance.transaction(async (tx) => {
        // get avatar URL and handle length constraints
        const rawAvatarUrl = getImageUrl(clerkUser);
        const avatarUrl = rawAvatarUrl && rawAvatarUrl.length <= 100 ? rawAvatarUrl : null;

        // insert user record
        const [newUser] = await tx
          .insert(users)
          .values({
            avatarUrl,
            clerkId: clerkUser.id,
            email,
            username,
          })
          .returning();

        if (!newUser) {
          throw new Error('Failed to create user');
        }

        // insert user settings with defaults
        await tx.insert(userSettings).values({
          userId: newUser.id,
        });

        return newUser;
      });

      if (!result) {
        throw new Error('Transaction failed to return user');
      }

      Sentry.addBreadcrumb({
        category: 'user-sync',
        data: {
          clerkId: clerkUser.id,
          userId: result.id,
          username: result.username,
        },
        level: 'info',
        message: 'User synced from Clerk',
      });

      return result;
    } catch (error) {
      // handle duplicate clerkId (race condition)
      if (error instanceof Error && error.message.includes('unique constraint')) {
        // user already exists, fetch and return
        const [existingUser] = await dbInstance
          .select()
          .from(users)
          .where(eq(users.clerkId, clerkUser.id))
          .limit(1);

        if (existingUser) {
          Sentry.addBreadcrumb({
            category: 'user-sync',
            data: {
              clerkId: clerkUser.id,
              reason: 'duplicate_key',
              userId: existingUser.id,
            },
            level: 'info',
            message: 'User already exists (race condition)',
          });
          return existingUser;
        }
      }

      // log error and rethrow
      Sentry.captureException(error, {
        extra: {
          clerkId: clerkUser.id,
          email: getEmail(clerkUser),
        },
        tags: {
          component: 'UserSyncService',
          operation: 'syncUserFromClerk',
        },
      });

      throw error;
    }
  }

  /**
   * update user from Clerk data
   * syncs changes from Clerk to database (name, email, avatar, etc.)
   *
   * @param clerkUser - updated Clerk user object
   * @param txInstance - optional database transaction instance
   */
  static async updateUserFromClerk(
    clerkUser: ClerkUser,
    txInstance?: DatabaseExecutor,
  ): Promise<null | typeof users.$inferSelect> {
    const dbInstance = txInstance || db;

    try {
      const email = getEmail(clerkUser);

      if (!email) {
        throw new Error('User email is required');
      }

      // get avatar URL and handle length constraints
      const rawAvatarUrl = getImageUrl(clerkUser);
      // temporarily set to null if URL exceeds database limit (100 chars)
      // TODO: increase avatar_url column size to 500 in migration
      const avatarUrl = rawAvatarUrl && rawAvatarUrl.length <= 100 ? rawAvatarUrl : null;

      // update user record
      const [updatedUser] = await dbInstance
        .update(users)
        .set({
          avatarUrl,
          email,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, clerkUser.id))
        .returning();

      if (updatedUser) {
        Sentry.addBreadcrumb({
          category: 'user-sync',
          data: {
            clerkId: clerkUser.id,
            userId: updatedUser.id,
          },
          level: 'info',
          message: 'User updated from Clerk',
        });
      }

      return updatedUser || null;
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          clerkId: clerkUser.id,
        },
        tags: {
          component: 'UserSyncService',
          operation: 'updateUserFromClerk',
        },
      });

      throw error;
    }
  }

  /**
   * generate unique username by checking for duplicates
   * if username exists, append random suffix until unique
   *
   * @param baseUsername - base username to start with
   * @param txInstance - database instance for checking uniqueness
   * @returns unique username
   */
  private static async generateUniqueUsername(
    baseUsername: string,
    txInstance: DatabaseExecutor,
  ): Promise<string> {
    // sanitize username: lowercase, remove special chars, limit length
    let username = baseUsername
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 20);

    // ensure minimum length
    if (username.length < 3) {
      username = `user_${username}`;
    }

    // check if username exists
    const [existing] = await txInstance
      .select({ username: users.username })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    // if exists, append random suffix
    if (existing) {
      const randomSuffix = Math.floor(Math.random() * 10000);
      username = `${username.slice(0, 15)}_${randomSuffix}`;

      // recursive check with new username (max 3 attempts)
      const [stillExists] = await txInstance
        .select({ username: users.username })
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (stillExists) {
        // use timestamp as last resort
        username = `user_${Date.now()}`.slice(0, 20);
      }
    }

    return username;
  }
}

/**
 * helper to extract email from either User or UserJSON
 */
function getEmail(user: ClerkUser): string | undefined {
  if ('emailAddresses' in user) {
    return user.emailAddresses?.[0]?.emailAddress;
  }
  return user.email_addresses?.[0]?.email_address;
}

/**
 * helper to extract image URL
 */
function getImageUrl(user: ClerkUser): string | undefined {
  if ('imageUrl' in user) {
    return user.imageUrl;
  }
  return user.image_url;
}
