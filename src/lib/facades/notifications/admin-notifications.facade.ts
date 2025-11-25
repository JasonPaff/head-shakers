import * as Sentry from '@sentry/nextjs';

import type { FindOptions } from '@/lib/queries/base/query-context';
import type { NotificationRecord } from '@/lib/queries/notifications/admin-notifications.query';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type {
  CreateNotification,
  SelectNotification,
} from '@/lib/validations/admin-notifications.validation';

import { OPERATIONS, SENTRY_BREADCRUMB_CATEGORIES, SENTRY_LEVELS } from '@/lib/constants';
import { db } from '@/lib/db';
import {
  createProtectedQueryContext,
  createPublicQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';
import { AdminNotificationQuery } from '@/lib/queries/notifications/admin-notifications.query';
import { createFacadeError } from '@/lib/utils/error-builders';

const facadeName = 'AdminNotificationFacade';

/**
 * Unified Admin Notification Facade
 * Provides a clean API for all notification operations with proper error handling
 * and business logic orchestration
 */
export class AdminNotificationFacade {
  /**
   * Create a new notification for a user
   * Uses transaction for data consistency
   *
   * @param data - Notification data including userId, type, title, message
   * @param dbInstance - Optional database executor for transactions
   * @returns Created notification record or null if creation fails
   */
  static async createNotificationAsync(
    data: CreateNotification,
    dbInstance?: DatabaseExecutor,
  ): Promise<NotificationRecord | null> {
    try {
      return await (dbInstance ?? db).transaction(async (tx) => {
        const context = createProtectedQueryContext(data.userId, { dbInstance: tx });

        // Create the notification
        const notification = await AdminNotificationQuery.createNotificationAsync(data, context);

        if (notification) {
          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
            data: {
              notificationId: notification.id,
              notificationType: notification.type,
              userId: data.userId,
            },
            level: SENTRY_LEVELS.INFO,
            message: `Created notification for user ${data.userId}`,
          });
        }

        return notification;
      });
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { type: data.type, userId: data.userId },
        facade: facadeName,
        method: 'createNotificationAsync',
        operation: OPERATIONS.NOTIFICATIONS.CREATE,
        userId: data.userId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Delete a notification
   * Currently performs hard delete as notifications table doesn't have soft delete
   *
   * @param notificationId - Notification ID to delete
   * @param dbInstance - Optional database executor
   * @returns Deleted notification record or null if not found
   */
  static async deleteNotificationAsync(
    notificationId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<NotificationRecord | null> {
    try {
      const context = createPublicQueryContext({ dbInstance });
      const notification = await AdminNotificationQuery.deleteNotificationAsync(notificationId, context);

      if (notification) {
        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            notificationId,
            userId: notification.userId,
          },
          level: SENTRY_LEVELS.INFO,
          message: `Deleted notification ${notificationId}`,
        });
      }

      return notification;
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { notificationId },
        facade: facadeName,
        method: 'deleteNotificationAsync',
        operation: OPERATIONS.NOTIFICATIONS.DELETE,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Get a single notification by ID
   *
   * @param notificationId - Notification ID to fetch
   * @param dbInstance - Optional database executor
   * @returns Notification record or null if not found
   */
  static async getNotificationByIdAsync(
    notificationId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<NotificationRecord | null> {
    try {
      const context = createPublicQueryContext({ dbInstance });
      return AdminNotificationQuery.getNotificationByIdAsync(notificationId, context);
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { notificationId },
        facade: facadeName,
        method: 'getNotificationByIdAsync',
        operation: OPERATIONS.NOTIFICATIONS.GET_BY_ID,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Get notifications by type for a user with pagination
   *
   * @param userId - User ID to fetch notifications for
   * @param notificationType - Type of notification to filter by
   * @param options - Pagination options (limit, offset)
   * @param dbInstance - Optional database executor
   * @returns Array of notification records matching the type
   */
  static async getNotificationsByTypeAsync(
    userId: string,
    notificationType: SelectNotification['type'],
    options: FindOptions = {},
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<NotificationRecord>> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      return AdminNotificationQuery.getNotificationsByTypeAsync(userId, notificationType, options, context);
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { limit: options.limit, notificationType, offset: options.offset, userId },
        facade: facadeName,
        method: 'getNotificationsByTypeAsync',
        operation: OPERATIONS.NOTIFICATIONS.GET_BY_TYPE,
        userId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Get all notifications for a user with pagination
   *
   * @param userId - User ID to fetch notifications for
   * @param options - Pagination options (limit, offset)
   * @param dbInstance - Optional database executor
   * @returns Array of all notification records
   */
  static async getNotificationsByUserIdAsync(
    userId: string,
    options: FindOptions = {},
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<NotificationRecord>> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      return AdminNotificationQuery.getNotificationsByUserIdAsync(userId, options, context);
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { limit: options.limit, offset: options.offset, userId },
        facade: facadeName,
        method: 'getNotificationsByUserIdAsync',
        operation: OPERATIONS.NOTIFICATIONS.GET_BY_USER,
        userId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Get count of unread notifications for a user
   * Useful for notification badges
   *
   * @param userId - User ID to count notifications for
   * @param dbInstance - Optional database executor
   * @returns Count of unread notifications
   */
  static async getUnreadCountAsync(userId: string, dbInstance?: DatabaseExecutor): Promise<number> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      return AdminNotificationQuery.getUnreadCountAsync(userId, context);
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { userId },
        facade: facadeName,
        method: 'getUnreadCountAsync',
        operation: OPERATIONS.NOTIFICATIONS.GET_UNREAD_COUNT,
        userId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Get unread notifications for a user with pagination
   *
   * @param userId - User ID to fetch notifications for
   * @param options - Pagination options (limit, offset)
   * @param dbInstance - Optional database executor
   * @returns Array of unread notification records
   */
  static async getUnreadNotificationsAsync(
    userId: string,
    options: FindOptions = {},
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<NotificationRecord>> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      return AdminNotificationQuery.getUnreadNotificationsAsync(userId, options, context);
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { limit: options.limit, offset: options.offset, userId },
        facade: facadeName,
        method: 'getUnreadNotificationsAsync',
        operation: OPERATIONS.NOTIFICATIONS.GET_UNREAD,
        userId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Mark all unread notifications as read for a user
   *
   * @param userId - User ID to mark all notifications as read
   * @param dbInstance - Optional database executor
   * @returns Count of notifications marked as read
   */
  static async markAllAsReadAsync(userId: string, dbInstance?: DatabaseExecutor): Promise<number> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      const count = await AdminNotificationQuery.markAllAsReadAsync(userId, context);

      if (count > 0) {
        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            count,
            userId,
          },
          level: SENTRY_LEVELS.INFO,
          message: `Marked all ${count} notifications as read for user ${userId}`,
        });
      }

      return count;
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { userId },
        facade: facadeName,
        method: 'markAllAsReadAsync',
        operation: OPERATIONS.NOTIFICATIONS.MARK_ALL_AS_READ,
        userId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Mark a single notification as read
   * Updates isRead and sets readAt timestamp
   *
   * @param notificationId - Notification ID to mark as read
   * @param dbInstance - Optional database executor
   * @returns Updated notification record or null if not found
   */
  static async markAsReadAsync(
    notificationId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<NotificationRecord | null> {
    try {
      const context = createPublicQueryContext({ dbInstance });
      const notification = await AdminNotificationQuery.markNotificationAsReadAsync(notificationId, context);

      if (notification) {
        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            notificationId,
            userId: notification.userId,
          },
          level: SENTRY_LEVELS.INFO,
          message: `Marked notification ${notificationId} as read`,
        });
      }

      return notification;
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { notificationId },
        facade: facadeName,
        method: 'markAsReadAsync',
        operation: OPERATIONS.NOTIFICATIONS.MARK_AS_READ,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Mark multiple notifications as read in a single operation
   *
   * @param notificationIds - Array of notification IDs to mark as read
   * @param dbInstance - Optional database executor
   * @returns Array of updated notification records
   */
  static async markMultipleAsReadAsync(
    notificationIds: Array<string>,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<NotificationRecord>> {
    try {
      if (notificationIds.length === 0) {
        return [];
      }

      const context = createPublicQueryContext({ dbInstance });
      const notifications = await AdminNotificationQuery.markMultipleNotificationsAsReadAsync(
        notificationIds,
        context,
      );

      if (notifications.length > 0) {
        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            count: notifications.length,
            notificationIds,
          },
          level: SENTRY_LEVELS.INFO,
          message: `Marked ${notifications.length} notifications as read`,
        });
      }

      return notifications;
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { count: notificationIds.length },
        facade: facadeName,
        method: 'markMultipleAsReadAsync',
        operation: OPERATIONS.NOTIFICATIONS.MARK_MULTIPLE_AS_READ,
      };
      throw createFacadeError(errorContext, error);
    }
  }
}
