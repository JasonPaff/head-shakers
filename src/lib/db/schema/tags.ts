import { index, integer, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { users } from '@/lib/db/schema/users';

export const tags = pgTable(
  'tags',
  {
    color: varchar('color', { length: 7 }).default('#3B82F6').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 50 }).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    usageCount: integer('usage_count').default(0).notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    // single column indexes
    index('tags_name_idx').on(table.name),
    index('tags_user_id_idx').on(table.userId),
    index('tags_usage_count_idx').on(table.usageCount),

    // unique constraints
    uniqueIndex('tags_user_name_unique').on(table.userId, table.name),
  ],
);

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
