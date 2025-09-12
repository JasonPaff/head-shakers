import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  decimal,
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { DEFAULTS, SCHEMA_LIMITS } from '@/lib/constants';
import { users } from '@/lib/db/schema/users.schema';

export const collections = pgTable(
  'collections',
  {
    coverImageUrl: varchar('cover_image_url', { length: SCHEMA_LIMITS.COLLECTION.COVER_IMAGE_URL.MAX }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: varchar('description', { length: SCHEMA_LIMITS.COLLECTION.DESCRIPTION.MAX }),
    id: uuid('id').primaryKey().defaultRandom(),
    isPublic: boolean('is_public').default(DEFAULTS.COLLECTION.IS_PUBLIC).notNull(),
    lastItemAddedAt: timestamp('last_item_added_at'),
    likeCount: integer('like_count').default(DEFAULTS.COLLECTION.LIKE_COUNT).notNull(),
    name: varchar('name', { length: SCHEMA_LIMITS.COLLECTION.NAME.MAX }).notNull(),
    totalItems: integer('total_items').default(DEFAULTS.COLLECTION.TOTAL_ITEMS).notNull(),
    totalValue: decimal('total_value', {
      precision: SCHEMA_LIMITS.COLLECTION.TOTAL_VALUE.PRECISION,
      scale: SCHEMA_LIMITS.COLLECTION.TOTAL_VALUE.SCALE,
    }).default(DEFAULTS.COLLECTION.TOTAL_VALUE),
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

    // search and performance indexes
    index('collections_name_search_idx').using('gin', sql`${table.name} gin_trgm_ops`),
    index('collections_description_search_idx').using('gin', sql`${table.description} gin_trgm_ops`),
    index('collections_user_created_desc_idx').on(table.userId, sql`${table.createdAt} DESC`),
    index('collections_public_created_desc_idx').on(table.isPublic, sql`${table.createdAt} DESC`),
    index('collections_total_value_desc_idx').on(sql`${table.totalValue} DESC NULLS LAST`),

    // constraints
    check('collections_name_length', sql`length(${table.name}) <= ${SCHEMA_LIMITS.COLLECTION.NAME.MAX}`),
    check('collections_name_not_empty', sql`length(${table.name}) >= ${SCHEMA_LIMITS.COLLECTION.NAME.MIN}`),
    check('collections_total_items_non_negative', sql`${table.totalItems} >= 0`),
    check('collections_total_value_non_negative', sql`${table.totalValue} >= 0`),
    check('collections_like_count_non_negative', sql`${table.likeCount} >= 0`),
  ],
);

export const subCollections = pgTable(
  'sub_collections',
  {
    collectionId: uuid('collection_id')
      .references(() => collections.id, { onDelete: 'cascade' })
      .notNull(),
    coverImageUrl: varchar('cover_image_url', { length: SCHEMA_LIMITS.COLLECTION.COVER_IMAGE_URL.MAX }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: varchar('description', { length: SCHEMA_LIMITS.SUB_COLLECTION.DESCRIPTION.MAX }),
    id: uuid('id').primaryKey().defaultRandom(),
    isPublic: boolean('is_public').default(DEFAULTS.SUB_COLLECTION.IS_PUBLIC).notNull(),
    itemCount: integer('item_count').default(DEFAULTS.SUB_COLLECTION.ITEM_COUNT).notNull(),
    likeCount: integer('like_count').default(DEFAULTS.SUB_COLLECTION.LIKE_COUNT).notNull(),
    name: varchar('name', { length: SCHEMA_LIMITS.SUB_COLLECTION.NAME.MAX }).notNull(),
    sortOrder: integer('sort_order').default(DEFAULTS.SUB_COLLECTION.SORT_ORDER).notNull(),
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
    check('sub_collections_like_count_non_negative', sql`${table.likeCount} >= 0`),
    check(
      'sub_collections_name_length',
      sql`length(${table.name}) <= ${SCHEMA_LIMITS.SUB_COLLECTION.NAME.MAX}`,
    ),
    check('sub_collections_name_not_empty', sql`length(${table.name}) > 0`),
    check('sub_collections_sort_order_non_negative', sql`${table.sortOrder} >= 0`),
  ],
);
