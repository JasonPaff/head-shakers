/* eslint-disable no-secrets/no-secrets */
import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { DEFAULTS, ENUMS, SCHEMA_LIMITS } from '@/lib/constants';
import { users } from '@/lib/db/schema/users.schema';

export const notificationTypeEnum = pgEnum('notification_type', ENUMS.NOTIFICATION.TYPE);
export const notificationRelatedTypeEnum = pgEnum(
  'notification_related_type',
  ENUMS.NOTIFICATION.RELATED_TYPE,
);
export const featuredContentTypeEnum = pgEnum('featured_content_type', ENUMS.FEATURED_CONTENT.TYPE);
export const featureTypeEnum = pgEnum('feature_type', ENUMS.FEATURED_CONTENT.FEATURE_TYPE);
export const valueTypeEnum = pgEnum('value_type', ENUMS.PLATFORM_SETTING.VALUE_TYPE);
export const contentMetricTypeEnum = pgEnum('content_metric_type', ENUMS.CONTENT_METRIC.TYPE);

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
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    // single column indexes
    index('notifications_user_id_idx').on(table.userId),
    index('notifications_type_idx').on(table.type),
    index('notifications_is_read_idx').on(table.isRead),
    index('notifications_created_at_idx').on(table.createdAt),
    index('notifications_related_user_id_idx').on(table.relatedUserId),

    // composite indexes for common query patterns
    index('notifications_user_unread_idx').on(table.userId, table.isRead),
    index('notifications_user_type_idx').on(table.userId, table.type),
    index('notifications_related_content_idx').on(table.relatedType, table.relatedId),

    // performance indexes
    index('notifications_user_unread_created_idx').on(
      table.userId,
      table.isRead,
      sql`${table.createdAt} DESC`,
    ),
    index('notifications_user_created_desc_idx').on(table.userId, sql`${table.createdAt} DESC`),
    index('notifications_unread_created_desc_idx').on(table.isRead, sql`${table.createdAt} DESC`),

    // check constraints
    check('notifications_title_not_empty', sql`length(${table.title}) > 0`),
    check(
      'notifications_title_length',
      sql`length(${table.title}) <= ${SCHEMA_LIMITS.NOTIFICATION.TITLE.MAX}`,
    ),
    check(
      'notifications_read_at_logic',
      sql`(${table.isRead} = false AND ${table.readAt} IS NULL) OR (${table.isRead} = true AND ${table.readAt} IS NOT NULL)`,
    ),
  ],
);

