import { sql } from 'drizzle-orm';
import { boolean, check, index, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { DEFAULTS, SCHEMA_LIMITS } from '@/lib/constants';
import { SLUG_MAX_LENGTH } from '@/lib/constants/slug';
import { users } from '@/lib/db/schema/users.schema';

export const collections = pgTable(
  'collections',
  {
    coverImageUrl: varchar('cover_image_url', { length: SCHEMA_LIMITS.COLLECTION.COVER_IMAGE_URL.MAX }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
    description: varchar('description', { length: SCHEMA_LIMITS.COLLECTION.DESCRIPTION.MAX }),
    id: uuid('id').primaryKey().defaultRandom(),
    isPublic: boolean('is_public').default(DEFAULTS.COLLECTION.IS_PUBLIC).notNull(),
    name: varchar('name', { length: SCHEMA_LIMITS.COLLECTION.NAME.MAX }).notNull(),
    slug: varchar('slug', { length: SLUG_MAX_LENGTH }).notNull(),
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
    index('collections_created_at_idx').on(table.createdAt),
    index('collections_deleted_at_idx').on(table.deletedAt),

    // composite indexes
    index('collections_public_updated_idx').on(table.isPublic, table.updatedAt),
    index('collections_user_public_idx').on(table.userId, table.isPublic),

    // search and performance indexes
    index('collections_name_search_idx').using('gin', sql`${table.name} gin_trgm_ops`),
    index('collections_description_search_idx').using('gin', sql`${table.description} gin_trgm_ops`),
    index('collections_user_created_desc_idx').on(table.userId, sql`${table.createdAt} DESC`),
    index('collections_public_created_desc_idx').on(table.isPublic, sql`${table.createdAt} DESC`),

    // constraints
    check('collections_name_length', sql`length(${table.name}) <= ${SCHEMA_LIMITS.COLLECTION.NAME.MAX}`),
    check('collections_name_not_empty', sql`length(${table.name}) >= ${SCHEMA_LIMITS.COLLECTION.NAME.MIN}`),

    // unique constraints
    uniqueIndex('collections_user_slug_unique').on(table.userId, table.slug),
  ],
);
