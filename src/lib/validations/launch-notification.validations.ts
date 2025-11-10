import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { SCHEMA_LIMITS } from '@/lib/constants';
import { launchNotifications } from '@/lib/db/schema';

export const selectLaunchNotificationSchema = createSelectSchema(launchNotifications);
export const insertLaunchNotificationSchema = createInsertSchema(launchNotifications, {
  email: z.email().max(SCHEMA_LIMITS.USER.EMAIL.MAX),
}).omit({
  createdAt: true,
  id: true,
  notifiedAt: true,
});

export const addToWaitlistSchema = z.object({
  email: z.email('Please enter a valid email address').max(SCHEMA_LIMITS.USER.EMAIL.MAX, {
    message: `Email must be at most ${SCHEMA_LIMITS.USER.EMAIL.MAX} characters`,
  }),
});

export type AddToWaitlist = z.infer<typeof addToWaitlistSchema>;
export type InsertLaunchNotification = z.infer<typeof insertLaunchNotificationSchema>;
export type SelectLaunchNotification = z.infer<typeof selectLaunchNotificationSchema>;
