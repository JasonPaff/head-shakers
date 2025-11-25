import { sql } from 'drizzle-orm';
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

import { DEFAULTS, ENUMS, SCHEMA_LIMITS } from '@/lib/constants';

export const actionTypeEnum = pgEnum('action_type', ENUMS.USER_ACTIVITY.ACTION_TYPE);
export const commentPermissionEnum = pgEnum('comment_permission', ENUMS.USER_SETTINGS.COMMENT_PERMISSION);
export const digestFrequencyEnum = pgEnum('digest_frequency', ENUMS.USER_SETTINGS.DIGEST_FREQUENCY);
export const dmPermissionEnum = pgEnum('dm_permission', ENUMS.USER_SETTINGS.DM_PERMISSION);
export const loginMethodEnum = pgEnum('login_method', ENUMS.LOGIN.METHOD);
export const privacyLevelEnum = pgEnum('privacy_level', ENUMS.USER_SETTINGS.PRIVACY_LEVEL);
export const userRoleEnum = pgEnum('user_role', ENUMS.USER.ROLE);
export const userActivityTargetTypeEnum = pgEnum(
  'user_activity_target_type',
  ENUMS.USER_ACTIVITY.TARGET_TYPE,
);

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

export const users = pgTable(
  'users',
  {
    avatarUrl: varchar('avatar_url', { length: SCHEMA_LIMITS.USER.AVATAR_URL.MAX }),
    bio: varchar('bio', { length: SCHEMA_LIMITS.USER.BIO.MAX }),
    clerkId: varchar('clerk_id', { length: SCHEMA_LIMITS.USER.CLERK_ID.MAX }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
    displayName: varchar('display_name', { length: SCHEMA_LIMITS.USER.DISPLAY_NAME.MAX }).notNull(),
    email: varchar('email', { length: SCHEMA_LIMITS.USER.EMAIL.MAX }).notNull().unique(),
    failedLoginAttempts: integer('failed_login_attempts')
      .default(DEFAULTS.USER.FAILED_LOGIN_ATTEMPTS)
      .notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    isVerified: boolean('is_verified').default(DEFAULTS.USER.IS_VERIFIED).notNull(),
    lastActiveAt: timestamp('last_active_at'),
    lastFailedLoginAt: timestamp('last_failed_login_at'),
    location: varchar('location', { length: SCHEMA_LIMITS.USER.LOCATION.MAX }),
    lockedUntil: timestamp('locked_until'),
    memberSince: timestamp('member_since').defaultNow().notNull(),
    role: userRoleEnum('role').default(DEFAULTS.USER.ROLE).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    username: varchar('username', { length: SCHEMA_LIMITS.USER.USERNAME.MAX }).notNull().unique(),
    usernameChangedAt: timestamp('username_changed_at'),
  },
  (table) => [
    // single column indexes
    index('users_clerk_id_idx').on(table.clerkId),
    index('users_deleted_active_idx').on(table.deletedAt, table.lastActiveAt),
    index('users_email_idx').on(table.email),
    index('users_failed_attempts_idx').on(table.failedLoginAttempts, table.lastFailedLoginAt),
    index('users_role_idx').on(table.role),
    index('users_username_idx').on(table.username),
    index('users_verified_created_idx').on(table.isVerified, table.createdAt),

    // covering indexes for common queries
    // authentication query optimization - includes all fields needed for login
    index('users_auth_covering_idx').on(
      table.clerkId,
      table.id,
      table.email,
      table.isVerified,
      table.role,
      table.deletedAt,
    ),
    // user profile query optimization - includes display fields
    index('users_profile_covering_idx').on(
      table.username,
      table.id,
      table.displayName,
      table.bio,
      table.avatarUrl,
      table.isVerified,
    ),

    // performance and search indexes
    index('users_email_lower_idx').on(sql`lower(${table.email})`),
    index('users_username_lower_idx').on(sql`lower(${table.username})`),
    index('users_display_name_search_idx').using('gin', sql`${table.displayName} gin_trgm_ops`),
    index('users_bio_search_idx').using('gin', sql`${table.bio} gin_trgm_ops`),
  ],
);

export const userSessions = pgTable(
  'user_sessions',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deviceInfo: jsonb('device_info').$type<DeviceInfo>(),
    expiresAt: timestamp('expires_at').notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    ipAddress: varchar('ip_address', { length: SCHEMA_LIMITS.USER_SESSION.IP_ADDRESS.MAX }),
    isActive: boolean('is_active').default(DEFAULTS.USER_SESSION.IS_ACTIVE).notNull(),
    sessionToken: varchar('session_token', { length: SCHEMA_LIMITS.USER_SESSION.SESSION_TOKEN.MAX })
      .notNull()
      .unique(),
    userAgent: varchar('user_agent', { length: SCHEMA_LIMITS.USER_SESSION.USER_AGENT.MAX }),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
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
    failureReason: varchar('failure_reason', { length: SCHEMA_LIMITS.LOGIN_HISTORY.FAILURE_REASON.MAX }),
    id: uuid('id').primaryKey().defaultRandom(),
    ipAddress: varchar('ip_address', { length: SCHEMA_LIMITS.LOGIN_HISTORY.IP_ADDRESS.MAX }),
    isSuccessful: boolean('is_successful').notNull(),
    loginAt: timestamp('login_at').defaultNow().notNull(),
    loginMethod: loginMethodEnum('login_method').default(DEFAULTS.LOGIN_HISTORY.LOGIN_METHOD).notNull(),
    userAgent: varchar('user_agent', { length: SCHEMA_LIMITS.LOGIN_HISTORY.USER_AGENT.MAX }),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
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
    allowComments: commentPermissionEnum('allow_comments')
      .default(DEFAULTS.USER_SETTINGS.ALLOW_COMMENTS)
      .notNull(),
    allowDirectMessages: dmPermissionEnum('allow_direct_messages')
      .default(DEFAULTS.USER_SETTINGS.ALLOW_DIRECT_MESSAGES)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    currency: varchar('currency', { length: SCHEMA_LIMITS.USER_SETTINGS.CURRENCY.LENGTH })
      .default(DEFAULTS.USER.CURRENCY)
      .notNull(),
    defaultItemPrivacy: varchar('default_item_privacy', {
      length: SCHEMA_LIMITS.USER_SETTINGS.DEFAULT_ITEM_PRIVACY.MAX,
    })
      .default(DEFAULTS.USER.DEFAULT_ITEM_PRIVACY)
      .notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    language: varchar('language', { length: SCHEMA_LIMITS.USER_SETTINGS.LANGUAGE.MAX })
      .default(DEFAULTS.USER.LANGUAGE)
      .notNull(),
    moderateComments: boolean('moderate_comments')
      .default(DEFAULTS.USER_SETTINGS.IS_MODERATE_COMMENTS)
      .notNull(),
    profileVisibility: privacyLevelEnum('profile_visibility')
      .default(DEFAULTS.USER_SETTINGS.PROFILE_VISIBILITY)
      .notNull(),
    showCollectionStats: boolean('show_collection_stats')
      .default(DEFAULTS.USER_SETTINGS.IS_SHOW_COLLECTION_STATS)
      .notNull(),
    showCollectionValue: boolean('show_collection_value')
      .default(DEFAULTS.USER_SETTINGS.IS_SHOW_COLLECTION_VALUE)
      .notNull(),
    showJoinDate: boolean('show_join_date').default(DEFAULTS.USER_SETTINGS.IS_SHOW_JOIN_DATE).notNull(),
    showLastActive: boolean('show_last_active').default(DEFAULTS.USER_SETTINGS.IS_SHOW_LAST_ACTIVE).notNull(),
    showLocation: boolean('show_location').default(DEFAULTS.USER_SETTINGS.IS_SHOW_LOCATION).notNull(),
    showRealName: boolean('show_real_name').default(DEFAULTS.USER_SETTINGS.IS_SHOW_REAL_NAME).notNull(),
    timezone: varchar('timezone', { length: SCHEMA_LIMITS.USER_SETTINGS.TIMEZONE.MAX })
      .default(DEFAULTS.USER.TIMEZONE)
      .notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
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
    digestFrequency: digestFrequencyEnum('digest_frequency')
      .default(DEFAULTS.NOTIFICATION_SETTINGS.DIGEST_FREQUENCY)
      .notNull(),
    emailNewComments: boolean('email_new_comments')
      .default(DEFAULTS.NOTIFICATION_SETTINGS.IS_EMAIL_NEW_COMMENTS)
      .notNull(),
    emailNewFollowers: boolean('email_new_followers')
      .default(DEFAULTS.NOTIFICATION_SETTINGS.IS_EMAIL_NEW_FOLLOWERS)
      .notNull(),
    emailNewLikes: boolean('email_new_likes')
      .default(DEFAULTS.NOTIFICATION_SETTINGS.IS_EMAIL_NEW_LIKES)
      .notNull(),
    emailPlatformUpdates: boolean('email_platform_updates')
      .default(DEFAULTS.NOTIFICATION_SETTINGS.IS_EMAIL_PLATFORM_UPDATES)
      .notNull(),
    emailWeeklyDigest: boolean('email_weekly_digest')
      .default(DEFAULTS.NOTIFICATION_SETTINGS.IS_EMAIL_WEEKLY_DIGEST)
      .notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    inAppFollowingUpdates: boolean('in_app_following_updates')
      .default(DEFAULTS.NOTIFICATION_SETTINGS.IS_IN_APP_FOLLOWING_UPDATES)
      .notNull(),
    inAppNewComments: boolean('in_app_new_comments')
      .default(DEFAULTS.NOTIFICATION_SETTINGS.IS_IN_APP_NEW_COMMENTS)
      .notNull(),
    inAppNewFollowers: boolean('in_app_new_followers')
      .default(DEFAULTS.NOTIFICATION_SETTINGS.IS_IN_APP_NEW_FOLLOWERS)
      .notNull(),
    inAppNewLikes: boolean('in_app_new_likes')
      .default(DEFAULTS.NOTIFICATION_SETTINGS.IS_IN_APP_NEW_LIKES)
      .notNull(),
    pushNewComments: boolean('push_new_comments')
      .default(DEFAULTS.NOTIFICATION_SETTINGS.IS_PUSH_NEW_COMMENTS)
      .notNull(),
    pushNewFollowers: boolean('push_new_followers')
      .default(DEFAULTS.NOTIFICATION_SETTINGS.IS_PUSH_NEW_FOLLOWERS)
      .notNull(),
    pushNewLikes: boolean('push_new_likes')
      .default(DEFAULTS.NOTIFICATION_SETTINGS.IS_PUSH_NEW_LIKES)
      .notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
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
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    blockerId: uuid('blocker_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    reason: varchar('reason', { length: SCHEMA_LIMITS.USER_BLOCK.REASON.MAX }),
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
    ipAddress: varchar('ip_address', { length: SCHEMA_LIMITS.USER_ACTIVITY.IP_ADDRESS.MAX }),
    metadata: jsonb('metadata'),
    targetId: uuid('target_id'),
    targetType: userActivityTargetTypeEnum('user_activity_target_type'),
    userAgent: varchar('user_agent', { length: SCHEMA_LIMITS.USER_ACTIVITY.USER_AGENT.MAX }),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
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
