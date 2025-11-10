import { index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const launchNotifications = pgTable(
  'launch_notifications',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    email: varchar('email').notNull().unique(),
    id: uuid('id').primaryKey().defaultRandom(),
    notifiedAt: timestamp('notified_at'),
  },
  (table) => [
    // single column index for fast email lookups
    index('launch_notifications_email_idx').on(table.email),
  ],
);
