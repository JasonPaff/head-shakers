import { z } from 'zod';

import { DEFAULTS } from '@/lib/constants';
import {
  insertFeaturedContentSchema,
  updateFeaturedContentSchema,
} from '@/lib/validations/system.validation';

export const adminCreateFeaturedContentSchema = insertFeaturedContentSchema.extend({
  curatorNotes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  priority: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      return isNaN(num) ? DEFAULTS.FEATURED_CONTENT.SORT_ORDER : num;
    })
    .pipe(z.number().int().min(0))
    .default(0),
  sortOrder: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      return isNaN(num) ? DEFAULTS.FEATURED_CONTENT.SORT_ORDER : num;
    })
    .pipe(z.number().int().min(0)),
  viewCount: z.number().int().min(0).default(DEFAULTS.SYSTEM.CONTENT_METRIC_VIEW_COUNT),
});

export const adminUpdateFeaturedContentSchema = updateFeaturedContentSchema.extend({
  curatorNotes: z.string().optional(),
  id: z.string().uuid('ID must be a valid UUID'),
  metadata: z.record(z.string(), z.unknown()).optional(),
  priority: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      return isNaN(num) ? DEFAULTS.FEATURED_CONTENT.SORT_ORDER : num;
    })
    .pipe(z.number().int().min(0))
    .optional(),
  sortOrder: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      return isNaN(num) ? DEFAULTS.FEATURED_CONTENT.SORT_ORDER : num;
    })
    .pipe(z.number().int().min(0))
    .optional(),
  viewCount: z.number().int().min(0).optional(),
});

export const adminDeleteFeaturedContentSchema = z.object({
  id: z.string().uuid('ID must be a valid UUID'),
});

export const adminToggleFeaturedContentStatusSchema = z.object({
  id: z.string().uuid('ID must be a valid UUID'),
  isActive: z.boolean(),
});

export const adminGetFeaturedContentByIdSchema = z.object({
  id: z.string().uuid('ID must be a valid UUID'),
});

export type AdminCreateFeaturedContent = z.infer<typeof adminCreateFeaturedContentSchema>;
export type AdminDeleteFeaturedContent = z.infer<typeof adminDeleteFeaturedContentSchema>;
export type AdminGetFeaturedContentById = z.infer<typeof adminGetFeaturedContentByIdSchema>;
export type AdminToggleFeaturedContentStatus = z.infer<typeof adminToggleFeaturedContentStatusSchema>;
export type AdminUpdateFeaturedContent = z.infer<typeof adminUpdateFeaturedContentSchema>;
