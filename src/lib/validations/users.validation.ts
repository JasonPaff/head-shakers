import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { SCHEMA_LIMITS } from '@/lib/constants';
import { isReservedUsername } from '@/lib/constants/reserved-usernames';
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
  bio: z.string().max(SCHEMA_LIMITS.USER.BIO.MAX).optional(),
  displayName: z.string().min(SCHEMA_LIMITS.USER.DISPLAY_NAME.MIN).max(SCHEMA_LIMITS.USER.DISPLAY_NAME.MAX),
  email: z.email().max(SCHEMA_LIMITS.USER.EMAIL.MAX),
  location: z.string().max(SCHEMA_LIMITS.USER.LOCATION.MAX).optional(),
  username: z
    .string()
    .min(SCHEMA_LIMITS.USER.USERNAME.MIN)
    .max(SCHEMA_LIMITS.USER.USERNAME.MAX)
    .regex(/^[a-zA-Z0-9_]+$/),
}).omit({
  clerkId: true,
  createdAt: true,
  deletedAt: true,
  failedLoginAttempts: true,
  id: true,
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
  ipAddress: z.string().max(SCHEMA_LIMITS.USER_SESSION.IP_ADDRESS.MAX).optional(),
  sessionToken: z.string().min(1).max(SCHEMA_LIMITS.USER_SESSION.SESSION_TOKEN.MAX),
  userAgent: z.string().max(SCHEMA_LIMITS.USER_SESSION.USER_AGENT.MAX).optional(),
}).omit({
  createdAt: true,
  id: true,
  userId: true,
});

export const updateUserSessionSchema = insertUserSessionSchema.partial();

export const selectLoginHistorySchema = createSelectSchema(loginHistory);
export const insertLoginHistorySchema = createInsertSchema(loginHistory, {
  failureReason: z.string().max(SCHEMA_LIMITS.LOGIN_HISTORY.FAILURE_REASON.MAX).optional(),
  ipAddress: z.string().max(SCHEMA_LIMITS.LOGIN_HISTORY.IP_ADDRESS.MAX).optional(),
  userAgent: z.string().max(SCHEMA_LIMITS.LOGIN_HISTORY.USER_AGENT.MAX).optional(),
}).omit({
  id: true,
  loginAt: true,
  userId: true,
});

export const selectUserSettingsSchema = createSelectSchema(userSettings);
export const insertUserSettingsSchema = createInsertSchema(userSettings, {
  currency: z.string().length(SCHEMA_LIMITS.USER_SETTINGS.CURRENCY.LENGTH),
  language: z
    .string()
    .min(SCHEMA_LIMITS.USER_SETTINGS.LANGUAGE.MIN)
    .max(SCHEMA_LIMITS.USER_SETTINGS.LANGUAGE.MAX),
  timezone: z
    .string()
    .min(SCHEMA_LIMITS.USER_SETTINGS.TIMEZONE.MIN)
    .max(SCHEMA_LIMITS.USER_SETTINGS.TIMEZONE.MAX),
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
  reason: z.string().max(SCHEMA_LIMITS.USER_BLOCK.REASON.MAX).optional(),
}).omit({
  blockerId: true,
  createdAt: true,
  id: true,
});

export const selectUserActivitySchema = createSelectSchema(userActivity);
export const insertUserActivitySchema = createInsertSchema(userActivity, {
  ipAddress: z.string().max(SCHEMA_LIMITS.USER_ACTIVITY.IP_ADDRESS.MAX).optional(),
}).omit({
  createdAt: true,
  id: true,
  userId: true,
});

/**
 * Schema for checking username availability
 */
export const checkUsernameAvailabilitySchema = z.object({
  username: z
    .string()
    .min(SCHEMA_LIMITS.USER.USERNAME.MIN, {
      message: `Username must be at least ${SCHEMA_LIMITS.USER.USERNAME.MIN} characters`,
    })
    .max(SCHEMA_LIMITS.USER.USERNAME.MAX, {
      message: `Username must be at most ${SCHEMA_LIMITS.USER.USERNAME.MAX} characters`,
    })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores',
    })
    .refine((username) => !isReservedUsername(username), {
      message: 'This username is reserved and cannot be used',
    }),
});

/**
 * Schema for updating username
 */
export const updateUsernameSchema = z.object({
  username: z
    .string()
    .min(SCHEMA_LIMITS.USER.USERNAME.MIN, {
      message: `Username must be at least ${SCHEMA_LIMITS.USER.USERNAME.MIN} characters`,
    })
    .max(SCHEMA_LIMITS.USER.USERNAME.MAX, {
      message: `Username must be at most ${SCHEMA_LIMITS.USER.USERNAME.MAX} characters`,
    })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores',
    })
    .refine((username) => !isReservedUsername(username), {
      message: 'This username is reserved and cannot be used',
    }),
});

export type CheckUsernameAvailability = z.infer<typeof checkUsernameAvailabilitySchema>;
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
export type UpdateUsername = z.infer<typeof updateUsernameSchema>;

export type UpdateUserSession = z.infer<typeof updateUserSessionSchema>;
export type UpdateUserSettings = z.infer<typeof updateUserSettingsSchema>;
