'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

import {
  ACTION_NAMES,
  ERROR_CODES,
  ERROR_MESSAGES,
  OPERATIONS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { AdminNotificationFacade } from '@/lib/facades/notifications/admin-notifications.facade';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { adminActionClient, authActionClient } from '@/lib/utils/next-safe-action';
import {
  createNotificationSchema,
  getNotificationsSchema,
  markMultipleNotificationsAsReadSchema,
  markNotificationAsReadSchema,
} from '@/lib/validations/admin-notifications.validation';

/**
 * Create a new admin notification (admin only)
 * Used to send notifications to users from the admin panel
 */
export const createAdminNotificationAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.NOTIFICATIONS.CREATE,
    isTransactionRequired: true,
  })
  .inputSchema(createNotificationSchema)
  .action(async ({ ctx, parsedInput }) => {
    const data = createNotificationSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;
    const { isAdmin, userId } = ctx;

    Sentry.setContext(SENTRY_CONTEXTS.NOTIFICATION_DATA, {
      isAdmin,
      notificationType: data.type,
      targetUserId: data.userId,
      userId,
    });

    try {
      const notification = await AdminNotificationFacade.createNotificationAsync(data, dbInstance);

      if (!notification) {
        throw new ActionError(
          ErrorType.DATABASE,
          ERROR_CODES.NOTIFICATIONS.CREATE_FAILED,
          ERROR_MESSAGES.NOTIFICATIONS.CREATE_FAILED,
          { ctx, operation: OPERATIONS.NOTIFICATIONS.CREATE },
          true,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          notificationId: notification.id,
          notificationType: notification.type,
          targetUserId: data.userId,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Admin created notification for user ${data.userId}`,
      });

      return {
        data: notification,
        message: 'Notification created successfully',
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.NOTIFICATIONS.CREATE,
          userId,
        },
        operation: OPERATIONS.NOTIFICATIONS.CREATE,
      });
    }
  });

/**
 * Mark a notification as read
 * Includes ownership verification to ensure users can only mark their own notifications
 */
export const markNotificationAsReadAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.NOTIFICATIONS.MARK_AS_READ,
    isTransactionRequired: false,
  })
  .inputSchema(markNotificationAsReadSchema)
  .action(async ({ ctx, parsedInput }) => {
    const data = markNotificationAsReadSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;
    const { userId } = ctx;

    Sentry.setContext(SENTRY_CONTEXTS.NOTIFICATION_DATA, {
      notificationId: data.notificationId,
      userId,
    });

    try {
      // First verify ownership by fetching the notification
      const existingNotification = await AdminNotificationFacade.getNotificationByIdAsync(
        data.notificationId,
        dbInstance,
      );

      if (!existingNotification) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.NOTIFICATIONS.NOT_FOUND,
          ERROR_MESSAGES.NOTIFICATIONS.NOT_FOUND,
          { ctx, operation: OPERATIONS.NOTIFICATIONS.MARK_AS_READ },
          true,
          404,
        );
      }

      // Verify user owns this notification
      if (existingNotification.userId !== userId) {
        throw new ActionError(
          ErrorType.AUTHORIZATION,
          ERROR_CODES.NOTIFICATIONS.UNAUTHORIZED_ACCESS,
          ERROR_MESSAGES.NOTIFICATIONS.UNAUTHORIZED_ACCESS,
          { ctx, operation: OPERATIONS.NOTIFICATIONS.MARK_AS_READ },
          true,
          403,
        );
      }

      const notification = await AdminNotificationFacade.markAsReadAsync(data.notificationId, dbInstance);

      if (!notification) {
        throw new ActionError(
          ErrorType.DATABASE,
          ERROR_CODES.NOTIFICATIONS.MARK_AS_READ_FAILED,
          ERROR_MESSAGES.NOTIFICATIONS.MARK_AS_READ_FAILED,
          { ctx, operation: OPERATIONS.NOTIFICATIONS.MARK_AS_READ },
          true,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          notificationId: data.notificationId,
          userId,
        },
        level: SENTRY_LEVELS.INFO,
        message: `User marked notification ${data.notificationId} as read`,
      });

      return {
        data: notification,
        message: 'Notification marked as read',
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.NOTIFICATIONS.MARK_AS_READ,
          userId,
        },
        operation: OPERATIONS.NOTIFICATIONS.MARK_AS_READ,
      });
    }
  });

/**
 * Mark multiple notifications as read
 * Includes ownership verification for all notifications
 */
export const markMultipleNotificationsAsReadAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.NOTIFICATIONS.MARK_MULTIPLE_AS_READ,
    isTransactionRequired: false,
  })
  .inputSchema(markMultipleNotificationsAsReadSchema)
  .action(async ({ ctx, parsedInput }) => {
    const data = markMultipleNotificationsAsReadSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;
    const { userId } = ctx;

    Sentry.setContext(SENTRY_CONTEXTS.NOTIFICATION_DATA, {
      count: data.notificationIds.length,
      userId,
    });

    try {
      // Verify ownership of all notifications before marking as read
      const verificationPromises = data.notificationIds.map((notificationId) =>
        AdminNotificationFacade.getNotificationByIdAsync(notificationId, dbInstance),
      );
      const existingNotifications = await Promise.all(verificationPromises);

      // Check for any non-existent notifications
      const nonExistentCount = existingNotifications.filter((n) => !n).length;
      if (nonExistentCount > 0) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.NOTIFICATIONS.NOT_FOUND,
          `${nonExistentCount} notification(s) not found`,
          { ctx, operation: OPERATIONS.NOTIFICATIONS.MARK_MULTIPLE_AS_READ },
          true,
          404,
        );
      }

      // Verify all notifications belong to the current user
      const unauthorizedNotifications = existingNotifications.filter(
        (notification) => notification && notification.userId !== userId,
      );

      if (unauthorizedNotifications.length > 0) {
        throw new ActionError(
          ErrorType.AUTHORIZATION,
          ERROR_CODES.NOTIFICATIONS.UNAUTHORIZED_ACCESS,
          ERROR_MESSAGES.NOTIFICATIONS.UNAUTHORIZED_ACCESS,
          { ctx, operation: OPERATIONS.NOTIFICATIONS.MARK_MULTIPLE_AS_READ },
          true,
          403,
        );
      }

      const notifications = await AdminNotificationFacade.markMultipleAsReadAsync(
        data.notificationIds,
        dbInstance,
      );

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          count: notifications.length,
          userId,
        },
        level: SENTRY_LEVELS.INFO,
        message: `User marked ${notifications.length} notifications as read`,
      });

      return {
        data: notifications,
        message: `${notifications.length} notification(s) marked as read`,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.NOTIFICATIONS.MARK_MULTIPLE_AS_READ,
          userId,
        },
        operation: OPERATIONS.NOTIFICATIONS.MARK_MULTIPLE_AS_READ,
      });
    }
  });

/**
 * Mark all unread notifications as read for current user
 */
export const markAllNotificationsAsReadAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.NOTIFICATIONS.MARK_ALL_AS_READ,
    isTransactionRequired: false,
  })
  .inputSchema(z.object({}))
  .action(async ({ ctx }) => {
    const dbInstance = ctx.db;
    const { userId } = ctx;

    Sentry.setContext(SENTRY_CONTEXTS.NOTIFICATION_DATA, {
      userId,
    });

    try {
      const count = await AdminNotificationFacade.markAllAsReadAsync(userId, dbInstance);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          count,
          userId,
        },
        level: SENTRY_LEVELS.INFO,
        message: `User marked all ${count} notifications as read`,
      });

      return {
        data: { count },
        message: count > 0 ? `All notifications marked as read` : 'No unread notifications',
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: {},
        metadata: {
          actionName: ACTION_NAMES.NOTIFICATIONS.MARK_ALL_AS_READ,
          userId,
        },
        operation: OPERATIONS.NOTIFICATIONS.MARK_ALL_AS_READ,
      });
    }
  });

/**
 * Get unread notifications for current user with pagination
 */
export const getUnreadNotificationsAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.NOTIFICATIONS.GET_UNREAD,
    isTransactionRequired: false,
  })
  .inputSchema(getNotificationsSchema)
  .action(async ({ ctx, parsedInput }) => {
    const data = getNotificationsSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;
    const { userId } = ctx;

    // Ensure user can only fetch their own notifications
    if (data.userId !== userId) {
      throw new ActionError(
        ErrorType.AUTHORIZATION,
        ERROR_CODES.NOTIFICATIONS.UNAUTHORIZED_ACCESS,
        ERROR_MESSAGES.NOTIFICATIONS.UNAUTHORIZED_ACCESS,
        { ctx, operation: OPERATIONS.NOTIFICATIONS.GET_UNREAD },
        true,
        403,
      );
    }

    Sentry.setContext(SENTRY_CONTEXTS.NOTIFICATION_DATA, {
      limit: data.limit,
      offset: data.offset,
      userId,
    });

    try {
      const notifications = await AdminNotificationFacade.getUnreadNotificationsAsync(
        userId,
        { limit: data.limit, offset: data.offset },
        dbInstance,
      );

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          count: notifications.length,
          userId,
        },
        level: SENTRY_LEVELS.INFO,
        message: `User retrieved ${notifications.length} unread notifications`,
      });

      return {
        data: notifications,
        message: 'Unread notifications retrieved successfully',
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.NOTIFICATIONS.GET_UNREAD,
          userId,
        },
        operation: OPERATIONS.NOTIFICATIONS.GET_UNREAD,
      });
    }
  });

/**
 * Get unread notification count for badge display
 */
export const getUnreadNotificationCountAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.NOTIFICATIONS.GET_UNREAD_COUNT,
    isTransactionRequired: false,
  })
  .inputSchema(z.object({}))
  .action(async ({ ctx }) => {
    const dbInstance = ctx.db;
    const { userId } = ctx;

    Sentry.setContext(SENTRY_CONTEXTS.NOTIFICATION_DATA, {
      userId,
    });

    try {
      const count = await AdminNotificationFacade.getUnreadCountAsync(userId, dbInstance);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          count,
          userId,
        },
        level: SENTRY_LEVELS.INFO,
        message: `User has ${count} unread notifications`,
      });

      return {
        data: { count },
        message: 'Unread count retrieved successfully',
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: {},
        metadata: {
          actionName: ACTION_NAMES.NOTIFICATIONS.GET_UNREAD_COUNT,
          userId,
        },
        operation: OPERATIONS.NOTIFICATIONS.GET_UNREAD_COUNT,
      });
    }
  });
