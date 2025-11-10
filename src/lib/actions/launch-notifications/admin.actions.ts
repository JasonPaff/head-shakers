'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';

import {
  ACTION_NAMES,
  OPERATIONS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { LaunchNotificationFacade } from '@/lib/facades/launch-notifications/launch-notification.facade';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { adminActionClient } from '@/lib/utils/next-safe-action';

/**
 * get all launch notification waitlist signups (admin only)
 */
export const getLaunchNotificationsAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.GET_LAUNCH_NOTIFICATIONS,
    isTransactionRequired: false,
  })
  .action(async ({ ctx }) => {
    try {
      const signups = await LaunchNotificationFacade.getAllWaitlistAsync(ctx.db);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          count: signups.length,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Fetched all launch notification signups',
      });

      return {
        data: signups,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        metadata: { actionName: ACTION_NAMES.ADMIN.GET_LAUNCH_NOTIFICATIONS },
        operation: OPERATIONS.ADMIN.GET_ADMIN_REPORTS,
        userId: ctx.userId,
      });
    }
  });

/**
 * get launch notification statistics (admin only)
 */
export const getLaunchNotificationStatsAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.GET_LAUNCH_NOTIFICATION_STATS,
    isTransactionRequired: false,
  })
  .action(async ({ ctx }) => {
    try {
      const stats = await LaunchNotificationFacade.getStatisticsAsync(ctx.db);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          notifiedCount: stats.notifiedCount,
          totalCount: stats.totalCount,
          unnotifiedCount: stats.unnotifiedCount,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Fetched launch notification statistics',
      });

      return {
        data: stats,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        metadata: { actionName: ACTION_NAMES.ADMIN.GET_LAUNCH_NOTIFICATION_STATS },
        operation: OPERATIONS.ADMIN.GET_REPORTS_STATS,
        userId: ctx.userId,
      });
    }
  });

/**
 * send launch notification emails to all unnotified subscribers (admin only)
 */
export const sendLaunchNotificationsAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.SEND_LAUNCH_NOTIFICATIONS,
    isTransactionRequired: false,
  })
  .action(async ({ ctx }) => {
    try {
      const result = await LaunchNotificationFacade.sendLaunchNotificationsAsync(ctx.db);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          failedCount: result.failedEmails.length,
          sentCount: result.sentCount,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Sent launch notification emails to ${result.sentCount} subscribers`,
      });

      return {
        data: {
          failedCount: result.failedEmails.length,
          failedEmails: result.failedEmails,
          sentCount: result.sentCount,
        },
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        metadata: { actionName: ACTION_NAMES.ADMIN.SEND_LAUNCH_NOTIFICATIONS },
        operation: OPERATIONS.ADMIN.UPDATE_FEATURED_CONTENT,
        userId: ctx.userId,
      });
    }
  });
