import { index, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { DEFAULTS, ENUMS, SCHEMA_LIMITS } from '@/lib/constants';
import { users } from '@/lib/db/schema/users.schema';

export const contentReportStatusEnum = pgEnum('content_report_status', ENUMS.CONTENT_REPORT.STATUS);
export const contentReportTargetTypeEnum = pgEnum(
  'content_report_target_type',
  ENUMS.CONTENT_REPORT.TARGET_TYPE,
);
export const contentReportReasonEnum = pgEnum('content_report_reason', ENUMS.CONTENT_REPORT.REASON);

export const contentReports = pgTable(
  'content_reports',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: varchar('description', { length: SCHEMA_LIMITS.CONTENT_REPORT.DESCRIPTION.MAX }),
    id: uuid('id').primaryKey().defaultRandom(),
    moderatorId: uuid('moderator_id').references(() => users.id, { onDelete: 'set null' }),
    moderatorNotes: varchar('moderator_notes', { length: SCHEMA_LIMITS.CONTENT_REPORT.MODERATOR_NOTES.MAX }),
    reason: contentReportReasonEnum('reason').notNull(),
    reporterId: uuid('reporter_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    resolvedAt: timestamp('resolved_at'),
    status: contentReportStatusEnum('status').default(DEFAULTS.CONTENT_REPORT.STATUS).notNull(),
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
