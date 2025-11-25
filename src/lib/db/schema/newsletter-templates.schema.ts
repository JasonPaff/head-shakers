import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { SCHEMA_LIMITS } from '@/lib/constants';

/**
 * Newsletter templates table for storing reusable newsletter templates.
 *
 * Design decisions:
 * - Uses UUID primary key (project convention)
 * - Stores both HTML and Markdown versions for flexibility
 * - createdBy references Clerk user ID (varchar to match Clerk ID format)
 * - Standard audit timestamps (createdAt, updatedAt)
 * - Check constraints ensure non-empty title and subject
 * - Indexes on createdAt and createdBy for efficient queries
 */
export const newsletterTemplates = pgTable(
  'newsletter_templates',
  {
    bodyHtml: text('body_html').notNull(),
    bodyMarkdown: text('body_markdown').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    createdBy: varchar('created_by', { length: SCHEMA_LIMITS.NEWSLETTER_SIGNUP.USER_ID.MAX }).notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    subject: varchar('subject', { length: SCHEMA_LIMITS.NEWSLETTER_SIGNUP.EMAIL.MAX }).notNull(),
    title: varchar('title', { length: SCHEMA_LIMITS.FEATURED_CONTENT.TITLE.MAX }).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // Data validation constraints
    check('newsletter_templates_title_not_empty', sql`length(trim(${table.title})) > 0`),
    check('newsletter_templates_subject_not_empty', sql`length(trim(${table.subject})) > 0`),
    check('newsletter_templates_dates_logic', sql`${table.createdAt} <= ${table.updatedAt}`),

    // Single column indexes
    index('newsletter_templates_created_at_idx').on(table.createdAt),
    index('newsletter_templates_created_by_idx').on(table.createdBy),
  ],
);
