import { count, desc, eq, inArray, isNotNull, isNull } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';
import type {
  InsertLaunchNotification,
  SelectLaunchNotification,
} from '@/lib/validations/launch-notification.validations';

import { launchNotifications } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export class LaunchNotificationQuery extends BaseQuery {
  /**
   * add email to launch notification waitlist
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

    return result?.[0] || null;
  }

  /**
   * delete a waitlist entry
   */
  static async deleteAsync(email: string, context: QueryContext): Promise<null | SelectLaunchNotification> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .delete(launchNotifications)
      .where(eq(launchNotifications.email, email))
      .returning();

    return result?.[0] || null;
  }

  /**
   * check if email is already on waitlist
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

    return result?.[0] || null;
  }

  /**
   * get all waitlist signups for admin
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
   * get notified count (how many people have been sent the launch email)
   */
  static async getNotifiedCountAsync(context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ value: count() })
      .from(launchNotifications)
      .where(isNotNull(launchNotifications.notifiedAt));

    return result?.[0]?.value || 0;
  }

  /**
   * get total waitlist count
   */
  static async getTotalCountAsync(context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.select({ value: count() }).from(launchNotifications);

    return result?.[0]?.value || 0;
  }

  /**
   * get unnotified count
   */
  static async getUnnotifiedCountAsync(context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ value: count() })
      .from(launchNotifications)
      .where(isNull(launchNotifications.notifiedAt));

    return result?.[0]?.value || 0;
  }

  /**
   * get unnotified emails for bulk sending
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
   * mark emails as notified
   */
  static async markAsNotifiedAsync(emails: Array<string>, context: QueryContext): Promise<void> {
    const dbInstance = this.getDbInstance(context);

    if (emails.length === 0) return;

    await dbInstance
      .update(launchNotifications)
      .set({ notifiedAt: new Date() })
      .where(inArray(launchNotifications.email, emails));
  }
}
