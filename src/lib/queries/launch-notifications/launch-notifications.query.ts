import { count, desc, eq, inArray, isNotNull, isNull } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';
import type {
  InsertLaunchNotification,
  SelectLaunchNotification,
} from '@/lib/validations/launch-notification.validations';

import { launchNotifications } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export type LaunchNotificationRecord = typeof launchNotifications.$inferSelect;

/**
 * Launch notification domain query service.
 * Handles all database operations for launch notification waitlist with consistent patterns.
 */
export class LaunchNotificationsQuery extends BaseQuery {
  /**
   * Add email to launch notification waitlist.
   */
  static async addToWaitlistAsync(
    data: InsertLaunchNotification,
    context: QueryContext,
  ): Promise<null | SelectLaunchNotification> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .insert(launchNotifications)
      .values(data)
      .onConflictDoNothing()
      .returning();

    return result[0] || null;
  }

  /**
   * Delete a waitlist entry.
   */
  static async deleteAsync(email: string, context: QueryContext): Promise<null | SelectLaunchNotification> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .delete(launchNotifications)
      .where(eq(launchNotifications.email, email))
      .returning();

    return result[0] || null;
  }

  /**
   * Check if email is already on waitlist.
   */
  static async findByEmailAsync(
    email: string,
    context: QueryContext,
  ): Promise<null | SelectLaunchNotification> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select()
      .from(launchNotifications)
      .where(eq(launchNotifications.email, email))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get all waitlist signups for admin.
   */
  static async getAllWaitlistAsync(context: QueryContext): Promise<Array<SelectLaunchNotification>> {
    const dbInstance = this.getDbInstance(context);

    const results = await dbInstance
      .select()
      .from(launchNotifications)
      .orderBy(desc(launchNotifications.createdAt));

    return results;
  }

  /**
   * Get notified count (how many people have been sent the launch email).
   */
  static async getNotifiedCountAsync(context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ count: count() })
      .from(launchNotifications)
      .where(isNotNull(launchNotifications.notifiedAt));

    return result[0]?.count || 0;
  }

  /**
   * Get total waitlist count.
   */
  static async getTotalCountAsync(context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.select({ count: count() }).from(launchNotifications);

    return result[0]?.count || 0;
  }

  /**
   * Get unnotified count.
   */
  static async getUnnotifiedCountAsync(context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ count: count() })
      .from(launchNotifications)
      .where(isNull(launchNotifications.notifiedAt));

    return result[0]?.count || 0;
  }

  /**
   * Get unnotified emails for bulk sending.
   */
  static async getUnnotifiedEmailsAsync(context: QueryContext): Promise<Array<string>> {
    const dbInstance = this.getDbInstance(context);

    const results = await dbInstance
      .select({ email: launchNotifications.email })
      .from(launchNotifications)
      .where(isNull(launchNotifications.notifiedAt));

    return results.map((r) => r.email);
  }

  /**
   * Mark emails as notified.
   */
  static async markAsNotifiedAsync(
    emails: Array<string>,
    context: QueryContext,
  ): Promise<Array<SelectLaunchNotification>> {
    const dbInstance = this.getDbInstance(context);

    if (emails.length === 0) return [];

    const result = await dbInstance
      .update(launchNotifications)
      .set({ notifiedAt: new Date() })
      .where(inArray(launchNotifications.email, emails))
      .returning();

    return result;
  }
}
