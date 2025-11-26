import { sql } from 'drizzle-orm';
import {
  type AnyPgColumn,
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
export const likeTargetTypeEnum = pgEnum('like_target_type', ENUMS.LIKE.TARGET_TYPE);

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

    // partial indexes for polymorphic relationships
    index('likes_bobblehead_target_idx')
      .on(table.targetId)
      .where(sql`${table.targetType} = 'bobblehead'`),
    index('likes_collection_target_idx')
      .on(table.targetId)
      .where(sql`${table.targetType} = 'collection'`),
    index('likes_comment_target_idx')
      .on(table.targetId)
      .where(sql`${table.targetType} = 'comment'`),

    // performance indexes
    index('likes_target_created_desc_idx').on(table.targetType, table.targetId, sql`${table.createdAt} DESC`),

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
    parentCommentId: uuid('parent_comment_id').references((): AnyPgColumn => comments.id, {
      onDelete: 'cascade',
    }),
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
    index('comments_parent_created_idx').on(table.parentCommentId, table.createdAt),

    // partial indexes for polymorphic relationships
    index('comments_bobblehead_target_idx')
      .on(table.targetId)
      .where(sql`${table.targetType} = 'bobblehead'`),
    index('comments_collection_target_idx')
      .on(table.targetId)
      .where(sql`${table.targetType} = 'collection'`),
    index('comments_subcollection_target_idx')
      .on(table.targetId)
      .where(sql`${table.targetType} = 'subcollection'`),

    // performance indexes
    index('comments_target_active_created_idx').on(
      table.targetType,
      table.targetId,
      table.isDeleted,
      sql`${table.createdAt} DESC`,
    ),
    index('comments_content_search_idx').using('gin', sql`${table.content} gin_trgm_ops`),

    // check constraints
    check('comments_content_not_empty', sql`length(trim(${table.content})) > 0`),
    check('comments_like_count_non_negative', sql`${table.likeCount} >= 0`),
  ],
);
