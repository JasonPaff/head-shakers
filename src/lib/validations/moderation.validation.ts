import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  CONTENT_REPORT_DEFAULTS,
  contentReportReason,
  contentReports,
  contentReportStatus,
  contentReportTargetType,
} from '@/lib/db/schema';

export const selectContentReportSchema = createSelectSchema(contentReports);

export const insertContentReportSchema = createInsertSchema(contentReports, {
  description: z.string().max(CONTENT_REPORT_DEFAULTS.MAX_DESCRIPTION_LENGTH).optional(),
  moderatorNotes: z.string().max(CONTENT_REPORT_DEFAULTS.MAX_MODERATOR_NOTES_LENGTH).optional(),
  reason: z.enum(contentReportReason),
  targetType: z.enum(contentReportTargetType),
}).omit({
  createdAt: true,
  id: true,
  resolvedAt: true,
  status: true,
  updatedAt: true,
});

export const updateContentReportSchema = createInsertSchema(contentReports, {
  moderatorNotes: z.string().max(CONTENT_REPORT_DEFAULTS.MAX_MODERATOR_NOTES_LENGTH).optional(),
  resolvedAt: z.date().optional(),
  status: z.enum(contentReportStatus),
})
  .pick({
    moderatorId: true,
    moderatorNotes: true,
    resolvedAt: true,
    status: true,
  })
  .partial();

export const publicContentReportSchema = selectContentReportSchema.omit({
  moderatorNotes: true,
  reporterId: true,
});

export type InsertContentReport = z.infer<typeof insertContentReportSchema>;
export type PublicContentReport = z.infer<typeof publicContentReportSchema>;
export type SelectContentReport = z.infer<typeof selectContentReportSchema>;
export type UpdateContentReport = z.infer<typeof updateContentReportSchema>;
