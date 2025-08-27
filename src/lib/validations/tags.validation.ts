import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { DEFAULTS, SCHEMA_LIMITS } from '@/lib/constants';
import { tags } from '@/lib/db/schema';

export const selectTagSchema = createSelectSchema(tags);

export const insertTagSchema = createInsertSchema(tags, {
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color'),
  name: z.string().min(SCHEMA_LIMITS.TAG.NAME.MIN).max(SCHEMA_LIMITS.TAG.NAME.MAX),
  usageCount: z.number().min(0).default(DEFAULTS.TAG.USAGE_COUNT),
}).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
  userId: true,
});

export const updateTagSchema = insertTagSchema.partial();

export type InsertTag = z.infer<typeof insertTagSchema>;
export type SelectTag = z.infer<typeof selectTagSchema>;
export type UpdateTag = z.infer<typeof updateTagSchema>;
