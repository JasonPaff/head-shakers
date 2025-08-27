import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { comments, commentType, follows, followType, likes, likeType } from '@/lib/db/schema';

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
