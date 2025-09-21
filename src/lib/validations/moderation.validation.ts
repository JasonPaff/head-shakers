import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { ENUMS, SCHEMA_LIMITS } from '@/lib/constants';
import { contentReports } from '@/lib/db/schema';

export const selectContentReportSchema = createSelectSchema(contentReports);

export const insertContentReportSchema = createInsertSchema(contentReports, {
  description: z.string().max(SCHEMA_LIMITS.CONTENT_REPORT.DESCRIPTION.MAX).optional(),
  moderatorNotes: z.string().max(SCHEMA_LIMITS.CONTENT_REPORT.MODERATOR_NOTES.MAX).optional(),
  reason: z.enum(ENUMS.CONTENT_REPORT.REASON),
  targetType: z.enum(ENUMS.CONTENT_REPORT.TARGET_TYPE),
}).omit({
  createdAt: true,
  id: true,
  resolvedAt: true,
  status: true,
  updatedAt: true,
});

export const createContentReportSchema = insertContentReportSchema.extend({
  description: z.string().optional(),
  reason: z.enum([
    'spam',
    'harassment',
    'inappropriate_content',
    'copyright_violation',
    'misinformation',
    'hate_speech',
    'violence',
    'other',
  ]),
  targetId: z.string(),
  targetType: z.enum(['bobblehead', 'collection', 'subcollection']),
});

export const checkReportStatusSchema = z.object({
  targetId: z.string(),
  targetType: z.enum(['bobblehead', 'collection', 'subcollection']),
});

export const updateContentReportSchema = createInsertSchema(contentReports, {
  moderatorNotes: z.string().max(SCHEMA_LIMITS.CONTENT_REPORT.MODERATOR_NOTES.MAX).optional(),
  resolvedAt: z.date().optional(),
  status: z.enum(ENUMS.CONTENT_REPORT.STATUS),
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
