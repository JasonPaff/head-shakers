import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { tagsSchema } from '@/lib/db/schema';

export const selectTagSchema = createSelectSchema(tags);

export const insertTagSchema = createInsertSchema(tags, {
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color'),
  name: z.string().min(1).max(50),
  usageCount: z.number().min(0).default(0),
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
