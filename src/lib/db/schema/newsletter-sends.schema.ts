import { sql } from 'drizzle-orm';
import { check, index, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { SCHEMA_LIMITS } from '@/lib/constants';
import { newsletterTemplates } from '@/lib/db/schema/newsletter-templates.schema';

/**
 * Newsletter sends table for tracking newsletter send history and delivery status.
 *
 * Design decisions:
 * - Uses UUID primary key (project convention)
 * - templateId is optional reference to newsletterTemplates (nullable for one-off sends)
 * - subject stores the actual subject used for the send (may differ from template)
 * - bodyHtml stores the actual HTML content sent (preserves what was sent)
 * - sentAt tracks when the newsletter was sent
 * - sentBy references Clerk user ID (varchar to match Clerk ID format)
 * - recipientCount tracks total number of recipients
 * - successCount tracks successful deliveries
 * - failureCount tracks failed deliveries
 * - status tracks overall send status (pending, sending, completed, failed)
 * - errorDetails stores error information for failed sends (nullable)
 * - Check constraints ensure valid status values and non-negative counts
 * - Indexes on sentAt, sentBy, and status for efficient queries
 * - Standard audit timestamps (createdAt, updatedAt)
 */
export const newsletterSends = pgTable(
  'newsletter_sends',
  {
    bodyHtml: text('body_html').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    errorDetails: text('error_details'),
    failureCount: integer('failure_count').notNull().default(0),
    id: uuid('id').primaryKey().defaultRandom(),
    recipientCount: integer('recipient_count').notNull(),
    sentAt: timestamp('sent_at').notNull(),
    sentBy: varchar('sent_by', { length: SCHEMA_LIMITS.NEWSLETTER_SIGNUP.USER_ID.MAX }).notNull(),
    status: varchar('status', { length: 20 }).notNull(),
    subject: varchar('subject', { length: SCHEMA_LIMITS.NEWSLETTER_SIGNUP.EMAIL.MAX }).notNull(),
    successCount: integer('success_count').notNull().default(0),
    templateId: uuid('template_id').references(() => newsletterTemplates.id, { onDelete: 'set null' }),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // Data validation constraints
    check('newsletter_sends_subject_not_empty', sql`length(trim(${table.subject})) > 0`),
    check('newsletter_sends_body_html_not_empty', sql`length(trim(${table.bodyHtml})) > 0`),
    check(
      'newsletter_sends_status_valid',
      sql`${table.status} IN ('pending', 'sending', 'completed', 'failed')`,
    ),
    check('newsletter_sends_recipient_count_non_negative', sql`${table.recipientCount} >= 0`),
    check('newsletter_sends_success_count_non_negative', sql`${table.successCount} >= 0`),
    check('newsletter_sends_failure_count_non_negative', sql`${table.failureCount} >= 0`),
    check(
      'newsletter_sends_counts_sum_valid',
      sql`${table.successCount} + ${table.failureCount} <= ${table.recipientCount}`,
    ),
    check('newsletter_sends_dates_logic', sql`${table.createdAt} <= ${table.updatedAt}`),
    check('newsletter_sends_sent_after_created', sql`${table.sentAt} >= ${table.createdAt}`),

    // Single column indexes
    index('newsletter_sends_sent_at_idx').on(table.sentAt),
    index('newsletter_sends_sent_by_idx').on(table.sentBy),
    index('newsletter_sends_status_idx').on(table.status),
    index('newsletter_sends_template_id_idx').on(table.templateId),

    // Composite indexes for common queries
    index('newsletter_sends_status_sent_at_idx').on(table.status, table.sentAt),
    index('newsletter_sends_sent_by_sent_at_idx').on(table.sentBy, table.sentAt),
  ],
);
