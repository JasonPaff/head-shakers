import { index, integer, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { DEFAULTS, SCHEMA_LIMITS } from '@/lib/constants';
import { users } from '@/lib/db/schema/users.schema';

export const tags = pgTable(
  'tags',
  {
    color: varchar('color', { length: SCHEMA_LIMITS.TAG.COLOR.LENGTH }).default(DEFAULTS.TAG.COLOR).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: SCHEMA_LIMITS.TAG.NAME.MAX }).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    usageCount: integer('usage_count').default(DEFAULTS.TAG.USAGE_COUNT).notNull(),
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
