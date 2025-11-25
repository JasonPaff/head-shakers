import * as Sentry from '@sentry/nextjs';
import { and, count, desc, eq, sql } from 'drizzle-orm';

import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';
import type {
  CreateNotification,
  SelectNotification,
} from '@/lib/validations/admin-notifications.validation';

import { SENTRY_BREADCRUMB_CATEGORIES, SENTRY_LEVELS } from '@/lib/constants';
import { notifications } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export type NotificationRecord = SelectNotification;

/**
 * AdminNotificationQuery handles database operations for admin notifications
 * Provides methods for fetching, updating, and managing notification read status
 */
export class AdminNotificationQuery extends BaseQuery {
  /**
   * Create a new notification
   *
   * @param data - Notification data including userId, type, title, message
   * @param context - Query context with database instance
   * @returns Created notification record or null if creation fails
   */
  static async createNotificationAsync(
    data: CreateNotification,
    context: QueryContext,
  ): Promise<NotificationRecord | null> {
    const dbInstance = this.getDbInstance(context);

    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.DATABASE,
      data: {
        type: data.type,
        userId: data.userId,
      },
      level: SENTRY_LEVELS.INFO,
      message: 'Creating notification',
    });

    const result = await dbInstance.insert(notifications).values(data).returning();

    return result?.[0] || null;
  }

  /**
   * Delete a notification (soft delete would be used if isDeleted field exists)
   * Currently performs hard delete as notifications table doesn't have soft delete
   *
   * @param notificationId - Notification ID to delete
   * @param context - Query context with database instance
   * @returns Deleted notification record or null if not found
   */
  static async deleteNotificationAsync(
    notificationId: string,
    context: QueryContext,
  ): Promise<NotificationRecord | null> {
    const dbInstance = this.getDbInstance(context);

    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.DATABASE,
      data: {
        notificationId,
      },
      level: SENTRY_LEVELS.INFO,
      message: 'Deleting notification',
    });

    const result = await dbInstance
      .delete(notifications)
      .where(eq(notifications.id, notificationId))
      .returning();

    return result?.[0] || null;
  }

  /**
   * Get a single notification by ID
   *
   * @param notificationId - Notification ID to fetch
   * @param context - Query context with database instance
   * @returns Notification record or null if not found
   */
  static async getNotificationByIdAsync(
    notificationId: string,
    context: QueryContext,
  ): Promise<NotificationRecord | null> {
    const dbInstance = this.getDbInstance(context);

    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.DATABASE,
      data: {
        notificationId,
      },
      level: SENTRY_LEVELS.INFO,
      message: 'Fetching notification by ID',
    });

    const result = await dbInstance
      .select()
      .from(notifications)
      .where(eq(notifications.id, notificationId))
      .limit(1);

    return result?.[0] || null;
  }

  /**
   * Get notifications by type for a user
   * Uses composite index: notifications_user_type_idx
   *
   * @param userId - User ID to fetch notifications for
   * @param notificationType - Type of notification to filter by
   * @param options - Pagination options
   * @param context - Query context with database instance
   * @returns Array of notifications matching the type
   */
  static async getNotificationsByTypeAsync(
    userId: string,
    notificationType: SelectNotification['type'],
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<NotificationRecord>> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.DATABASE,
      data: {
        limit: pagination.limit,
        notificationType,
        offset: pagination.offset,
        userId,
      },
      level: SENTRY_LEVELS.INFO,
      message: 'Fetching notifications by type',
    });

    const query = dbInstance
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.type, notificationType)))
      .orderBy(desc(notifications.createdAt));

    if (pagination.limit) {
      query.limit(pagination.limit);
    }

    if (pagination.offset) {
      query.offset(pagination.offset);
    }

    return query;
  }

  /**
   * Get all notifications for a specific user (read and unread)
   * Ordered by creation date (newest first)
   * Uses index: notifications_user_created_desc_idx
   *
   * @param userId - User ID to fetch notifications for
   * @param options - Pagination options
   * @param context - Query context with database instance
   * @returns Array of all notifications
   */
  static async getNotificationsByUserIdAsync(
    userId: string,
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<NotificationRecord>> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.DATABASE,
      data: {
        limit: pagination.limit,
        offset: pagination.offset,
        userId,
      },
      level: SENTRY_LEVELS.INFO,
      message: 'Fetching all user notifications',
    });

    const query = dbInstance
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));

    if (pagination.limit) {
      query.limit(pagination.limit);
    }

    if (pagination.offset) {
      query.offset(pagination.offset);
    }

    return query;
  }

  /**
   * Get count of unread notifications for a user
   * Uses composite index: notifications_user_unread_idx
   *
   * @param userId - User ID to count notifications for
   * @param context - Query context with database instance
   * @returns Count of unread notifications
   */
  static async getUnreadCountAsync(userId: string, context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.DATABASE,
      data: {
        userId,
      },
      level: SENTRY_LEVELS.INFO,
      message: 'Counting unread notifications',
    });

    const result = await dbInstance
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

    return result[0]?.count || 0;
  }

  /**
   * Get unread notifications for a specific user
   * Ordered by creation date (newest first)
   * Uses composite index: notifications_user_unread_created_idx
   *
   * @param userId - User ID to fetch notifications for
   * @param options - Pagination options
   * @param context - Query context with database instance
   * @returns Array of unread notifications
   */
  static async getUnreadNotificationsAsync(
    userId: string,
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<NotificationRecord>> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.DATABASE,
      data: {
        limit: pagination.limit,
        offset: pagination.offset,
        userId,
      },
      level: SENTRY_LEVELS.INFO,
      message: 'Fetching unread notifications',
    });

    const query = dbInstance
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
      .orderBy(desc(notifications.createdAt));

    if (pagination.limit) {
      query.limit(pagination.limit);
    }

    if (pagination.offset) {
      query.offset(pagination.offset);
    }

    return query;
  }

  /**
   * Mark all notifications as read for a specific user
   * Updates all unread notifications for the user
   *
   * @param userId - User ID to mark all notifications as read
   * @param context - Query context with database instance
   * @returns Count of notifications marked as read
   */
  static async markAllAsReadAsync(userId: string, context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.DATABASE,
      data: {
        userId,
      },
      level: SENTRY_LEVELS.INFO,
      message: 'Marking all notifications as read',
    });

    const result = await dbInstance
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
      .returning();

    return result.length;
  }

  /**
   * Mark multiple notifications as read
   * Updates isRead to true and sets readAt timestamp for all provided IDs
   *
   * @param notificationIds - Array of notification IDs to mark as read
   * @param context - Query context with database instance
   * @returns Array of updated notification records
   */
  static async markMultipleNotificationsAsReadAsync(
    notificationIds: Array<string>,
    context: QueryContext,
  ): Promise<Array<NotificationRecord>> {
    const dbInstance = this.getDbInstance(context);

    if (notificationIds.length === 0) {
      return [];
    }

    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.DATABASE,
      data: {
        count: notificationIds.length,
      },
      level: SENTRY_LEVELS.INFO,
      message: 'Marking multiple notifications as read',
    });

    const result = await dbInstance
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        sql`${notifications.id} IN (${sql.join(
          notificationIds.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      )
      .returning();

    return result;
  }

  /**
   * Mark a notification as read
   * Updates isRead to true and sets readAt timestamp
   *
   * @param notificationId - Notification ID to mark as read
   * @param context - Query context with database instance
   * @returns Updated notification record or null if not found
   */
  static async markNotificationAsReadAsync(
    notificationId: string,
    context: QueryContext,
  ): Promise<NotificationRecord | null> {
    const dbInstance = this.getDbInstance(context);

    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.DATABASE,
      data: {
        notificationId,
      },
      level: SENTRY_LEVELS.INFO,
      message: 'Marking notification as read',
    });

    const result = await dbInstance
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(notifications.id, notificationId))
      .returning();

    return result?.[0] || null;
  }
}
