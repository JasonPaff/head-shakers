import { index, integer, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { users } from '@/db/schema/users';

export const tags = pgTable(
  'tags',
  {
    color: varchar('color', { length: 7 }).default('#3B82F6'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 50 }).notNull(),
    usageCount: integer('usage_count').default(0),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    index('tags_name_idx').on(table.name),
    index('tags_user_id_idx').on(table.userId),

    uniqueIndex('tags_user_name_unique').on(table.userId, table.name),
  ],
);
