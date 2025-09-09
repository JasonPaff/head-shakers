import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { DEFAULTS, SCHEMA_LIMITS } from '@/lib/constants';
import { subCollections } from '@/lib/db/schema';
import { zodMaxString, zodMinMaxString } from '@/lib/utils/zod.utils';

export type InsertSubCollection = z.infer<typeof insertSubCollectionSchema>;
export type InsertSubCollectionInput = z.input<typeof insertSubCollectionSchema>;
export type PublicSubCollection = z.infer<typeof publicSubCollectionSchema>;
export type SelectSubCollection = z.infer<typeof selectSubCollectionSchema>;
export type UpdateSubCollection = z.infer<typeof updateSubCollectionSchema>;

export const GetSubCollectionsByCollectionSchema = z.object({ collectionId: z.string() });

export const selectSubCollectionSchema = createSelectSchema(subCollections);
export const insertSubCollectionSchema = createInsertSchema(subCollections, {
  coverImageUrl: z.url().optional(),
  description: zodMaxString({
    fieldName: 'Description',
    maxLength: SCHEMA_LIMITS.SUB_COLLECTION.DESCRIPTION.MAX,
  }),
  isPublic: z.boolean().default(DEFAULTS.SUB_COLLECTION.IS_PUBLIC),
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
