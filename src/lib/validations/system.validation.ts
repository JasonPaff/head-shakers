import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import type {
  featuredContentTypeEnum,
  featureTypeEnum,
  notificationRelatedTypeEnum,
  notificationTypeEnum,
} from '@/lib/db/schema';

import { SCHEMA_LIMITS } from '@/lib/constants';
import { featuredContent, notifications } from '@/lib/db/schema';
import { zodDateString, zodInteger, zodMaxString, zodMinMaxString } from '@/lib/utils/zod.utils';

export const selectNotificationSchema = createSelectSchema(notifications);
export const insertNotificationSchema = createInsertSchema(notifications, {
  actionUrl: z.url().optional(),
  message: z.string().optional(),
  title: z.string().min(SCHEMA_LIMITS.NOTIFICATION.TITLE.MIN).max(SCHEMA_LIMITS.NOTIFICATION.TITLE.MAX),
}).omit({
  createdAt: true,
  id: true,
  readAt: true,
});

export const updateNotificationSchema = insertNotificationSchema.partial().extend({
  isRead: z.boolean().optional(),
  readAt: z.date().optional(),
});

export const selectFeaturedContentSchema = createSelectSchema(featuredContent);
export const insertFeaturedContentSchema = createInsertSchema(featuredContent, {
  contentId: z.uuid('Content is required'),
  curatorNotes: zodMaxString({
    fieldName: 'Curator Notes',
    maxLength: SCHEMA_LIMITS.FEATURED_CONTENT.CURATOR_NOTES.MAX,
  }).optional(),
  description: zodMinMaxString({
    fieldName: 'Description',
    maxLength: SCHEMA_LIMITS.FEATURED_CONTENT.DESCRIPTION.MAX,
    minLength: SCHEMA_LIMITS.FEATURED_CONTENT.DESCRIPTION.MIN,
  }),
  endDate: zodDateString({
    fieldName: 'Start Date',
    isNullable: true,
  }).optional(),
  imageUrl: z
    .string()
    .optional()
    .transform((val) => {
      // if empty or undefined, use the placeholder image
      if (!val || val.trim() === '') return '/placeholder.jpg';
      return val;
    })
    .refine(
      (val) => {
        // allow the placeholder path or valid URLs
        if (val === '/placeholder.jpg') return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Must be a valid URL or placeholder image' },
    ),
  priority: zodInteger({
    fieldName: 'Priority',
  }),
  sortOrder: zodInteger({
    fieldName: 'Sort Order',
  }),
  startDate: zodDateString({
    fieldName: 'Start Date',
    isNullable: true,
  }).optional(),
  title: zodMinMaxString({
    fieldName: 'Description',
    maxLength: SCHEMA_LIMITS.FEATURED_CONTENT.TITLE.MAX,
    minLength: SCHEMA_LIMITS.FEATURED_CONTENT.TITLE.MIN,
  }),
}).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
});

export const updateFeaturedContentSchema = insertFeaturedContentSchema.partial();

export const publicNotificationSchema = selectNotificationSchema.omit({
  isEmailSent: true,
  relatedUserId: true,
});

export const publicFeaturedContentSchema = selectFeaturedContentSchema.omit({
  curatorId: true,
});

export type ContentType = (typeof featuredContentTypeEnum.enumValues)[number];
export type FeatureType = (typeof featureTypeEnum.enumValues)[number];
export type InsertFeaturedContent = z.infer<typeof insertFeaturedContentSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];
export type PublicFeaturedContent = z.infer<typeof publicFeaturedContentSchema>;
export type PublicNotification = z.infer<typeof publicNotificationSchema>;
export type RelatedType = (typeof notificationRelatedTypeEnum.enumValues)[number];
export type SelectFeaturedContent = z.infer<typeof selectFeaturedContentSchema>;
export type SelectNotification = z.infer<typeof selectNotificationSchema>;
export type UpdateFeaturedContent = z.infer<typeof updateFeaturedContentSchema>;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;
