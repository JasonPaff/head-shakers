import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { CONFIG, DEFAULTS, SCHEMA_LIMITS } from '@/lib/constants';
import { tags } from '@/lib/db/schema';

export const selectTagSchema = createSelectSchema(tags);

export const insertTagSchema = createInsertSchema(tags, {
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color'),
  name: z.string().min(SCHEMA_LIMITS.TAG.NAME.MIN).max(SCHEMA_LIMITS.TAG.NAME.MAX).trim(),
  usageCount: z.number().min(0).default(DEFAULTS.TAG.USAGE_COUNT),
}).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
  userId: true,
});

export const updateTagSchema = insertTagSchema.partial();

// action-specific schemas
export const attachTagsSchema = z.object({
  bobbleheadId: z.string().uuid('Invalid bobblehead ID'),
  tagIds: z
    .array(z.string().uuid('Invalid tag ID'))
    .min(1, 'At least one tag is required')
    .max(CONFIG.CONTENT.MAX_TAGS_PER_BOBBLEHEAD),
});

export const detachTagsSchema = z.object({
  bobbleheadId: z.string().uuid('Invalid bobblehead ID'),
  tagIds: z.array(z.string().uuid('Invalid tag ID')).min(1, 'At least one tag is required'),
});

export const bulkDeleteTagsSchema = z.object({
  tagIds: z.array(z.string().uuid('Invalid tag ID')).min(1, 'At least one tag is required'),
});

export const getTagSuggestionsSchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters').max(50, 'Query too long'),
});

export const deleteTagSchema = z.object({
  tagId: z.string().uuid('Invalid tag ID'),
});

export const updateTagActionSchema = updateTagSchema.extend({
  tagId: z.string().uuid('Invalid tag ID'),
});

export type AttachTags = z.infer<typeof attachTagsSchema>;
export type BulkDeleteTags = z.infer<typeof bulkDeleteTagsSchema>;
export type DeleteTag = z.infer<typeof deleteTagSchema>;
export type DetachTags = z.infer<typeof detachTagsSchema>;
export type GetTagSuggestions = z.infer<typeof getTagSuggestionsSchema>;
export type InsertTag = z.infer<typeof insertTagSchema>;
export type SelectTag = z.infer<typeof selectTagSchema>;
export type UpdateTag = z.infer<typeof updateTagSchema>;
export type UpdateTagAction = z.infer<typeof updateTagActionSchema>;