export const featuredContent = pgTable(
  'featured_content',
  {
    contentId: uuid('content_id').notNull(),
    contentType: featuredContentTypeEnum('featured_content_type').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    curatorId: uuid('curator_id').references(() => users.id, { onDelete: 'set null' }),
    curatorNotes: varchar('curator_notes', { length: SCHEMA_LIMITS.FEATURED_CONTENT.CURATOR_NOTES.MAX }),
    description: varchar('description', { length: SCHEMA_LIMITS.FEATURED_CONTENT.DESCRIPTION.MAX }).notNull(),
    endDate: timestamp('end_date'),
    featureType: featureTypeEnum('feature_type').notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    imageUrl: text('image_url'),
    isActive: boolean('is_active').default(DEFAULTS.FEATURED_CONTENT.IS_ACTIVE).notNull(),
    priority: integer('priority').default(DEFAULTS.SYSTEM.CONTENT_METRIC_PRIORITY).notNull(),
    sortOrder: integer('sort_order').default(DEFAULTS.FEATURED_CONTENT.SORT_ORDER).notNull(),
    startDate: timestamp('start_date'),
    title: varchar('title', { length: SCHEMA_LIMITS.FEATURED_CONTENT.TITLE.MAX }),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    viewCount: integer('view_count').default(DEFAULTS.SYSTEM.CONTENT_METRIC_VIEW_COUNT).notNull(),
  },
  (table) => [
    // single column indexes
    index('featured_content_feature_type_idx').on(table.featureType),
    index('featured_content_is_active_idx').on(table.isActive),
    index('featured_content_sort_order_idx').on(table.sortOrder),
    index('featured_content_priority_idx').on(table.priority),
    index('featured_content_curator_id_idx').on(table.curatorId),
    index('featured_content_start_date_idx').on(table.startDate),
    index('featured_content_end_date_idx').on(table.endDate),
    index('featured_content_view_count_idx').on(table.viewCount),

    // composite indexes for common query patterns
    index('featured_content_content_idx').on(table.contentType, table.contentId),
    index('featured_content_active_feature_idx').on(table.isActive, table.featureType),
    index('featured_content_active_priority_idx').on(table.isActive, table.priority),
    index('featured_content_active_sort_idx').on(table.isActive, table.sortOrder),
    index('featured_content_feature_dates_idx').on(table.featureType, table.startDate, table.endDate),
    index('featured_content_active_dates_idx').on(table.isActive, table.startDate, table.endDate),

    // check constraints
    check(
      'featured_content_title_length',
      sql`${table.title} IS NULL OR length(${table.title}) <= ${SCHEMA_LIMITS.FEATURED_CONTENT.TITLE.MAX}`,
    ),
    check('featured_content_sort_order_non_negative', sql`${table.sortOrder} >= 0`),
    check('featured_content_priority_non_negative', sql`${table.priority} >= 0`),
    check('featured_content_view_count_non_negative', sql`${table.viewCount} >= 0`),
    check(
      'featured_content_date_logic',
      sql`${table.startDate} IS NULL OR ${table.endDate} IS NULL OR ${table.startDate} <= ${table.endDate}`,
    ),
    check('featured_content_description_not_empty', sql`length(${table.description}) > 0`),
  ],
);

export const platformSettings = pgTable(
  'platform_settings',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: text('description'),
    id: uuid('id').primaryKey().defaultRandom(),
    isPublic: boolean('is_public').default(DEFAULTS.PLATFORM_SETTING.IS_PUBLIC).notNull(),
    key: varchar('key', { length: SCHEMA_LIMITS.PLATFORM_SETTING.KEY.MAX }).notNull().unique(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    value: text('value'),
    valueType: valueTypeEnum('value_type').default(DEFAULTS.PLATFORM_SETTING.VALUE_TYPE).notNull(),
  },
  (table) => [
    // single column indexes
    index('platform_settings_key_idx').on(table.key),
    index('platform_settings_is_public_idx').on(table.isPublic),
    index('platform_settings_value_type_idx').on(table.valueType),
    index('platform_settings_updated_by_idx').on(table.updatedBy),

    // composite indexes for common query patterns
    index('platform_settings_public_key_idx').on(table.isPublic, table.key),

    // check constraints
    check('platform_settings_key_not_empty', sql`length(${table.key}) > 0`),
    check(
      'platform_settings_key_length',
      sql`length(${table.key}) <= ${SCHEMA_LIMITS.PLATFORM_SETTING.KEY.MAX}`,
    ),
  ],
);

export const contentMetrics = pgTable(
  'content_metrics',
  {
    contentId: uuid('content_id').notNull(),
    contentType: featuredContentTypeEnum('content_type').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    date: timestamp('date').notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    metadata: jsonb('metadata'),
    metricType: contentMetricTypeEnum('metric_type').notNull(),
    metricValue: integer('metric_value').default(0).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // single column indexes
    index('content_metrics_content_type_idx').on(table.contentType),
    index('content_metrics_content_id_idx').on(table.contentId),
    index('content_metrics_metric_type_idx').on(table.metricType),
    index('content_metrics_date_idx').on(table.date),
    index('content_metrics_created_at_idx').on(table.createdAt),

    // composite indexes for common query patterns
    index('content_metrics_content_idx').on(table.contentType, table.contentId),
    index('content_metrics_content_date_idx').on(table.contentType, table.contentId, table.date),
    index('content_metrics_type_date_idx').on(table.metricType, table.date),
    index('content_metrics_content_metric_idx').on(table.contentType, table.contentId, table.metricType),

    // check constraints
    check('content_metrics_value_non_negative', sql`${table.metricValue} >= 0`),
  ],
);
