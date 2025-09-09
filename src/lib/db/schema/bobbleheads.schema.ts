import { sql } from 'drizzle-orm';
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import type { CustomFields } from '@/lib/validations/bobbleheads.validation';

import { DEFAULTS, SCHEMA_LIMITS } from '@/lib/constants';
import { collections, subCollections } from '@/lib/db/schema/collections.schema';
import { tags } from '@/lib/db/schema/tags.schema';
import { users } from '@/lib/db/schema/users.schema';

export const bobbleheads = pgTable(
  'bobbleheads',
  {
    acquisitionDate: timestamp('acquisition_date'),
    acquisitionMethod: varchar('acquisition_method', {
      length: SCHEMA_LIMITS.BOBBLEHEAD.ACQUISITION_METHOD.MAX,
    }),
    category: varchar('category', { length: SCHEMA_LIMITS.BOBBLEHEAD.CATEGORY.MAX }),
    characterName: varchar('character_name', { length: SCHEMA_LIMITS.BOBBLEHEAD.CHARACTER_NAME.MAX }),
    collectionId: uuid('collection_id')
      .references(() => collections.id, { onDelete: 'cascade' })
      .notNull(),
    commentCount: integer('comment_count').default(DEFAULTS.BOBBLEHEAD.COMMENT_COUNT).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    currentCondition: varchar('current_condition', { length: SCHEMA_LIMITS.BOBBLEHEAD.CURRENT_CONDITION.MAX })
      .default(DEFAULTS.BOBBLEHEAD.CONDITION)
      .notNull(),
    customFields: jsonb('custom_fields').$type<CustomFields>(),
    deletedAt: timestamp('deleted_at'),
    description: varchar('description', { length: SCHEMA_LIMITS.BOBBLEHEAD.DESCRIPTION.MAX }),
    height: decimal('height', {
      mode: 'number',
      precision: SCHEMA_LIMITS.BOBBLEHEAD.HEIGHT.PRECISION,
      scale: SCHEMA_LIMITS.BOBBLEHEAD.HEIGHT.SCALE,
    }),
    id: uuid('id').primaryKey().defaultRandom(),
    isDeleted: boolean('is_deleted').default(DEFAULTS.BOBBLEHEAD.IS_DELETED).notNull(),
    isFeatured: boolean('is_featured').default(DEFAULTS.BOBBLEHEAD.IS_FEATURED).notNull(),
    isPublic: boolean('is_public').default(DEFAULTS.BOBBLEHEAD.IS_PUBLIC).notNull(),
    likeCount: integer('like_count').default(DEFAULTS.BOBBLEHEAD.LIKE_COUNT).notNull(),
    manufacturer: varchar('manufacturer', { length: SCHEMA_LIMITS.BOBBLEHEAD.MANUFACTURER.MAX }),
    material: varchar('material', { length: SCHEMA_LIMITS.BOBBLEHEAD.MATERIAL.MAX }),
    name: varchar('name', { length: SCHEMA_LIMITS.BOBBLEHEAD.NAME.MAX }).notNull(),
    purchaseLocation: varchar('purchase_location', {
      length: SCHEMA_LIMITS.BOBBLEHEAD.PURCHASE_LOCATION.MAX,
    }),
    purchasePrice: decimal('purchase_price', {
      mode: 'number',
      precision: SCHEMA_LIMITS.BOBBLEHEAD.PURCHASE_PRICE.PRECISION,
      scale: SCHEMA_LIMITS.BOBBLEHEAD.PURCHASE_PRICE.SCALE,
    }),
    series: varchar('series', { length: SCHEMA_LIMITS.BOBBLEHEAD.SERIES.MAX }),
    status: varchar('status', { length: SCHEMA_LIMITS.BOBBLEHEAD.STATUS.MAX })
      .default(DEFAULTS.BOBBLEHEAD.STATUS)
      .notNull(),
    subcollectionId: uuid('sub_collection_id').references(() => subCollections.id, { onDelete: 'set null' }),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    viewCount: integer('view_count').default(DEFAULTS.BOBBLEHEAD.VIEW_COUNT).notNull(),
    weight: decimal('weight', {
      mode: 'number',
      precision: SCHEMA_LIMITS.BOBBLEHEAD.WEIGHT.PRECISION,
      scale: SCHEMA_LIMITS.BOBBLEHEAD.WEIGHT.SCALE,
    }),
    year: integer('year'),
  },
  (table) => [
    // single column indexes
    index('bobbleheads_category_idx').on(table.category),
    index('bobbleheads_collection_id_idx').on(table.collectionId),
    index('bobbleheads_created_at_idx').on(table.createdAt),
    index('bobbleheads_is_featured_idx').on(table.isFeatured),
    index('bobbleheads_is_public_idx').on(table.isPublic),
    index('bobbleheads_status_idx').on(table.status),
    index('bobbleheads_sub_collection_id_idx').on(table.subcollectionId),
    index('bobbleheads_user_id_idx').on(table.userId),

    // composite indexes
    index('bobbleheads_collection_public_idx').on(table.collectionId, table.isPublic),
    index('bobbleheads_public_featured_idx').on(table.isPublic, table.isFeatured),
    index('bobbleheads_user_created_idx').on(table.userId, table.createdAt),
    index('bobbleheads_user_public_idx').on(table.userId, table.isPublic),

    // search and performance indexes
    index('bobbleheads_name_search_idx').using('gin', sql`${table.name} gin_trgm_ops`),
    index('bobbleheads_description_search_idx').using('gin', sql`${table.description} gin_trgm_ops`),
    index('bobbleheads_custom_fields_gin_idx').using('gin', table.customFields),
    index('bobbleheads_custom_fields_path_idx').using('gin', sql`(${table.customFields} jsonb_path_ops)`),
    
    // pagination and filtering indexes
    index('bobbleheads_user_created_desc_idx').on(table.userId, sql`${table.createdAt} DESC`),
    index('bobbleheads_public_created_desc_idx').on(table.isPublic, sql`${table.createdAt} DESC`),
    index('bobbleheads_featured_created_desc_idx').on(table.isFeatured, sql`${table.createdAt} DESC`),
  ],
);

