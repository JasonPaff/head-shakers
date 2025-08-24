import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { users } from '@/db/schema/users';

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
    followType: varchar('follow_type', { length: 20 }).default('user').notNull(), // user, collection
    id: uuid('id').primaryKey().defaultRandom(),
    targetId: uuid('target_id'), // For following specific collections
  },
  (table) => [
    index('follows_follower_id_idx').on(table.followerId),
    index('follows_following_id_idx').on(table.followingId),
    index('follows_target_id_idx').on(table.targetId),

    uniqueIndex('follows_unique').on(table.followerId, table.followingId, table.followType, table.targetId),
  ],
);

export const likes = pgTable(
  'likes',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    targetId: uuid('target_id').notNull(),
    targetType: varchar('target_type', { length: 20 }).notNull(), // bobblehead, collection, comment
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    index('likes_user_id_idx').on(table.userId),

    index('likes_target_idx').on(table.targetType, table.targetId),

    uniqueIndex('likes_unique').on(table.userId, table.targetType, table.targetId),
  ],
);

export const comments = pgTable(
  'comments',
  {
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
    editedAt: timestamp('edited_at'),
    id: uuid('id').primaryKey().defaultRandom(),
    isDeleted: boolean('is_deleted').default(false),
    isEdited: boolean('is_edited').default(false),
    likeCount: integer('like_count').default(0),
    parentCommentId: uuid('parent_comment_id').references(() => comments.id, { onDelete: 'cascade' }),
    targetId: uuid('target_id').notNull(),
    targetType: varchar('target_type', { length: 20 }).notNull(), // bobblehead, collection
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    index('comments_created_at_idx').on(table.createdAt),
    index('comments_parent_comment_id_idx').on(table.parentCommentId),
    index('comments_user_id_idx').on(table.userId),

    index('comments_target_idx').on(table.targetType, table.targetId),
  ],
);
