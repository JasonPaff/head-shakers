import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import type {
  featuredContentTypeEnum,
  featureTypeEnum,
  notificationRelatedTypeEnum,
  notificationTypeEnum,
  valueTypeEnum,
} from '@/lib/db/schema';

import { DEFAULTS, SCHEMA_LIMITS } from '@/lib/constants';
import { featuredContent, notifications, platformSettings } from '@/lib/db/schema';

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
  description: z.string().optional(),
  endDate: z.date().optional(),
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
  sortOrder: z.number().min(0).default(DEFAULTS.FEATURED_CONTENT.SORT_ORDER),
  startDate: z.date().optional(),
  title: z.string().min(1).max(SCHEMA_LIMITS.FEATURED_CONTENT.TITLE.MAX).optional(),
}).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
});

export const updateFeaturedContentSchema = insertFeaturedContentSchema.partial();

export const selectPlatformSettingSchema = createSelectSchema(platformSettings);
export const insertPlatformSettingSchema = createInsertSchema(platformSettings, {
  description: z.string().optional(),
  key: z
    .string()
    .min(SCHEMA_LIMITS.PLATFORM_SETTING.KEY.MIN)
    .max(SCHEMA_LIMITS.PLATFORM_SETTING.KEY.MAX)
    .regex(/^[a-zA-Z0-9_.-]+$/),
  value: z.string().optional(),
}).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
  updatedBy: true,
});

export const updatePlatformSettingSchema = insertPlatformSettingSchema.partial().omit({
  key: true,
});

export const publicNotificationSchema = selectNotificationSchema.omit({
  isEmailSent: true,
  relatedUserId: true,
});

export const publicFeaturedContentSchema = selectFeaturedContentSchema.omit({
  curatorId: true,
});

export const publicPlatformSettingSchema = selectPlatformSettingSchema
  .omit({
    createdAt: true,
    updatedAt: true,
    updatedBy: true,
  })
  .extend({
    isPublic: z.literal(DEFAULTS.PLATFORM_SETTING.IS_PUBLIC),
  });

export type ContentType = (typeof featuredContentTypeEnum.enumValues)[number];
export type FeatureType = (typeof featureTypeEnum.enumValues)[number];
export type InsertFeaturedContent = z.infer<typeof insertFeaturedContentSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];
export type PublicFeaturedContent = z.infer<typeof publicFeaturedContentSchema>;
export type PublicNotification = z.infer<typeof publicNotificationSchema>;

export type PublicPlatformSetting = z.infer<typeof publicPlatformSettingSchema>;
export type RelatedType = (typeof notificationRelatedTypeEnum.enumValues)[number];
export type SelectFeaturedContent = z.infer<typeof selectFeaturedContentSchema>;
export type SelectNotification = z.infer<typeof selectNotificationSchema>;

export type SelectPlatformSetting = z.infer<typeof selectPlatformSettingSchema>;
export type UpdateFeaturedContent = z.infer<typeof updateFeaturedContentSchema>;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;
export type UpdatePlatformSetting = z.infer<typeof updatePlatformSettingSchema>;
export type ValueType = (typeof valueTypeEnum.enumValues)[number];
