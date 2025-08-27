import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const actionTypeEnum = pgEnum('action_type', [
  'create',
  'update',
  'delete',
  'like',
  'comment',
  'follow',
  'unfollow',
  'view',
]);
export const commentPermissionEnum = pgEnum('comment_permission', ['anyone', 'followers', 'none']);
export const digestFrequencyEnum = pgEnum('digest_frequency', ['daily', 'weekly', 'monthly', 'never']);
export const dmPermissionEnum = pgEnum('dm_permission', ['anyone', 'followers', 'mutual', 'none']);
export const loginMethodEnum = pgEnum('login_method', ['email', 'facebook', 'github', 'gmail', 'google']);
export const privacyLevelEnum = pgEnum('privacy_level', ['public', 'followers', 'private']);
export const themeEnum = pgEnum('theme', ['light', 'dark', 'auto']);
export const userActivityTargetTypeEnum = pgEnum('user_activity_target_type', [
  'bobblehead',
  'collection',
  'user',
  'comment',
]);

export const USER_SETTINGS_DEFAULTS = {
  CURRENCY: 'USD',
  DEFAULT_ITEM_PRIVACY: 'public',
  LANGUAGE: 'en',
  TIMEZONE: 'UTC',
} as const;

export const deviceInfoSchema = z.object({
  browser: z.string().optional(),
  browserVersion: z.string().optional(),
  device: z.string().optional(),
  deviceType: z.enum(['desktop', 'mobile', 'tablet']).optional(),
  os: z.string().optional(),
  osVersion: z.string().optional(),
  screen: z
    .object({
      height: z.number(),
      width: z.number(),
    })
    .optional(),
});
export type DeviceInfo = z.infer<typeof deviceInfoSchema>;

