import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type {
  AddToWaitlist,
  SelectLaunchNotification,
} from '@/lib/validations/launch-notification.validations';

import { createPublicQueryContext } from '@/lib/queries/base/query-context';
import { LaunchNotificationQuery } from '@/lib/queries/launch-notifications/launch-notification-query';
import { ResendService } from '@/lib/services/resend.service';
import { createFacadeError } from '@/lib/utils/error-builders';

/**
 * unified Launch Notification Facade
 * provides a clean API for all launch notification operations
 */
export class LaunchNotificationFacade {
  /**
   * add email to launch notification waitlist and send confirmation email
   */
  static async addToWaitlistAsync(
    data: AddToWaitlist,
    dbInstance?: DatabaseExecutor,
  ): Promise<void> {
    try {
      const context = createPublicQueryContext({ dbInstance });

      // add to waitlist (silent success for duplicates)
      await LaunchNotificationQuery.addToWaitlistAsync(
        { email: data.email },
        context,
      );

      // send confirmation email
      // note: we send confirmation regardless of whether it's a new email or duplicate
      // this is privacy-friendly and doesn't reveal if email is on list
      await ResendService.sendWaitlistConfirmationAsync(data.email);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { email: data.email },
        facade: 'LaunchNotificationFacade',
        method: 'addToWaitlistAsync',
        operation: 'addToWaitlist',
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * get all waitlist signups for admin dashboard
   */
  static async getAllWaitlistAsync(dbInstance?: DatabaseExecutor): Promise<Array<SelectLaunchNotification>> {
    try {
      const context = createPublicQueryContext({ dbInstance });
      return LaunchNotificationQuery.getAllWaitlistAsync(context);
    } catch (error) {
      const context: FacadeErrorContext = {
        facade: 'LaunchNotificationFacade',
        method: 'getAllWaitlistAsync',
        operation: 'getAllWaitlist',
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * get waitlist statistics
   */
  static async getStatisticsAsync(
    dbInstance?: DatabaseExecutor,
  ): Promise<{ notifiedCount: number; totalCount: number; unnotifiedCount: number }> {
    try {
      const context = createPublicQueryContext({ dbInstance });

      const [totalCount, notifiedCount, unnotifiedCount] = await Promise.all([
        LaunchNotificationQuery.getTotalCountAsync(context),
        LaunchNotificationQuery.getNotifiedCountAsync(context),
        LaunchNotificationQuery.getUnnotifiedCountAsync(context),
      ]);

      return {
        notifiedCount,
        totalCount,
        unnotifiedCount,
      };
    } catch (error) {
      const context: FacadeErrorContext = {
        facade: 'LaunchNotificationFacade',
        method: 'getStatisticsAsync',
        operation: 'getStatistics',
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * delete email from waitlist
   */
  static async removeFromWaitlistAsync(email: string, dbInstance?: DatabaseExecutor): Promise<void> {
    try {
      const context = createPublicQueryContext({ dbInstance });
      await LaunchNotificationQuery.deleteAsync(email, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { email },
        facade: 'LaunchNotificationFacade',
        method: 'removeFromWaitlistAsync',
        operation: 'removeFromWaitlist',
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * send launch notification emails to all unnotified subscribers
   */
  static async sendLaunchNotificationsAsync(dbInstance?: DatabaseExecutor): Promise<{
    failedEmails: Array<string>;
    sentCount: number;
  }> {
    try {
      const context = createPublicQueryContext({ dbInstance });

      // get unnotified emails
      const emails = await LaunchNotificationQuery.getUnnotifiedEmailsAsync(context);

      if (emails.length === 0) {
        return { failedEmails: [], sentCount: 0 };
      }

      // send launch emails
      const { failedEmails, sentCount } = await ResendService.sendLaunchNotificationsAsync(emails);

      // mark successfully sent emails as notified
      const successfulEmails = emails.filter((e) => !failedEmails.includes(e));
      if (successfulEmails.length > 0) {
        await LaunchNotificationQuery.markAsNotifiedAsync(successfulEmails, context);
      }

      return { failedEmails, sentCount };
    } catch (error) {
      const context: FacadeErrorContext = {
        facade: 'LaunchNotificationFacade',
        method: 'sendLaunchNotificationsAsync',
        operation: 'sendLaunchNotifications',
      };
      throw createFacadeError(context, error);
    }
  }
}
