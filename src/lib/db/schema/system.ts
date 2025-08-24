import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { users } from '@/lib/db/schema/users';

export const notificationTypeEnum = pgEnum('notification_type', [
  'comment',
  'like',
  'follow',
  'mention',
  'system',
]);
export const notificationRelatedTypeEnum = pgEnum('notification_related_type', ['bobblehead', 'collection', 'comment', 'user']);
export const featuredContentTypeEnum = pgEnum('featured_content_type', ['bobblehead', 'collection', 'user']);
export const featureTypeEnum = pgEnum('feature_type', [
  'homepage_banner',
  'collection_of_week',
  'trending',
  'editor_pick',
]);

export const valueTypeEnum = pgEnum('value_type', ['string', 'number', 'boolean', 'json']);

export const NOTIFICATION_DEFAULTS = {
  IS_EMAIL_SENT: false,
  IS_READ: false,
} as const;

export const FEATURED_CONTENT_DEFAULTS = {
  IS_ACTIVE: true,
  SORT_ORDER: 0,
} as const;

export const PLATFORM_SETTINGS_DEFAULTS = {
  IS_PUBLIC: false,
  VALUE_TYPE: 'string',
} as const;

export const notifications = pgTable(
  'notifications',
  {
    actionUrl: text('action_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    isEmailSent: boolean('is_email_sent').default(NOTIFICATION_DEFAULTS.IS_EMAIL_SENT).notNull(),
    isRead: boolean('is_read').default(NOTIFICATION_DEFAULTS.IS_READ).notNull(),
    message: text('message'),
    readAt: timestamp('read_at'),
    relatedId: uuid('related_id'),
    relatedType: notificationRelatedTypeEnum('notification_related_type'),
    relatedUserId: uuid('related_user_id').references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
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

    // check constraints
    check('notifications_title_not_empty', sql`length(${table.title}) > 0`),
    check('notifications_title_length', sql`length(${table.title}) <= 255`),
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
    description: text('description'),
    endDate: timestamp('end_date'),
    featureType: featureTypeEnum('feature_type').notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    imageUrl: text('image_url'),
    isActive: boolean('is_active').default(FEATURED_CONTENT_DEFAULTS.IS_ACTIVE).notNull(),
    sortOrder: integer('sort_order').default(FEATURED_CONTENT_DEFAULTS.SORT_ORDER).notNull(),
    startDate: timestamp('start_date'),
    title: varchar('title', { length: 255 }),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // single column indexes
    index('featured_content_feature_type_idx').on(table.featureType),
    index('featured_content_is_active_idx').on(table.isActive),
    index('featured_content_sort_order_idx').on(table.sortOrder),
    index('featured_content_curator_id_idx').on(table.curatorId),
    index('featured_content_start_date_idx').on(table.startDate),
    index('featured_content_end_date_idx').on(table.endDate),

    // composite indexes for common query patterns
    index('featured_content_content_idx').on(table.contentType, table.contentId),
    index('featured_content_active_feature_idx').on(table.isActive, table.featureType),
    index('featured_content_active_sort_idx').on(table.isActive, table.sortOrder),
    index('featured_content_feature_dates_idx').on(table.featureType, table.startDate, table.endDate),

    // check constraints
    check('featured_content_title_length', sql`${table.title} IS NULL OR length(${table.title}) <= 255`),
    check('featured_content_sort_order_non_negative', sql`${table.sortOrder} >= 0`),
    check(
      'featured_content_date_logic',
      sql`${table.startDate} IS NULL OR ${table.endDate} IS NULL OR ${table.startDate} <= ${table.endDate}`,
    ),
  ],
);

export const platformSettings = pgTable(
  'platform_settings',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: text('description'),
    id: uuid('id').primaryKey().defaultRandom(),
    isPublic: boolean('is_public').default(PLATFORM_SETTINGS_DEFAULTS.IS_PUBLIC).notNull(),
    key: varchar('key', { length: 100 }).notNull().unique(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    value: text('value'),
    valueType: valueTypeEnum('value_type').default(PLATFORM_SETTINGS_DEFAULTS.VALUE_TYPE).notNull(),
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
    check('platform_settings_key_length', sql`length(${table.key}) <= 100`),
  ],
);

export const selectNotificationSchema = createSelectSchema(notifications);
export const insertNotificationSchema = createInsertSchema(notifications, {
  actionUrl: z.url().optional(),
  message: z.string().optional(),
  title: z.string().min(1).max(255),
}).omit({
  createdAt: true,
  id: true,
  readAt: true,
});

export const updateNotificationSchema = insertNotificationSchema.partial().extend({
  isRead: z.boolean().optional(),
  readAt: z.date().optional(),
});

export const selectFeaturedContentSchema = createSelectSchema(featuredContent);
export const insertFeaturedContentSchema = createInsertSchema(featuredContent, {
  description: z.string().optional(),
  endDate: z.date().optional(),
  imageUrl: z.url().optional(),
  sortOrder: z.number().min(0).default(FEATURED_CONTENT_DEFAULTS.SORT_ORDER),
  startDate: z.date().optional(),
  title: z.string().min(1).max(255).optional(),
}).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
});

export const updateFeaturedContentSchema = insertFeaturedContentSchema.partial();

export const selectPlatformSettingSchema = createSelectSchema(platformSettings);
export const insertPlatformSettingSchema = createInsertSchema(platformSettings, {
  description: z.string().optional(),
  key: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_.-]+$/),
  value: z.string().optional(),
}).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
  updatedBy: true,
});

export const updatePlatformSettingSchema = insertPlatformSettingSchema.partial().omit({
  key: true,
});

export const publicNotificationSchema = selectNotificationSchema.omit({
  isEmailSent: true,
  relatedUserId: true,
});

export const publicFeaturedContentSchema = selectFeaturedContentSchema.omit({
  curatorId: true,
});

export const publicPlatformSettingSchema = selectPlatformSettingSchema
  .omit({
    createdAt: true,
    updatedAt: true,
    updatedBy: true,
  })
  .extend({
    isPublic: z.literal(true),
  });

export type ContentType = (typeof featuredContentTypeEnum.enumValues)[number];
export type FeatureType = (typeof featureTypeEnum.enumValues)[number];
export type InsertFeaturedContent = z.infer<typeof insertFeaturedContentSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];
export type PublicFeaturedContent = z.infer<typeof publicFeaturedContentSchema>;
export type PublicNotification = z.infer<typeof publicNotificationSchema>;

export type PublicPlatformSetting = z.infer<typeof publicPlatformSettingSchema>;
export type RelatedType = (typeof notificationRelatedTypeEnum.enumValues)[number];
export type SelectFeaturedContent = z.infer<typeof selectFeaturedContentSchema>;
export type SelectNotification = z.infer<typeof selectNotificationSchema>;

export type SelectPlatformSetting = z.infer<typeof selectPlatformSettingSchema>;
export type UpdateFeaturedContent = z.infer<typeof updateFeaturedContentSchema>;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;
export type UpdatePlatformSetting = z.infer<typeof updatePlatformSettingSchema>;
export type ValueType = (typeof valueTypeEnum.enumValues)[number];
