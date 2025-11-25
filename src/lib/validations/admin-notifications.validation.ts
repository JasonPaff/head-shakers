import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { DEFAULTS, ENUMS, SCHEMA_LIMITS } from '@/lib/constants';
import { notifications } from '@/lib/db/schema';
import { zodMaxString, zodMinMaxString } from '@/lib/utils/zod.utils';

// Type exports first for better IDE support
export type CreateNotification = z.infer<typeof createNotificationSchema>;
export type CreateNotificationInput = z.input<typeof createNotificationSchema>;
export type GetNotifications = z.infer<typeof getNotificationsSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type MarkNotificationAsRead = z.infer<typeof markNotificationAsReadSchema>;
export type PublicNotification = z.infer<typeof publicNotificationSchema>;
export type SelectNotification = z.infer<typeof selectNotificationSchema>;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;

// Select schema (from database)
export const selectNotificationSchema = createSelectSchema(notifications);

// Insert schema (for creating new records)
export const insertNotificationSchema = createInsertSchema(notifications, {
  actionUrl: zodMaxString({
    fieldName: 'Action URL',
    maxLength: 2048,
  }).optional(),
  isEmailSent: z.boolean().default(DEFAULTS.NOTIFICATION.IS_EMAIL_SENT),
  isRead: z.boolean().default(DEFAULTS.NOTIFICATION.IS_READ),
  message: zodMaxString({
    fieldName: 'Message',
    maxLength: 5000,
  }).optional(),
  relatedId: z.uuid('Invalid related ID').optional(),
  relatedType: z.enum(ENUMS.NOTIFICATION.RELATED_TYPE).optional(),
  relatedUserId: z.uuid('Invalid related user ID').optional(),
  title: zodMinMaxString({
    fieldName: 'Title',
    maxLength: SCHEMA_LIMITS.NOTIFICATION.TITLE.MAX,
    minLength: SCHEMA_LIMITS.NOTIFICATION.TITLE.MIN,
  }),
  type: z.enum(ENUMS.NOTIFICATION.TYPE),
}).omit({
  createdAt: true,
  id: true,
  readAt: true,
  updatedAt: true,
  userId: true,
});

// Update schema (extends insert with ID)
export const updateNotificationSchema = insertNotificationSchema.partial().extend({
  id: z.uuid({ message: 'Notification ID is required' }),
});

// Public schema (for API responses)
export const publicNotificationSchema = selectNotificationSchema.omit({
  updatedAt: true,
});

// Action-specific schemas

/**
 * Schema for creating a notification
 * Requires all fields except auto-generated ones
 */
export const createNotificationSchema = insertNotificationSchema.extend({
  userId: z.uuid('User ID is required'),
});

/**
 * Schema for marking a notification as read
 * Only requires notification ID and updates read status
 */
export const markNotificationAsReadSchema = z.object({
  notificationId: z.uuid('Notification ID is required'),
});

/**
 * Schema for marking multiple notifications as read
 */
export const markMultipleNotificationsAsReadSchema = z.object({
  notificationIds: z
    .array(z.uuid('Invalid notification ID'))
    .min(1, 'At least one notification ID is required'),
});

/**
 * Schema for querying notifications with filters
 */
export const getNotificationsSchema = z.object({
  isRead: z.boolean().optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(DEFAULTS.PAGINATION.MAX_LIMIT, `Maximum limit is ${DEFAULTS.PAGINATION.MAX_LIMIT}`)
    .default(DEFAULTS.PAGINATION.LIMIT)
    .optional(),
  offset: z.coerce.number().int().min(0).default(DEFAULTS.PAGINATION.OFFSET).optional(),
  type: z.enum(ENUMS.NOTIFICATION.TYPE).optional(),
  userId: z.uuid('User ID is required'),
});

/**
 * Schema for deleting a notification
 */
export const deleteNotificationSchema = z.object({
  notificationId: z.uuid('Notification ID is required'),
});
