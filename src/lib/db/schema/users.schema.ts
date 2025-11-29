import { sql } from 'drizzle-orm';
import { boolean, index, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { DEFAULTS, ENUMS, SCHEMA_LIMITS } from '@/lib/constants';

export const commentPermissionEnum = pgEnum('comment_permission', ENUMS.USER_SETTINGS.COMMENT_PERMISSION);
export const privacyLevelEnum = pgEnum('privacy_level', ENUMS.USER_SETTINGS.PRIVACY_LEVEL);
export const userRoleEnum = pgEnum('user_role', ENUMS.USER.ROLE);

export const users = pgTable(
  'users',
  {
    avatarUrl: varchar('avatar_url', { length: SCHEMA_LIMITS.USER.AVATAR_URL.MAX }),
    bio: varchar('bio', { length: SCHEMA_LIMITS.USER.BIO.MAX }),
    clerkId: varchar('clerk_id', { length: SCHEMA_LIMITS.USER.CLERK_ID.MAX }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
    email: varchar('email', { length: SCHEMA_LIMITS.USER.EMAIL.MAX }).notNull().unique(),
    id: uuid('id').primaryKey().defaultRandom(),
    lastActiveAt: timestamp('last_active_at'),
    location: varchar('location', { length: SCHEMA_LIMITS.USER.LOCATION.MAX }),
    lockedUntil: timestamp('locked_until'),
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
    index('users_role_idx').on(table.role),
    index('users_username_idx').on(table.username),

    // covering indexes for common queries
    // authentication query optimization - includes all fields needed for login
    index('users_auth_covering_idx').on(table.clerkId, table.id, table.email, table.role, table.deletedAt),
    // user profile query optimization - includes display fields
    index('users_profile_covering_idx').on(table.username, table.id, table.bio, table.avatarUrl),

    // performance and search indexes
    index('users_email_lower_idx').on(sql`lower(${table.email})`),
    index('users_username_lower_idx').on(sql`lower(${table.username})`),
    index('users_username_search_idx').using('gin', sql`${table.username} gin_trgm_ops`),
    index('users_bio_search_idx').using('gin', sql`${table.bio} gin_trgm_ops`),
  ],
);

export const userSettings = pgTable(
  'user_settings',
  {
    allowComments: commentPermissionEnum('allow_comments')
      .default(DEFAULTS.USER_SETTINGS.ALLOW_COMMENTS)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    language: varchar('language', { length: SCHEMA_LIMITS.USER_SETTINGS.LANGUAGE.MAX })
      .default(DEFAULTS.USER.LANGUAGE)
      .notNull(),
    profileVisibility: privacyLevelEnum('profile_visibility')
      .default(DEFAULTS.USER_SETTINGS.PROFILE_VISIBILITY)
      .notNull(),
    showLocation: boolean('show_location').default(DEFAULTS.USER_SETTINGS.IS_SHOW_LOCATION).notNull(),
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
