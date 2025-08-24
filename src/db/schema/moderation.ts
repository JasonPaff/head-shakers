import { index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { users } from '@/db/schema/users';

export const contentReports = pgTable(
  'content_reports',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: text('description'),
    id: uuid('id').primaryKey().defaultRandom(),
    moderatorId: uuid('moderator_id').references(() => users.id, { onDelete: 'set null' }),
    moderatorNotes: text('moderator_notes'),
    reason: varchar('reason', { length: 100 }).notNull(),
    reporterId: uuid('reporter_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    resolvedAt: timestamp('resolved_at'),
    status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, reviewed, resolved, dismissed
    targetId: uuid('target_id').notNull(),
    targetType: varchar('target_type', { length: 20 }).notNull(), // bobblehead, comment, user, collection
  },
  (table) => [
    index('content_reports_created_at_idx').on(table.createdAt),
    index('content_reports_reporter_id_idx').on(table.reporterId),
    index('content_reports_status_idx').on(table.status),

    index('content_reports_target_idx').on(table.targetType, table.targetId),
  ],
);