export const bobbleheadPhotos = pgTable(
  'bobblehead_photos',
  {
    altText: varchar('alt_text', { length: SCHEMA_LIMITS.BOBBLEHEAD_PHOTO.ALT_TEXT.MAX }),
    bobbleheadId: uuid('bobblehead_id')
      .references(() => bobbleheads.id, { onDelete: 'cascade' })
      .notNull(),
    caption: varchar('caption', { length: SCHEMA_LIMITS.BOBBLEHEAD_PHOTO.CAPTION.MAX }),
    fileSize: integer('file_size'),
    height: integer('height'),
    id: uuid('id').primaryKey().defaultRandom(),
    isPrimary: boolean('is_primary').default(DEFAULTS.BOBBLEHEAD_PHOTO.IS_PRIMARY).notNull(),
    sortOrder: integer('sort_order').default(DEFAULTS.BOBBLEHEAD_PHOTO.SORT_ORDER).notNull(),
    uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
    url: varchar('url', { length: SCHEMA_LIMITS.BOBBLEHEAD_PHOTO.URL.MAX }).notNull(),
    width: integer('width'),
  },
  (table) => [
    // single column indexes
    index('bobblehead_photos_bobblehead_id_idx').on(table.bobbleheadId),
    index('bobblehead_photos_is_primary_idx').on(table.isPrimary),
    index('bobblehead_photos_sort_order_idx').on(table.sortOrder),
  ],
);

export const bobbleheadTags = pgTable(
  'bobblehead_tags',
  {
    bobbleheadId: uuid('bobblehead_id')
      .references(() => bobbleheads.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    tagId: uuid('tag_id')
      .references(() => tags.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    // single column indexes
    index('bobblehead_tags_bobblehead_id_idx').on(table.bobbleheadId),
    index('bobblehead_tags_tag_id_idx').on(table.tagId),

    // unique composite indexes
    uniqueIndex('bobblehead_tags_unique').on(table.bobbleheadId, table.tagId),
  ],
);
