import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { ENUMS, SCHEMA_LIMITS } from '@/lib/constants';
import { contentReports } from '@/lib/db/schema';
import { zodMaxString } from '@/lib/utils/zod.utils';

export const selectContentReportSchema = createSelectSchema(contentReports);

export const insertContentReportSchema = createInsertSchema(contentReports, {
  description: zodMaxString({
    fieldName: 'Description',
    maxLength: SCHEMA_LIMITS.CONTENT_REPORT.DESCRIPTION.MAX,
  }),
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

export const createContentReportSchema = insertContentReportSchema
  .extend({
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
    targetType: z.enum(['bobblehead', 'collection', 'comment']),
  })
  .omit({
    reporterId: true,
  });

export const checkReportStatusSchema = z.object({
  targetId: z.string(),
  targetType: z.enum(['bobblehead', 'collection', 'comment']),
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

// Admin validation schemas
export const adminUpdateReportSchema = z.object({
  moderatorNotes: z.string().max(SCHEMA_LIMITS.CONTENT_REPORT.MODERATOR_NOTES.MAX).optional(),
  reportId: z.string(),
  status: z.enum(ENUMS.CONTENT_REPORT.STATUS),
});

export const adminBulkUpdateReportsSchema = z.object({
  moderatorNotes: z.string().max(SCHEMA_LIMITS.CONTENT_REPORT.MODERATOR_NOTES.MAX).optional(),
  reportIds: z
    .array(z.string())
    .min(1, 'At least one report must be selected')
    .max(100, 'Cannot update more than 100 reports at once'),
  status: z.enum(ENUMS.CONTENT_REPORT.STATUS),
});

export const adminReportsFilterSchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  limit: z.number().min(1).max(100).default(25).optional(),
  moderatorId: z.string().optional(),
  offset: z.number().min(0).default(0).optional(),
  reason: z
    .union([z.enum(ENUMS.CONTENT_REPORT.REASON), z.array(z.enum(ENUMS.CONTENT_REPORT.REASON))])
    .optional(),
  reporterId: z.string().optional(),
  status: z
    .union([z.enum(ENUMS.CONTENT_REPORT.STATUS), z.array(z.enum(ENUMS.CONTENT_REPORT.STATUS))])
    .optional(),
  targetType: z
    .union([
      z.enum(['bobblehead', 'collection', 'comment']),
      z.array(z.enum(['bobblehead', 'collection', 'comment'])),
    ])
    .optional(),
});

export const adminReportsQuerySchema = z.object({
  limit: z.number().min(1).max(100).default(25).optional(),
  page: z.number().min(1).default(1).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'status', 'targetType']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

// Extended schema for content reports with slug data for routing
export const selectContentReportWithSlugsSchema = selectContentReportSchema.extend({
  commentContent: z.string().nullable(),
  contentExists: z.boolean(),
  targetOwnerUsername: z.string().nullable(), // for collection owner username
  targetSlug: z.string().nullable(),
});

export type AdminBulkUpdateReports = z.infer<typeof adminBulkUpdateReportsSchema>;
export type AdminReportsFilter = z.infer<typeof adminReportsFilterSchema>;
export type AdminReportsQuery = z.infer<typeof adminReportsQuerySchema>;
export type AdminUpdateReport = z.infer<typeof adminUpdateReportSchema>;
// Type exports
export type InsertContentReport = z.infer<typeof insertContentReportSchema>;
export type PublicContentReport = z.infer<typeof publicContentReportSchema>;
export type SelectContentReport = z.infer<typeof selectContentReportSchema>;
export type SelectContentReportWithSlugs = z.infer<typeof selectContentReportWithSlugsSchema>;
export type UpdateContentReport = z.infer<typeof updateContentReportSchema>;
