import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { DEFAULTS, SCHEMA_LIMITS } from '@/lib/constants';
import { SLUG_MAX_LENGTH, SLUG_MIN_LENGTH, SLUG_PATTERN } from '@/lib/constants/slug';
import { collections } from '@/lib/db/schema';
import { zodMaxString, zodMinMaxString } from '@/lib/utils/zod.utils';

export type DeleteCollection = z.infer<typeof deleteCollectionSchema>;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type InsertCollectionInput = z.input<typeof insertCollectionSchema>;
export type PublicCollection = z.infer<typeof publicCollectionSchema>;
export type SelectCollection = z.infer<typeof selectCollectionSchema>;
export type UpdateCollection = z.infer<typeof updateCollectionSchema>;
export type UpdateCollectionInput = z.input<typeof updateCollectionSchema>;

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
  slug: true,
  totalItems: true,
  updatedAt: true,
  userId: true,
});
export const updateCollectionSchema = insertCollectionSchema.extend({
  collectionId: z.uuid(),
});
export const publicCollectionSchema = selectCollectionSchema;
export const deleteCollectionSchema = z.object({ collectionId: z.string() });

export const getCollectionBySlugSchema = z.object({
  slug: z
    .string()
    .min(SLUG_MIN_LENGTH, { message: `Slug must be at least ${SLUG_MIN_LENGTH} character long` })
    .max(SLUG_MAX_LENGTH, { message: `Slug cannot exceed ${SLUG_MAX_LENGTH} characters` })
    .regex(SLUG_PATTERN, {
      message: 'Slug must contain only lowercase letters, numbers, and hyphens',
    }),
  userId: z.string().uuid({ message: 'User ID is required' }),
});
