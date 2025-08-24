import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { collections, subCollections } from '@/lib/db/schema/collections';
import { tags } from '@/lib/db/schema/tags';
import { users } from '@/lib/db/schema/users';

export const customFieldsSchema = z.record(z.string(), z.any()).optional();

export type CustomFields = z.infer<typeof customFieldsSchema>;

export const bobbleheads = pgTable(
  'bobbleheads',
  {
    acquisitionDate: timestamp('acquisition_date'),
    acquisitionMethod: varchar('acquisition_method', { length: 50 }),
    category: varchar('category', { length: 50 }),
    characterName: varchar('character_name', { length: 100 }),
    collectionId: uuid('collection_id')
      .references(() => collections.id, { onDelete: 'cascade' })
      .notNull(),
    commentCount: integer('comment_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    currentCondition: varchar('current_condition', { length: 20 }).default('excellent').notNull(),
    customFields: jsonb('custom_fields').$type<CustomFields>(),
    deletedAt: timestamp('deleted_at'),
    description: text('description'),
    height: decimal('height', { precision: 5, scale: 2 }),
    id: uuid('id').primaryKey().defaultRandom(),
    isDeleted: boolean('is_deleted').default(false).notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    isPublic: boolean('is_public').default(true).notNull(),
    likeCount: integer('like_count').default(0).notNull(),
    manufacturer: varchar('manufacturer', { length: 100 }),
    material: varchar('material', { length: 100 }),
    name: varchar('name', { length: 200 }).notNull(),
    purchaseLocation: varchar('purchase_location', { length: 100 }),
    purchasePrice: decimal('purchase_price', { precision: 10, scale: 2 }),
    series: varchar('series', { length: 100 }),
    status: varchar('status', { length: 20 }).default('owned').notNull(),
    subCollectionId: uuid('sub_collection_id').references(() => subCollections.id, { onDelete: 'set null' }),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    viewCount: integer('view_count').default(0).notNull(),
    weight: decimal('weight', { precision: 6, scale: 2 }),
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
    index('bobbleheads_sub_collection_id_idx').on(table.subCollectionId),
    index('bobbleheads_user_id_idx').on(table.userId),

    // composite indexes
    index('bobbleheads_collection_public_idx').on(table.collectionId, table.isPublic),
    index('bobbleheads_public_featured_idx').on(table.isPublic, table.isFeatured),
    index('bobbleheads_user_created_idx').on(table.userId, table.createdAt),
    index('bobbleheads_user_public_idx').on(table.userId, table.isPublic),
  ],
);

export const bobbleheadPhotos = pgTable(
  'bobblehead_photos',
  {
    altText: varchar('alt_text', { length: 255 }),
    bobbleheadId: uuid('bobblehead_id')
      .references(() => bobbleheads.id, { onDelete: 'cascade' })
      .notNull(),
    caption: text('caption'),
    fileSize: integer('file_size'),
    height: integer('height'),
    id: uuid('id').primaryKey().defaultRandom(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
    url: text('url').notNull(),
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

export const selectBobbleheadSchema = createSelectSchema(bobbleheads);
export const insertBobbleheadSchema = createInsertSchema(bobbleheads, {
  acquisitionMethod: z.string().min(1).max(50).optional(),
  category: z.string().min(1).max(50).optional(),
  characterName: z.string().min(1).max(100).optional(),
  currentCondition: z.enum(['mint', 'excellent', 'good', 'fair', 'poor']).default('excellent'),
  customFields: customFieldsSchema,
  description: z.string().max(1000).optional(),
  height: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  manufacturer: z.string().min(1).max(100).optional(),
  material: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(200),
  purchaseLocation: z.string().min(1).max(100).optional(),
  purchasePrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  series: z.string().min(1).max(100).optional(),
  status: z.enum(['owned', 'for_trade', 'for_sale', 'sold', 'wishlist']).default('owned'),
  weight: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  year: z
    .number()
    .min(1800)
    .max(new Date().getFullYear() + 1)
    .optional(),
}).omit({
  commentCount: true,
  createdAt: true,
  deletedAt: true,
  id: true,
  isDeleted: true,
  likeCount: true,
  updatedAt: true,
  userId: true,
  viewCount: true,
});

export const updateBobbleheadSchema = insertBobbleheadSchema.partial();

export const publicBobbleheadSchema = selectBobbleheadSchema.omit({
  deletedAt: true,
  isDeleted: true,
});

export const selectBobbleheadPhotoSchema = createSelectSchema(bobbleheadPhotos);
export const insertBobbleheadPhotoSchema = createInsertSchema(bobbleheadPhotos, {
  altText: z.string().min(1).max(255).optional(),
  caption: z.string().max(500).optional(),
  fileSize: z.number().min(1).optional(),
  height: z.number().min(1).optional(),
  url: z.url(),
  width: z.number().min(1).optional(),
}).omit({
  bobbleheadId: true,
  id: true,
  uploadedAt: true,
});

export const updateBobbleheadPhotoSchema = insertBobbleheadPhotoSchema.partial();

export const selectBobbleheadTagSchema = createSelectSchema(bobbleheadTags);
export const insertBobbleheadTagSchema = createInsertSchema(bobbleheadTags).omit({
  createdAt: true,
  id: true,
});

export type InsertBobblehead = z.infer<typeof insertBobbleheadSchema>;
export type InsertBobbleheadPhoto = z.infer<typeof insertBobbleheadPhotoSchema>;
export type InsertBobbleheadTag = z.infer<typeof insertBobbleheadTagSchema>;
export type PublicBobblehead = z.infer<typeof publicBobbleheadSchema>;
export type SelectBobblehead = z.infer<typeof selectBobbleheadSchema>;
export type SelectBobbleheadPhoto = z.infer<typeof selectBobbleheadPhotoSchema>;
export type SelectBobbleheadTag = z.infer<typeof selectBobbleheadTagSchema>;
export type UpdateBobblehead = z.infer<typeof updateBobbleheadSchema>;
export type UpdateBobbleheadPhoto = z.infer<typeof updateBobbleheadPhotoSchema>;
