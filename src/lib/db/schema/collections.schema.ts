import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  decimal,
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { DEFAULTS, SCHEMA_LIMITS } from '@/lib/constants';
import { SLUG_MAX_LENGTH } from '@/lib/constants/slug';
import { users } from '@/lib/db/schema/users.schema';

export const collections = pgTable(
  'collections',
  {
    commentCount: integer('comment_count').default(DEFAULTS.COLLECTION.COMMENT_COUNT).notNull(),
    coverImageUrl: varchar('cover_image_url', { length: SCHEMA_LIMITS.COLLECTION.COVER_IMAGE_URL.MAX }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: varchar('description', { length: SCHEMA_LIMITS.COLLECTION.DESCRIPTION.MAX }),
    id: uuid('id').primaryKey().defaultRandom(),
    isPublic: boolean('is_public').default(DEFAULTS.COLLECTION.IS_PUBLIC).notNull(),
    lastItemAddedAt: timestamp('last_item_added_at'),
    likeCount: integer('like_count').default(DEFAULTS.COLLECTION.LIKE_COUNT).notNull(),
    name: varchar('name', { length: SCHEMA_LIMITS.COLLECTION.NAME.MAX }).notNull(),
    slug: varchar('slug', { length: SLUG_MAX_LENGTH }).notNull(),
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
    index('collections_slug_idx').on(table.slug),
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
    index('collections_public_like_count_idx').on(table.isPublic, sql`${table.likeCount} DESC`),
    index('collections_total_value_desc_idx').on(sql`${table.totalValue} DESC NULLS LAST`),
    index('collections_comment_count_desc_idx').on(sql`${table.commentCount} DESC`),
    index('collections_public_comment_count_idx').on(table.isPublic, sql`${table.commentCount} DESC`),

    // constraints
    check('collections_name_length', sql`length(${table.name}) <= ${SCHEMA_LIMITS.COLLECTION.NAME.MAX}`),
    check('collections_name_not_empty', sql`length(${table.name}) >= ${SCHEMA_LIMITS.COLLECTION.NAME.MIN}`),
    check('collections_total_items_non_negative', sql`${table.totalItems} >= 0`),
    check('collections_total_value_non_negative', sql`${table.totalValue} >= 0`),
    check('collections_like_count_non_negative', sql`${table.likeCount} >= 0`),
    check('collections_comment_count_non_negative', sql`${table.commentCount} >= 0`),

    // unique constraints
    uniqueIndex('collections_user_slug_unique').on(table.userId, table.slug),
  ],
);
