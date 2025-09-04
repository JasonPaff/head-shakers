import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { DEFAULTS, SCHEMA_LIMITS } from '@/lib/constants';
import { collections, subCollections } from '@/lib/db/schema';
import { zodMaxString, zodMinMaxString } from '@/lib/utils/zod.utils';

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type InsertCollectionInput = z.input<typeof insertCollectionSchema>;
export type InsertSubCollection = z.infer<typeof insertSubCollectionSchema>;
export type PublicCollection = z.infer<typeof publicCollectionSchema>;
export type PublicSubCollection = z.infer<typeof publicSubCollectionSchema>;
export type SelectCollection = z.infer<typeof selectCollectionSchema>;
export type SelectSubCollection = z.infer<typeof selectSubCollectionSchema>;
export type UpdateCollection = z.infer<typeof updateCollectionSchema>;
export type UpdateCollectionInput = z.input<typeof updateCollectionSchema>;
export type UpdateSubCollection = z.infer<typeof updateSubCollectionSchema>;

export const selectCollectionSchema = createSelectSchema(collections);
export const insertCollectionSchema = createInsertSchema(collections, {
  coverImageUrl: z.url().optional(),
  description: zodMaxString({
    fieldName: 'Description',
    maxLength: SCHEMA_LIMITS.COLLECTION.DESCRIPTION.MAX,
  }),
  isPublic: z.boolean().default(DEFAULTS.COLLECTION.IS_PUBLIC),
  name: zodMinMaxString({
    fieldName: 'Name',
    maxLength: SCHEMA_LIMITS.COLLECTION.NAME.MAX,
    minLength: SCHEMA_LIMITS.COLLECTION.NAME.MIN,
  }),
}).omit({
  createdAt: true,
  id: true,
  lastItemAddedAt: true,
  totalItems: true,
  updatedAt: true,
  userId: true,
});
export const updateCollectionSchema = insertCollectionSchema.extend({
  collectionId: z.uuid(),
});
export const publicCollectionSchema = selectCollectionSchema;

export const selectSubCollectionSchema = createSelectSchema(subCollections);
export const insertSubCollectionSchema = createInsertSchema(subCollections, {
  coverImageUrl: z.url().optional(),
  description: zodMaxString({
    fieldName: 'Description',
    maxLength: SCHEMA_LIMITS.SUB_COLLECTION.DESCRIPTION.MAX,
  }),
  name: zodMinMaxString({
    fieldName: 'Name',
    maxLength: SCHEMA_LIMITS.SUB_COLLECTION.NAME.MAX,
    minLength: SCHEMA_LIMITS.SUB_COLLECTION.NAME.MIN,
  }),
  sortOrder: z.number().min(0).default(DEFAULTS.SUB_COLLECTION.SORT_ORDER),
}).omit({
  createdAt: true,
  id: true,
  itemCount: true,
  updatedAt: true,
});
export const updateSubCollectionSchema = insertSubCollectionSchema.partial();
export const publicSubCollectionSchema = selectSubCollectionSchema;
