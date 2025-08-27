import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { DEFAULTS, ENUMS, SCHEMA_LIMITS } from '@/lib/constants';
import { users } from '@/lib/db/schema/users.schema';

export const commentTargetTypeEnum = pgEnum('comment_target_type', ENUMS.COMMENT.TARGET_TYPE);
export const followTypeEnum = pgEnum('follow_type', ENUMS.FOLLOW.TYPE);
export const likeTargetTypeEnum = pgEnum('like_target_type', ENUMS.LIKE.TARGET_TYPE);

export const follows = pgTable(
  'follows',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    followerId: uuid('follower_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    followingId: uuid('following_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    followType: followTypeEnum('follow_type').default(DEFAULTS.FOLLOW.TYPE).notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    targetId: uuid('target_id'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // single column indexes
    index('follows_follower_id_idx').on(table.followerId),
    index('follows_following_id_idx').on(table.followingId),
    index('follows_target_id_idx').on(table.targetId),
    index('follows_created_at_idx').on(table.createdAt),

    // composite indexes
    index('follows_follower_type_idx').on(table.followerId, table.followType),
    index('follows_following_type_idx').on(table.followingId, table.followType),

    // unique constraints
    uniqueIndex('follows_unique').on(table.followerId, table.followingId, table.followType, table.targetId),

    // check constraints
    check('follows_no_self_follow', sql`${table.followerId} != ${table.followingId}`),
  ],
);

export const likes = pgTable(
  'likes',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    targetId: uuid('target_id').notNull(),
    targetType: likeTargetTypeEnum('like_target_type').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    // single column indexes
    index('likes_user_id_idx').on(table.userId),
    index('likes_target_id_idx').on(table.targetId),
    index('likes_created_at_idx').on(table.createdAt),

    // composite indexes
    index('likes_target_idx').on(table.targetType, table.targetId),
    index('likes_user_created_idx').on(table.userId, table.createdAt),

    // unique constraints
    uniqueIndex('likes_unique').on(table.userId, table.targetType, table.targetId),
  ],
);

export const comments = pgTable(
  'comments',
  {
    content: varchar('content', { length: SCHEMA_LIMITS.COMMENT.CONTENT.MAX }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
    editedAt: timestamp('edited_at'),
    id: uuid('id').primaryKey().defaultRandom(),
    isDeleted: boolean('is_deleted').default(DEFAULTS.COMMENT.IS_DELETED).notNull(),
    isEdited: boolean('is_edited').default(DEFAULTS.COMMENT.IS_EDITED).notNull(),
    likeCount: integer('like_count').default(DEFAULTS.COMMENT.LIKE_COUNT).notNull(),
    parentCommentId: uuid('parent_comment_id'),
    targetId: uuid('target_id').notNull(),
    targetType: commentTargetTypeEnum('comment_target_type').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    // single column indexes
    index('comments_user_id_idx').on(table.userId),
    index('comments_created_at_idx').on(table.createdAt),
    index('comments_parent_comment_id_idx').on(table.parentCommentId),
    index('comments_target_id_idx').on(table.targetId),

    // composite indexes
    index('comments_target_idx').on(table.targetType, table.targetId),
    index('comments_user_created_idx').on(table.userId, table.createdAt),
    index('comments_deleted_created_idx').on(table.isDeleted, table.createdAt),
    index('comments_target_deleted_idx').on(table.targetType, table.targetId, table.isDeleted),

    // check constraints
    check('comments_content_not_empty', sql`length(trim(${table.content})) > 0`),
    check('comments_like_count_non_negative', sql`${table.likeCount} >= 0`),
  ],
);
