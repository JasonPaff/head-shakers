import { boolean, index, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { users } from '@/db/schema/users';

export const notifications = pgTable(
  'notifications',
  {
    actionUrl: text('action_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    isEmailSent: boolean('is_email_sent').default(false),
    isRead: boolean('is_read').default(false),
    message: text('message'),
    readAt: timestamp('read_at'),
    relatedId: uuid('related_id'),
    relatedType: varchar('related_type', { length: 20 }), // bobblehead, collection, comment
    relatedUserId: uuid('related_user_id').references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // comment, like, follow, mention, system
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    index('notifications_created_at_idx').on(table.createdAt),
    index('notifications_is_read_idx').on(table.isRead),
    index('notifications_type_idx').on(table.type),
    index('notifications_user_id_idx').on(table.userId),
  ],
);

export const featuredContent = pgTable(
  'featured_content',
  {
    contentId: uuid('content_id').notNull(),
    contentType: varchar('content_type', { length: 20 }).notNull(), // bobblehead, collection, user
    createdAt: timestamp('created_at').defaultNow().notNull(),
    curatorId: uuid('curator_id').references(() => users.id, { onDelete: 'set null' }),
    description: text('description'),
    endDate: timestamp('end_date'),
    featureType: varchar('feature_type', { length: 50 }).notNull(), // homepage_banner, collection_of_week, trending
    id: uuid('id').primaryKey().defaultRandom(),
    imageUrl: text('image_url'),
    isActive: boolean('is_active').default(true),
    sortOrder: integer('sort_order').default(0),
    startDate: timestamp('start_date'),
    title: varchar('title', { length: 255 }),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('featured_content_feature_type_idx').on(table.featureType),
    index('featured_content_is_active_idx').on(table.isActive),
    index('featured_content_sort_order_idx').on(table.sortOrder),

    index('featured_content_content_idx').on(table.contentType, table.contentId),
  ],
);

export const platformSettings = pgTable(
  'platform_settings',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: text('description'),
    id: uuid('id').primaryKey().defaultRandom(),
    isPublic: boolean('is_public').default(false),
    key: varchar('key', { length: 100 }).notNull().unique(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    value: text('value'),
    valueType: varchar('value_type', { length: 20 }).default('string').notNull(), // string, number, boolean, JSON
  },
  (table) => [index('platform_settings_key_idx').on(table.key)],
);