export const usersSchema = pgTable(
  'users',
  {
    avatarUrl: varchar('avatar_url', { length: 100 }),
    bio: varchar('bio', { length: 500 }),
    clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
    displayName: varchar('display_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    failedLoginAttempts: integer('failed_login_attempts').default(0).notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    isDeleted: boolean('is_deleted').default(false).notNull(),
    isVerified: boolean('is_verified').default(false).notNull(),
    lastActiveAt: timestamp('last_active_at'),
    lastFailedLoginAt: timestamp('last_failed_login_at'),
    location: varchar('location', { length: 100 }),
    lockedUntil: timestamp('locked_until'),
    memberSince: timestamp('member_since').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    username: varchar('username', { length: 50 }).notNull().unique(),
  },
  (table) => [
    // single column indexes
    index('users_clerk_id_idx').on(table.clerkId),
    index('users_deleted_active_idx').on(table.isDeleted, table.lastActiveAt),
    index('users_email_idx').on(table.email),
    index('users_failed_attempts_idx').on(table.failedLoginAttempts, table.lastFailedLoginAt),
    index('users_username_idx').on(table.username),
    index('users_verified_created_idx').on(table.isVerified, table.createdAt),
  ],
);

export const userSessions = pgTable(
  'user_sessions',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deviceInfo: jsonb('device_info').$type<DeviceInfo>(),
    expiresAt: timestamp('expires_at').notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    ipAddress: varchar('ip_address', { length: 50 }),
    isActive: boolean('is_active').default(true).notNull(),
    sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
    userAgent: varchar('user_agent', { length: 1000 }),
    userId: uuid('user_id')
      .references(() => usersSchema.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    // single column indexes
    index('user_sessions_active_expires_idx').on(table.isActive, table.expiresAt),
    index('user_sessions_token_idx').on(table.sessionToken),
    index('user_sessions_user_active_idx').on(table.userId, table.isActive),
    index('user_sessions_user_id_idx').on(table.userId),
  ],
);

export const loginHistory = pgTable(
  'login_history',
  {
    deviceInfo: jsonb('device_info').$type<DeviceInfo>(),
    failureReason: varchar('failure_reason', { length: 255 }),
    id: uuid('id').primaryKey().defaultRandom(),
    ipAddress: varchar('ip_address', { length: 50 }),
    isSuccessful: boolean('is_successful').notNull(),
    loginAt: timestamp('login_at').defaultNow().notNull(),
    loginMethod: loginMethodEnum('login_method').default('email').notNull(),
    userAgent: varchar('user_agent', { length: 1000 }),
    userId: uuid('user_id')
      .references(() => usersSchema.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    // single column indexes
    index('login_history_login_at_idx').on(table.loginAt),
    index('login_history_method_time_idx').on(table.loginMethod, table.loginAt),
    index('login_history_user_success_idx').on(table.userId, table.isSuccessful),
    index('login_history_user_id_idx').on(table.userId),
  ],
);

export const userSettings = pgTable(
  'user_settings',
  {
    allowComments: commentPermissionEnum('allow_comments').default('anyone').notNull(),
    allowDirectMessages: dmPermissionEnum('allow_direct_messages').default('followers').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    currency: varchar('currency', { length: 10 }).default(USER_SETTINGS_DEFAULTS.CURRENCY).notNull(),
    defaultItemPrivacy: varchar('default_item_privacy', { length: 20 })
      .default(USER_SETTINGS_DEFAULTS.DEFAULT_ITEM_PRIVACY)
      .notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    language: varchar('language', { length: 10 }).default(USER_SETTINGS_DEFAULTS.LANGUAGE).notNull(),
    moderateComments: boolean('moderate_comments').default(false).notNull(),
    profileVisibility: privacyLevelEnum('profile_visibility').default('public').notNull(),
    showCollectionStats: boolean('show_collection_stats').default(true).notNull(),
    showCollectionValue: boolean('show_collection_value').default(false).notNull(),
    showJoinDate: boolean('show_join_date').default(true).notNull(),
    showLastActive: boolean('show_last_active').default(false).notNull(),
    showLocation: boolean('show_location').default(false).notNull(),
    showRealName: boolean('show_real_name').default(false).notNull(),
    theme: themeEnum('theme').default('light').notNull(),
    timezone: varchar('timezone', { length: 50 }).default(USER_SETTINGS_DEFAULTS.TIMEZONE).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => usersSchema.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
  },
  (table) => [
    // single column indexes
    index('user_settings_user_id_idx').on(table.userId),
  ],
);

export const notificationSettings = pgTable(
  'notification_settings',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    digestFrequency: digestFrequencyEnum('digest_frequency').default('weekly').notNull(),
    emailNewComments: boolean('email_new_comments').default(true).notNull(),
    emailNewFollowers: boolean('email_new_followers').default(true).notNull(),
    emailNewLikes: boolean('email_new_likes').default(true).notNull(),
    emailPlatformUpdates: boolean('email_platform_updates').default(true).notNull(),
    emailWeeklyDigest: boolean('email_weekly_digest').default(true).notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    inAppFollowingUpdates: boolean('in_app_following_updates').default(true).notNull(),
    inAppNewComments: boolean('in_app_new_comments').default(true).notNull(),
    inAppNewFollowers: boolean('in_app_new_followers').default(true).notNull(),
    inAppNewLikes: boolean('in_app_new_likes').default(true).notNull(),
    pushNewComments: boolean('push_new_comments').default(true).notNull(),
    pushNewFollowers: boolean('push_new_followers').default(true).notNull(),
    pushNewLikes: boolean('push_new_likes').default(false).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => usersSchema.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
  },
  (table) => [
    // single column indexes
    index('notification_settings_user_id_idx').on(table.userId),
  ],
);

export const userBlocks = pgTable(
  'user_blocks',
  {
    blockedId: uuid('blocked_id')
      .references(() => usersSchema.id, { onDelete: 'cascade' })
      .notNull(),
    blockerId: uuid('blocker_id')
      .references(() => usersSchema.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    reason: varchar('reason', { length: 100 }),
  },
  (table) => [
    // single column indexes
    index('user_blocks_blocked_id_idx').on(table.blockedId),
    index('user_blocks_blocker_id_idx').on(table.blockerId),

    // composite indexes
    uniqueIndex('user_blocks_unique').on(table.blockerId, table.blockedId),
  ],
);

export const userActivity = pgTable(
  'user_activity',
  {
    actionType: actionTypeEnum('action_type').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    ipAddress: varchar('ip_address', { length: 45 }),
    metadata: jsonb('metadata'),
    targetId: uuid('target_id'),
    targetType: userActivityTargetTypeEnum('user_activity_target_type'),
    userAgent: varchar('user_agent', { length: 1000 }),
    userId: uuid('user_id')
      .references(() => usersSchema.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    // single column indexes
    index('user_activity_action_type_idx').on(table.actionType),
    index('user_activity_created_at_idx').on(table.createdAt),
    index('user_activity_user_id_idx').on(table.userId),

    // composite indexes
    index('user_activity_target_idx').on(table.targetType, table.targetId),
  ],
);
