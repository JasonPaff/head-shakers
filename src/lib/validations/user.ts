import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import {
  loginHistory,
  notificationSettings,
  userActivity,
  userBlocks,
  users,
  userSessions,
  userSettings,
} from '@/lib/db/schema';

export const selectUserSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users, {
  bio: z.string().max(500).optional(),
  displayName: z.string().min(1).max(100),
  email: z.email(),
  location: z.string().max(100).optional(),
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/),
}).omit({
  clerkId: true,
  createdAt: true,
  deletedAt: true,
  failedLoginAttempts: true,
  id: true,
  isDeleted: true,
  isVerified: true,
  lastActiveAt: true,
  lastFailedLoginAt: true,
  lockedUntil: true,
  memberSince: true,
  updatedAt: true,
});

export const updateUserSchema = insertUserSchema.partial();

export const selectUserSessionSchema = createSelectSchema(userSessions);
export const insertUserSessionSchema = createInsertSchema(userSessions, {
  ipAddress: z.ipv6().optional(),
  sessionToken: z.string().min(1).max(255),
  userAgent: z.string().max(1000).optional(),
}).omit({
  createdAt: true,
  id: true,
  userId: true,
});

export const updateUserSessionSchema = insertUserSessionSchema.partial();

export const selectLoginHistorySchema = createSelectSchema(loginHistory);
export const insertLoginHistorySchema = createInsertSchema(loginHistory, {
  failureReason: z.string().max(255).optional(),
  ipAddress: z.ipv6().optional(),
  userAgent: z.string().max(1000).optional(),
}).omit({
  id: true,
  loginAt: true,
  userId: true,
});

export const selectUserSettingsSchema = createSelectSchema(userSettings);
export const insertUserSettingsSchema = createInsertSchema(userSettings, {
  currency: z.string().length(3),
  language: z.string().min(2).max(10),
  timezone: z.string().min(3).max(50),
}).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
  userId: true,
});

export const updateUserSettingsSchema = insertUserSettingsSchema.partial();

export const selectNotificationSettingsSchema = createSelectSchema(notificationSettings);
export const insertNotificationSettingsSchema = createInsertSchema(notificationSettings).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
  userId: true,
});

export const updateNotificationSettingsSchema = insertNotificationSettingsSchema.partial();

export const selectUserBlockSchema = createSelectSchema(userBlocks);
export const insertUserBlockSchema = createInsertSchema(userBlocks, {
  reason: z.string().max(100).optional(),
}).omit({
  blockerId: true,
  createdAt: true,
  id: true,
});

export const selectUserActivitySchema = createSelectSchema(userActivity);
export const insertUserActivitySchema = createInsertSchema(userActivity, {
  ipAddress: z.ipv6().optional(),
}).omit({
  createdAt: true,
  id: true,
  userId: true,
});

export type InsertLoginHistory = z.infer<typeof insertLoginHistorySchema>;
export type InsertNotificationSettings = z.infer<typeof insertNotificationSettingsSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;
export type InsertUserBlock = z.infer<typeof insertUserBlockSchema>;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type SelectLoginHistory = z.infer<typeof selectLoginHistorySchema>;

export type SelectNotificationSettings = z.infer<typeof selectNotificationSettingsSchema>;
export type SelectUser = z.infer<typeof selectUserSchema>;
export type SelectUserActivity = z.infer<typeof selectUserActivitySchema>;

export type SelectUserBlock = z.infer<typeof selectUserBlockSchema>;
export type SelectUserSession = z.infer<typeof selectUserSessionSchema>;
export type SelectUserSettings = z.infer<typeof selectUserSettingsSchema>;

export type UpdateNotificationSettings = z.infer<typeof updateNotificationSettingsSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type UpdateUserSession = z.infer<typeof updateUserSessionSchema>;
export type UpdateUserSettings = z.infer<typeof updateUserSettingsSchema>;
