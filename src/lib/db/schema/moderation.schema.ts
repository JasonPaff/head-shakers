import { index, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { users } from '@/lib/db/schema/users.schema';

export const contentReportStatus = ['pending', 'reviewed', 'resolved', 'dismissed'] as const;
export const contentReportTargetType = ['bobblehead', 'comment', 'user', 'collection'] as const;
export const contentReportReason = [
  'spam',
  'harassment',
  'inappropriate_content',
  'copyright_violation',
  'misinformation',
  'hate_speech',
  'violence',
  'other',
] as const;

export const CONTENT_REPORT_DEFAULTS = {
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_MODERATOR_NOTES_LENGTH: 2000,
  STATUS: 'pending',
} as const;

export const contentReportStatusEnum = pgEnum('content_report_status', contentReportStatus);
export const contentReportTargetTypeEnum = pgEnum('content_report_target_type', contentReportTargetType);
export const contentReportReasonEnum = pgEnum('content_report_reason', contentReportReason);

export const contentReports = pgTable(
  'content_reports',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: varchar('description', { length: CONTENT_REPORT_DEFAULTS.MAX_DESCRIPTION_LENGTH }),
    id: uuid('id').primaryKey().defaultRandom(),
    moderatorId: uuid('moderator_id').references(() => users.id, { onDelete: 'set null' }),
    moderatorNotes: varchar('moderator_notes'),
    reason: contentReportReasonEnum('reason').notNull(),
    reporterId: uuid('reporter_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    resolvedAt: timestamp('resolved_at'),
    status: contentReportStatusEnum('status').default('pending').notNull(),
    targetId: uuid('target_id').notNull(),
    targetType: contentReportTargetTypeEnum('target_type').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // single column indexes
    index('content_reports_created_at_idx').on(table.createdAt),
    index('content_reports_moderator_id_idx').on(table.moderatorId),
    index('content_reports_reason_idx').on(table.reason),
    index('content_reports_reporter_id_idx').on(table.reporterId),
    index('content_reports_status_idx').on(table.status),

    // composite indexes
    index('content_reports_reporter_status_idx').on(table.reporterId, table.status),
    index('content_reports_status_created_idx').on(table.status, table.createdAt),
    index('content_reports_target_idx').on(table.targetType, table.targetId),
  ],
);
