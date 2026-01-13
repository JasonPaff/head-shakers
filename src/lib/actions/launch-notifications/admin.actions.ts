'use server';

import 'server-only';

import type { ActionResponse } from '@/lib/utils/action-response';

import { ACTION_NAMES, OPERATIONS, SENTRY_CONTEXTS } from '@/lib/constants';
import { LaunchNotificationFacade } from '@/lib/facades/launch-notifications/launch-notification.facade';
import { actionSuccess } from '@/lib/utils/action-response';
import { adminActionClient } from '@/lib/utils/next-safe-action';
import { withActionBreadcrumbs, withActionErrorHandling } from '@/lib/utils/sentry-server/breadcrumbs.server';

/**
 * Get launch notification statistics (admin only).
 * Fetches total, notified, and unnotified counts for the waitlist.
 */
export const getLaunchNotificationStatsAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.GET_LAUNCH_NOTIFICATION_STATS,
    isTransactionRequired: false,
  })
  .action(
    async ({
      ctx,
    }): Promise<ActionResponse<{ notifiedCount: number; totalCount: number; unnotifiedCount: number }>> => {
      return withActionBreadcrumbs(
        {
          actionName: ACTION_NAMES.ADMIN.GET_LAUNCH_NOTIFICATION_STATS,
          operation: OPERATIONS.LAUNCH_NOTIFICATIONS.GET_STATISTICS,
        },
        async () => {
          const stats = await LaunchNotificationFacade.getStatisticsAsync(ctx.db);

          return actionSuccess(stats, 'Launch notification statistics retrieved successfully.');
        },
        {
          includeResultSummary: (result) =>
            result.wasSuccess ?
              {
                notifiedCount: result.data?.notifiedCount,
                totalCount: result.data?.totalCount,
                unnotifiedCount: result.data?.unnotifiedCount,
              }
            : {},
        },
      );
    },
  );

/**
 * Send launch notification emails to all unnotified subscribers (admin only).
 * Sends batch emails and marks them as notified in the database.
 */
export const sendLaunchNotificationsAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.SEND_LAUNCH_NOTIFICATIONS,
    isTransactionRequired: true,
  })
  .action(
    async ({
      ctx,
    }): Promise<ActionResponse<{ failedCount: number; failedEmails: Array<string>; sentCount: number }>> => {
      return withActionErrorHandling(
        {
          actionName: ACTION_NAMES.ADMIN.SEND_LAUNCH_NOTIFICATIONS,
          contextData: {
            userId: ctx.userId,
          },
          contextType: SENTRY_CONTEXTS.LAUNCH_NOTIFICATION_DATA,
          operation: OPERATIONS.LAUNCH_NOTIFICATIONS.SEND_NOTIFICATIONS,
          userId: ctx.userId,
        },
        async () => {
          const result = await LaunchNotificationFacade.sendLaunchNotificationsAsync(ctx.db);

          return actionSuccess(
            {
              failedCount: result.failedEmails.length,
              failedEmails: result.failedEmails,
              sentCount: result.sentCount,
            },
            `Successfully sent ${result.sentCount} launch notification emails.`,
          );
        },
        {
          includeResultSummary: (result) =>
            result.wasSuccess ?
              {
                failedCount: result.data?.failedCount,
                sentCount: result.data?.sentCount,
              }
            : {},
        },
      );
    },
  );
