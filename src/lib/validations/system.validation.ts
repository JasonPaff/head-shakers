import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import type {
  featuredContentTypeEnum,
  featureTypeEnum,
  notificationRelatedTypeEnum,
  notificationTypeEnum,
  valueTypeEnum,
} from '@/lib/db/schema';

import { FEATURED_CONTENT_DEFAULTS, featuredContent, notifications, platformSettings } from '@/lib/db/schema';

export const selectNotificationSchema = createSelectSchema(notifications);
export const insertNotificationSchema = createInsertSchema(notifications, {
  actionUrl: z.url().optional(),
  message: z.string().optional(),
  title: z.string().min(1).max(255),
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
  imageUrl: z.url().optional(),
  sortOrder: z.number().min(0).default(FEATURED_CONTENT_DEFAULTS.SORT_ORDER),
  startDate: z.date().optional(),
  title: z.string().min(1).max(255).optional(),
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
    .min(1)
    .max(100)
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
    isPublic: z.literal(true),
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
