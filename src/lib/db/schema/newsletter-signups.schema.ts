import { sql } from 'drizzle-orm';
import { check, index, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { SCHEMA_LIMITS } from '@/lib/constants';

/**
 * Newsletter signups table for storing email subscriptions.
 *
 * Design decisions:
 * - Uses UUID primary key (project convention)
 * - Email is unique and required
 * - userId is optional for linking to Clerk users (varchar to match Clerk ID format)
 * - Uses soft delete pattern with unsubscribedAt timestamp
 * - Standard audit timestamps (createdAt, updatedAt)
 */
export const newsletterSignups = pgTable(
  'newsletter_signups',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    email: varchar('email', { length: SCHEMA_LIMITS.NEWSLETTER_SIGNUP.EMAIL.MAX }).notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
    unsubscribedAt: timestamp('unsubscribed_at'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: varchar('user_id', { length: SCHEMA_LIMITS.NEWSLETTER_SIGNUP.USER_ID.MAX }),
  },
  (table) => [
    // Data validation constraints
    check(
      'newsletter_signups_email_not_empty',
      sql`length(trim(${table.email})) >= ${sql.raw(String(SCHEMA_LIMITS.NEWSLETTER_SIGNUP.EMAIL.MIN))}`,
    ),
    check('newsletter_signups_dates_logic', sql`${table.createdAt} <= ${table.updatedAt}`),
    check(
      'newsletter_signups_unsubscribed_after_subscribed',
      sql`${table.unsubscribedAt} IS NULL OR ${table.unsubscribedAt} >= ${table.subscribedAt}`,
    ),

    // Single column indexes
    index('newsletter_signups_user_id_idx').on(table.userId),
    index('newsletter_signups_subscribed_at_idx').on(table.subscribedAt),
    index('newsletter_signups_created_at_idx').on(table.createdAt),

    // Unique constraints
    uniqueIndex('newsletter_signups_email_unique').on(table.email),
  ],
);
