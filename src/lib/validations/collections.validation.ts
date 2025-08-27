import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { DEFAULTS, SCHEMA_LIMITS } from '@/lib/constants';
import { collections, subCollections } from '@/lib/db/schema';

export const selectCollectionSchema = createSelectSchema(collections);
export const insertCollectionSchema = createInsertSchema(collections, {
  coverImageUrl: z.url().optional(),
  description: z.string().max(SCHEMA_LIMITS.COLLECTION.DESCRIPTION.MAX).optional(),
  name: z.string().min(SCHEMA_LIMITS.COLLECTION.NAME.MIN).max(SCHEMA_LIMITS.COLLECTION.NAME.MAX),
  totalValue: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
}).omit({
  createdAt: true,
  id: true,
  lastItemAddedAt: true,
  totalItems: true,
  updatedAt: true,
  userId: true,
});
export const updateCollectionSchema = insertCollectionSchema.partial();
export const publicCollectionSchema = selectCollectionSchema;

export const selectSubCollectionSchema = createSelectSchema(subCollections);
export const insertSubCollectionSchema = createInsertSchema(subCollections, {
  coverImageUrl: z.url().optional(),
  description: z.string().max(SCHEMA_LIMITS.SUB_COLLECTION.DESCRIPTION.MAX).optional(),
  name: z.string().min(SCHEMA_LIMITS.SUB_COLLECTION.NAME.MIN).max(SCHEMA_LIMITS.SUB_COLLECTION.NAME.MAX),
  sortOrder: z.number().min(0).default(DEFAULTS.SUB_COLLECTION.SORT_ORDER),
}).omit({
  createdAt: true,
  id: true,
  itemCount: true,
  updatedAt: true,
});
export const updateSubCollectionSchema = insertSubCollectionSchema.partial();
export const publicSubCollectionSchema = selectSubCollectionSchema;

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type InsertSubCollection = z.infer<typeof insertSubCollectionSchema>;
export type PublicCollection = z.infer<typeof publicCollectionSchema>;
export type PublicSubCollection = z.infer<typeof publicSubCollectionSchema>;
export type SelectCollection = z.infer<typeof selectCollectionSchema>;
export type SelectSubCollection = z.infer<typeof selectSubCollectionSchema>;
export type UpdateCollection = z.infer<typeof updateCollectionSchema>;
export type UpdateSubCollection = z.infer<typeof updateSubCollectionSchema>;
