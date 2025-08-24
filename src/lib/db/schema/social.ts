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
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { users } from '@/lib/db/schema/users';

const commentType = ['bobblehead', 'collection'] as const;
const followType = ['user', 'collection'] as const;
const likeType = ['bobblehead', 'collection', 'comment'] as const;

export const commentTypeEnum = pgEnum('target_type', commentType);
export const followTypeEnum = pgEnum('follow_type', followType);
export const likeTypeEnum = pgEnum('target_type', likeType);

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
    followType: followTypeEnum('follow_type').default('user').notNull(),
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
  ],
);

export const likes = pgTable(
  'likes',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    targetId: uuid('target_id').notNull(),
    targetType: likeTypeEnum('target_type').notNull(),
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
    content: varchar('content', { length: 5000 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
    editedAt: timestamp('edited_at'),
    id: uuid('id').primaryKey().defaultRandom(),
    isDeleted: boolean('is_deleted').default(false).notNull(),
    isEdited: boolean('is_edited').default(false).notNull(),
    likeCount: integer('like_count').default(0).notNull(),
    parentCommentId: uuid('parent_comment_id'),
    targetId: uuid('target_id').notNull(),
    targetType: commentTypeEnum('target_type').notNull(),
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

export const selectFollowSchema = createSelectSchema(follows);
export const insertFollowSchema = createInsertSchema(follows, {
  followType: z.enum(followType).default('user'),
}).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
});
export const updateFollowSchema = insertFollowSchema.partial();

export const selectLikeSchema = createSelectSchema(likes);
export const insertLikeSchema = createInsertSchema(likes, {
  targetType: z.enum(likeType),
}).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
});
export const updateLikeSchema = insertLikeSchema.partial();

export const selectCommentSchema = createSelectSchema(comments);
export const insertCommentSchema = createInsertSchema(comments, {
  content: z
    .string()
    .min(1)
    .max(5000)
    .transform((val) => val.trim()),
  likeCount: z.number().min(0).default(0),
  targetType: z.enum(commentType),
}).omit({
  createdAt: true,
  deletedAt: true,
  editedAt: true,
  id: true,
  isDeleted: true,
  isEdited: true,
  likeCount: true,
  updatedAt: true,
});
export const updateCommentSchema = insertCommentSchema
  .pick({
    content: true,
  })
  .extend({
    editedAt: z.date().default(() => new Date()),
    isEdited: z.boolean().default(true),
  });

export const publicFollowSchema = selectFollowSchema.omit({
  updatedAt: true,
});
export const publicLikeSchema = selectLikeSchema.omit({
  updatedAt: true,
});
export const publicCommentSchema = selectCommentSchema.omit({
  deletedAt: true,
  isDeleted: true,
  updatedAt: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type PublicComment = z.infer<typeof publicCommentSchema>;
export type PublicFollow = z.infer<typeof publicFollowSchema>;
export type PublicLike = z.infer<typeof publicLikeSchema>;
export type SelectComment = z.infer<typeof selectCommentSchema>;
export type SelectFollow = z.infer<typeof selectFollowSchema>;
export type SelectLike = z.infer<typeof selectLikeSchema>;
export type UpdateComment = z.infer<typeof updateCommentSchema>;
export type UpdateFollow = z.infer<typeof updateFollowSchema>;
export type UpdateLike = z.infer<typeof updateLikeSchema>;
