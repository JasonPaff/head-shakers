import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { DEFAULTS, SCHEMA_LIMITS } from '@/lib/constants';
import { SLUG_MAX_LENGTH, SLUG_MIN_LENGTH, SLUG_PATTERN } from '@/lib/constants/slug';
import { subCollections } from '@/lib/db/schema';
import { zodMaxString, zodMinMaxString } from '@/lib/utils/zod.utils';

export type DeleteSubCollection = z.infer<typeof deleteSubCollectionSchema>;
export type InsertSubCollection = z.infer<typeof insertSubCollectionSchema>;
export type InsertSubCollectionInput = z.input<typeof insertSubCollectionSchema>;
export type PublicSubCollection = z.infer<typeof publicSubCollectionSchema>;
export type SelectSubCollection = z.infer<typeof selectSubCollectionSchema>;
export type UpdateSubCollection = z.infer<typeof updateSubCollectionSchema>;
export type UpdateSubCollectionInput = z.input<typeof updateSubCollectionSchema>;

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
  slug: true,
  updatedAt: true,
});
export const updateSubCollectionSchema = insertSubCollectionSchema.partial().extend({
  subcollectionId: z.string().uuid(),
});
export const deleteSubCollectionSchema = z.object({
  subcollectionId: z.string().uuid(),
});
export const publicSubCollectionSchema = selectSubCollectionSchema;

export const getSubcollectionBySlugSchema = z.object({
  collectionId: z.string().uuid({ message: 'Collection ID is required' }),
  slug: z
    .string()
    .min(SLUG_MIN_LENGTH, { message: `Slug must be at least ${SLUG_MIN_LENGTH} character long` })
    .max(SLUG_MAX_LENGTH, { message: `Slug cannot exceed ${SLUG_MAX_LENGTH} characters` })
    .regex(SLUG_PATTERN, {
      message: 'Slug must contain only lowercase letters, numbers, and hyphens',
    }),
});
