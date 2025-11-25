import { sql } from 'drizzle-orm';
import { boolean, check, index, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { DEFAULTS, ENUMS, SCHEMA_LIMITS } from '@/lib/constants';
import { users } from '@/lib/db/schema/users.schema';

/**
 * Notification type enum for categorizing notifications
 */
export const notificationTypeEnum = pgEnum('notification_type', ENUMS.NOTIFICATION.TYPE);

/**
 * Related type enum for linking notifications to specific content
 */
export const notificationRelatedTypeEnum = pgEnum(
  'notification_related_type',
  ENUMS.NOTIFICATION.RELATED_TYPE,
);

/**
 * Notifications table for storing user and admin notifications.
 *
 * Design decisions:
 * - Uses UUID primary key (project convention)
 * - Supports multiple notification types (comment, like, follow, mention, system)
 * - Links to related content via relatedType and relatedId
 * - Tracks read status with isRead boolean and readAt timestamp
 * - Includes optional action URL for clickable notifications
 * - Standard audit timestamps (createdAt, updatedAt)
 * - Cascade deletes when user or related user is deleted
 */
export const notifications = pgTable(
  'notifications',
  {
    actionUrl: text('action_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    isEmailSent: boolean('is_email_sent').default(DEFAULTS.NOTIFICATION.IS_EMAIL_SENT).notNull(),
    isRead: boolean('is_read').default(DEFAULTS.NOTIFICATION.IS_READ).notNull(),
    message: text('message'),
    readAt: timestamp('read_at'),
    relatedId: uuid('related_id'),
    relatedType: notificationRelatedTypeEnum('notification_related_type'),
    relatedUserId: uuid('related_user_id').references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: SCHEMA_LIMITS.NOTIFICATION.TITLE.MAX }).notNull(),
    type: notificationTypeEnum('type').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    // Data validation constraints
    check('notifications_title_not_empty', sql`length(${table.title}) > 0`),
    check(
      'notifications_title_length',
      sql`length(${table.title}) <= ${SCHEMA_LIMITS.NOTIFICATION.TITLE.MAX}`,
    ),
    check(
      'notifications_read_at_logic',
      sql`(${table.isRead} = false AND ${table.readAt} IS NULL) OR (${table.isRead} = true AND ${table.readAt} IS NOT NULL)`,
    ),
    check('notifications_dates_logic', sql`${table.createdAt} <= ${table.updatedAt}`),

    // Single column indexes for common filter operations
    index('notifications_user_id_idx').on(table.userId),
    index('notifications_type_idx').on(table.type),
    index('notifications_is_read_idx').on(table.isRead),
    index('notifications_created_at_idx').on(table.createdAt),
    index('notifications_related_user_id_idx').on(table.relatedUserId),

    // Composite indexes for common query patterns
    index('notifications_user_unread_idx').on(table.userId, table.isRead),
    index('notifications_user_type_idx').on(table.userId, table.type),
    index('notifications_related_content_idx').on(table.relatedType, table.relatedId),

    // Performance indexes with descending order for sorting
    index('notifications_user_unread_created_idx').on(
      table.userId,
      table.isRead,
      sql`${table.createdAt} DESC`,
    ),
    index('notifications_user_created_desc_idx').on(table.userId, sql`${table.createdAt} DESC`),
    index('notifications_unread_created_desc_idx').on(table.isRead, sql`${table.createdAt} DESC`),
  ],
);
