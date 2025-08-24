import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  decimal,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { users } from '@/db/schema/users';

export const collections = pgTable(
  'collections',
  {
    coverImageUrl: text('cover_image_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: text('description'),
    id: uuid('id').primaryKey().defaultRandom(),
    isPublic: boolean('is_public').default(true).notNull(),
    lastItemAddedAt: timestamp('last_item_added_at'),
    name: varchar('name', { length: 100 }).notNull(),
    totalItems: integer('total_items').default(0).notNull(),
    totalValue: decimal('total_value', { precision: 15, scale: 2 }).default('0.00'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    // single column indexes
    index('collections_is_public_idx').on(table.isPublic),
    index('collections_user_id_idx').on(table.userId),

    // composite indexes
    index('collections_last_item_added_at_idx').on(table.lastItemAddedAt),
    index('collections_public_updated_idx').on(table.isPublic, table.updatedAt),
    index('collections_user_public_idx').on(table.userId, table.isPublic),

    // constraints
    check('collections_name_length', sql`length(${table.name}) <= 100`),
    check('collections_name_not_empty', sql`length(${table.name}) > 0`),
    check('collections_total_items_non_negative', sql`${table.totalItems} >= 0`),
    check('collections_total_value_non_negative', sql`${table.totalValue} >= 0`),
  ],
);

export const subCollections = pgTable(
  'sub_collections',
  {
    collectionId: uuid('collection_id')
      .references(() => collections.id, { onDelete: 'cascade' })
      .notNull(),
    coverImageUrl: text('cover_image_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: text('description'),
    id: uuid('id').primaryKey().defaultRandom(),
    isPublic: boolean('is_public').default(true).notNull(),
    itemCount: integer('item_count').default(0).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // single column indexes
    index('sub_collections_collection_id_idx').on(table.collectionId),
    index('sub_collections_sort_order_idx').on(table.sortOrder),

    // composite indexes
    index('sub_collections_collection_public_idx').on(table.collectionId, table.isPublic),
    index('sub_collections_collection_sort_idx').on(table.collectionId, table.sortOrder),

    // constraints
    check('sub_collections_item_count_non_negative', sql`${table.itemCount} >= 0`),
    check('sub_collections_name_length', sql`length(${table.name}) <= 100`),
    check('sub_collections_name_not_empty', sql`length(${table.name}) > 0`),
    check('sub_collections_sort_order_non_negative', sql`${table.sortOrder} >= 0`),
  ],
);
