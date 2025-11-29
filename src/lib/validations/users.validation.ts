import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { SCHEMA_LIMITS } from '@/lib/constants';
import { isReservedUsername } from '@/lib/constants/reserved-usernames';
import { userBlocks, users, userSettings } from '@/lib/db/schema';

export const selectUserSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users, {
  bio: z.string().max(SCHEMA_LIMITS.USER.BIO.MAX).optional(),
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
  id: true,
  lastActiveAt: true,
  lockedUntil: true,
  updatedAt: true,
});

export const updateUserSchema = insertUserSchema.partial();

export const selectUserSettingsSchema = createSelectSchema(userSettings);
export const insertUserSettingsSchema = createInsertSchema(userSettings, {
  language: z
    .string()
    .min(SCHEMA_LIMITS.USER_SETTINGS.LANGUAGE.MIN)
    .max(SCHEMA_LIMITS.USER_SETTINGS.LANGUAGE.MAX),
}).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
  userId: true,
});

export const updateUserSettingsSchema = insertUserSettingsSchema.partial();

export const selectUserBlockSchema = createSelectSchema(userBlocks);
export const insertUserBlockSchema = createInsertSchema(userBlocks, {
  reason: z.string().max(SCHEMA_LIMITS.USER_BLOCK.REASON.MAX).optional(),
}).omit({
  blockerId: true,
  createdAt: true,
  id: true,
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
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserBlock = z.infer<typeof insertUserBlockSchema>;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type SelectUser = z.infer<typeof selectUserSchema>;
export type SelectUserBlock = z.infer<typeof selectUserBlockSchema>;
export type SelectUserSettings = z.infer<typeof selectUserSettingsSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UpdateUsername = z.infer<typeof updateUsernameSchema>;
export type UpdateUserSettings = z.infer<typeof updateUserSettingsSchema>;
