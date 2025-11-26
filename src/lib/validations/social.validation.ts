import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { DEFAULTS, ENUMS, SCHEMA_LIMITS } from '@/lib/constants';
import { comments, likes } from '@/lib/db/schema';

export const selectLikeSchema = createSelectSchema(likes);
export const insertLikeSchema = createInsertSchema(likes, {
  targetType: z.enum(ENUMS.LIKE.TARGET_TYPE),
}).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
  userId: true,
});
export const updateLikeSchema = insertLikeSchema.partial();

export const selectCommentSchema = createSelectSchema(comments);
export const insertCommentSchema = createInsertSchema(comments, {
  content: z
    .string()
    .min(SCHEMA_LIMITS.COMMENT.CONTENT.MIN)
    .max(SCHEMA_LIMITS.COMMENT.CONTENT.MAX)
    .transform((val) => val.trim()),
  likeCount: z.number().min(0).default(DEFAULTS.COMMENT.LIKE_COUNT),
  parentCommentId: z.string().uuid('Invalid parent comment ID').optional(),
  targetType: z.enum(ENUMS.COMMENT.TARGET_TYPE),
}).omit({
  createdAt: true,
  deletedAt: true,
  editedAt: true,
  id: true,
  likeCount: true,
  updatedAt: true,
  userId: true,
});
export const updateCommentSchema = insertCommentSchema
  .pick({
    content: true,
  })
  .extend({
    editedAt: z.date().default(() => new Date()),
  });

export const publicLikeSchema = selectLikeSchema.omit({
  updatedAt: true,
});
export const publicCommentSchema = selectCommentSchema.omit({
  deletedAt: true,
  updatedAt: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type PublicComment = z.infer<typeof publicCommentSchema>;
export type PublicLike = z.infer<typeof publicLikeSchema>;
export type SelectComment = z.infer<typeof selectCommentSchema>;
export type SelectLike = z.infer<typeof selectLikeSchema>;
export type UpdateComment = z.infer<typeof updateCommentSchema>;
export type UpdateLike = z.infer<typeof updateLikeSchema>;
