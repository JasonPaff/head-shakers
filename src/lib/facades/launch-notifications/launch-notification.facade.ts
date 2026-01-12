import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type {
  AddToWaitlist,
  SelectLaunchNotification,
} from '@/lib/validations/launch-notification.validations';

import { OPERATIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { LaunchNotificationsQuery } from '@/lib/queries/launch-notifications/launch-notifications.query';
import { ResendService } from '@/lib/services/resend.service';
import { maskEmail } from '@/lib/utils/email-utils';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';
import { captureFacadeWarning, facadeBreadcrumb } from '@/lib/utils/sentry-server/breadcrumbs.server';

const facadeName = 'LAUNCH_NOTIFICATION_FACADE';

/**
 * Result type for sending launch notifications
 */
export interface SendNotificationsResult {
  /** Email addresses that failed to send */
  failedEmails: Array<string>;
  /** Number of emails successfully sent */
  sentCount: number;
}

/**
 * Result type for waitlist statistics operations
 */
export interface WaitlistStatisticsResult {
  /** Number of subscribers who have been notified */
  notifiedCount: number;
  /** Total number of waitlist subscribers */
  totalCount: number;
  /** Number of subscribers who have not been notified yet */
  unnotifiedCount: number;
}

/**
 * LaunchNotificationFacade handles business logic for launch notification waitlist operations
 * Provides methods for managing waitlist subscribers and sending launch notifications
 */
export class LaunchNotificationFacade extends BaseFacade {
  /**
   * Add email to launch notification waitlist and send confirmation email
   *
   * Privacy-preserving behavior: Sends confirmation email regardless of whether
   * it's a new email or duplicate. This prevents revealing if an email is already on the list.
   *
   * Note: Email sending failures are captured as warnings but do not fail the operation.
   * The waitlist signup is considered successful even if the confirmation email fails.
   *
   * @param data - Waitlist signup data containing the email address
   * @param dbInstance - Database instance for transactions (defaults to db)
   * @returns Promise that resolves when signup is complete
   */
  static async addToWaitlistAsync(data: AddToWaitlist, dbInstance: DatabaseExecutor = db): Promise<void> {
    return executeFacadeOperation(
      {
        data: { email: maskEmail(data.email) },
        facade: facadeName,
        method: 'addToWaitlistAsync',
        operation: OPERATIONS.LAUNCH_NOTIFICATIONS.ADD_TO_WAITLIST,
      },
      async () => {
        const context = this.getPublicContext(dbInstance);

        // Add to waitlist (silent success for duplicates)
        await LaunchNotificationsQuery.addToWaitlistAsync({ email: data.email }, context);

        // Send confirmation email asynchronously - non-blocking
        // Note: we send confirmation regardless of whether it's a new email or duplicate
        // This is privacy-friendly and doesn't reveal if email is on list
        void this.sendConfirmationEmailAsync(data.email);
      },
    );
  }

  /**
   * Get all waitlist signups for admin dashboard
   *
   * Note: No caching implemented as this is admin-only data that benefits from fresh reads.
   *
   * @param dbInstance - Database instance for transactions (defaults to db)
   * @returns Array of all launch notification records
   */
  static async getAllWaitlistAsync(
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<SelectLaunchNotification>> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getAllWaitlistAsync',
        operation: OPERATIONS.LAUNCH_NOTIFICATIONS.GET_ALL_WAITLIST,
      },
      async () => {
        const context = this.getPublicContext(dbInstance);
        return LaunchNotificationsQuery.getAllWaitlistAsync(context);
      },
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Get waitlist statistics including total, notified, and unnotified counts
   *
   * Fetches all three counts in parallel for optimal performance.
   * Note: No caching implemented as this is admin-only data that benefits from fresh reads.
   *
   * @param dbInstance - Database instance for transactions (defaults to db)
   * @returns Statistics object with totalCount, notifiedCount, and unnotifiedCount
   */
  static async getStatisticsAsync(dbInstance: DatabaseExecutor = db): Promise<WaitlistStatisticsResult> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getStatisticsAsync',
        operation: OPERATIONS.LAUNCH_NOTIFICATIONS.GET_STATISTICS,
      },
      async () => {
        const context = this.getPublicContext(dbInstance);

        const [totalCount, notifiedCount, unnotifiedCount] = await Promise.all([
          LaunchNotificationsQuery.getTotalCountAsync(context),
          LaunchNotificationsQuery.getNotifiedCountAsync(context),
          LaunchNotificationsQuery.getUnnotifiedCountAsync(context),
        ]);

        return {
          notifiedCount,
          totalCount,
          unnotifiedCount,
        };
      },
      {
        includeResultSummary: (result) => ({
          notifiedCount: result.notifiedCount,
          totalCount: result.totalCount,
          unnotifiedCount: result.unnotifiedCount,
        }),
      },
    );
  }

  /**
   * Delete email from waitlist
   *
   * @param email - Email address to remove from waitlist
   * @param dbInstance - Database instance for transactions (defaults to db)
   * @returns Promise that resolves when deletion is complete
   */
  static async removeFromWaitlistAsync(email: string, dbInstance: DatabaseExecutor = db): Promise<void> {
    return executeFacadeOperation(
      {
        data: { email: maskEmail(email) },
        facade: facadeName,
        method: 'removeFromWaitlistAsync',
        operation: OPERATIONS.LAUNCH_NOTIFICATIONS.REMOVE_FROM_WAITLIST,
      },
      async () => {
        const context = this.getPublicContext(dbInstance);
        await LaunchNotificationsQuery.deleteAsync(email, context);
      },
    );
  }

  /**
   * Send launch notification emails to all unnotified subscribers
   *
   * Process:
   * 1. Fetches all unnotified email addresses
   * 2. Sends batch launch notification emails via ResendService
   * 3. Marks successfully sent emails as notified in the database
   *
   * Note: Failed emails are returned for retry/manual handling but do not
   * cause the overall operation to fail.
   *
   * @param dbInstance - Database instance for transactions (defaults to db)
   * @returns Result with sentCount and array of failedEmails
   */
  static async sendLaunchNotificationsAsync(
    dbInstance: DatabaseExecutor = db,
  ): Promise<SendNotificationsResult> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'sendLaunchNotificationsAsync',
        operation: OPERATIONS.LAUNCH_NOTIFICATIONS.SEND_NOTIFICATIONS,
      },
      async () => {
        const context = this.getPublicContext(dbInstance);

        // Get unnotified emails
        const emails = await LaunchNotificationsQuery.getUnnotifiedEmailsAsync(context);

        facadeBreadcrumb('Fetched unnotified emails for launch notifications', {
          emailCount: emails.length,
        });

        if (emails.length === 0) {
          return { failedEmails: [], sentCount: 0 };
        }

        // Send launch emails
        const { failedEmails, sentCount } = await ResendService.sendLaunchNotificationsAsync(emails);

        facadeBreadcrumb('Launch notification emails sent', {
          failedCount: failedEmails.length,
          sentCount,
          totalEmails: emails.length,
        });

        // Mark successfully sent emails as notified
        const successfulEmails = emails.filter((e) => !failedEmails.includes(e));
        if (successfulEmails.length > 0) {
          await LaunchNotificationsQuery.markAsNotifiedAsync(successfulEmails, context);
          facadeBreadcrumb('Marked emails as notified', {
            markedCount: successfulEmails.length,
          });
        }

        return { failedEmails, sentCount };
      },
      {
        includeResultSummary: (result) => ({
          failedCount: result.failedEmails.length,
          sentCount: result.sentCount,
        }),
      },
    );
  }

  /**
   * Send confirmation email asynchronously (non-blocking)
   * Failures are logged as warnings and don't fail the waitlist signup
   *
   * @param email - Email address to send confirmation to
   */
  private static async sendConfirmationEmailAsync(email: string): Promise<void> {
    try {
      await ResendService.sendWaitlistConfirmationAsync(email);
      facadeBreadcrumb('Waitlist confirmation email sent successfully', {
        email: maskEmail(email),
      });
    } catch (emailError) {
      captureFacadeWarning(emailError, facadeName, OPERATIONS.LAUNCH_NOTIFICATIONS.ADD_TO_WAITLIST, {
        email: maskEmail(email),
        step: 'sendConfirmationEmail',
      });
    }
  }
}
