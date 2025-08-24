import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { collections, subCollections } from '@/lib/db/schema';

export const selectCollectionSchema = createSelectSchema(collections);
export const insertCollectionSchema = createInsertSchema(collections, {
  coverImageUrl: z.url().optional(),
  description: z.string().max(1000).optional(),
  name: z.string().min(1).max(100),
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
  description: z.string().max(1000).optional(),
  name: z.string().min(1).max(100),
  sortOrder: z.number().min(0).default(0),
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
