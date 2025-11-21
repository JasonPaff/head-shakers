import { z } from 'zod';

import { DEFAULTS, ENUMS, SCHEMA_LIMITS } from '@/lib/constants';
import { insertCommentSchema } from '@/lib/validations/social.validation';

/**
 * Comment Validation Schemas
 * Validation schemas for comment-specific operations
 */

/**
 * Schema for creating a new comment
 * Extends the base insert schema to support optional parent comment for replies
 * Note: userId is passed separately via auth context
 * Note: Depth validation occurs in the facade layer using MAX_COMMENT_NESTING_DEPTH constant
 *
 * Facade layer validation requirements:
 * 1. Parent comment exists and is not deleted
 * 2. Current depth does not exceed MAX_COMMENT_NESTING_DEPTH (5 levels)
 * 3. Parent comment belongs to the same target entity
 */
export const createCommentSchema = insertCommentSchema.extend({
  parentCommentId: z.string().uuid('Invalid parent comment ID').optional(),
});

/**
 * Schema for updating an existing comment
 * Requires comment ID and updated content with proper length validation
 */
export const updateCommentSchema = z.object({
  commentId: z.string().uuid('Invalid comment ID'),
  content: z
    .string()
    .min(SCHEMA_LIMITS.COMMENT.CONTENT.MIN, 'Comment content is required')
    .max(SCHEMA_LIMITS.COMMENT.CONTENT.MAX, 'Comment is too long')
    .trim(),
});

/**
 * Schema for deleting a comment
 * Requires only the comment ID for deletion
 */
export const deleteCommentSchema = z.object({
  commentId: z.string().uuid('Invalid comment ID'),
});

/**
 * Schema for getting a single comment by ID
 * Used for fetching comment details
 */
export const getCommentByIdSchema = z.object({
  commentId: z.string().uuid('Invalid comment ID'),
});

/**
 * Schema for pagination parameters
 * Validates limit and offset with maximum constraints
 */
export const commentPaginationSchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(DEFAULTS.PAGINATION.MAX_LIMIT, `Maximum limit is ${DEFAULTS.PAGINATION.MAX_LIMIT}`)
    .default(DEFAULTS.PAGINATION.LIMIT),
  offset: z.coerce.number().int().min(0).default(DEFAULTS.PAGINATION.OFFSET),
});

/**
 * Schema for getting comments with filtering and pagination
 * Supports filtering by target entity and pagination
 */
export const getCommentsSchema = z.object({
  // Pagination parameters
  pagination: commentPaginationSchema.optional().default({
    limit: DEFAULTS.PAGINATION.LIMIT,
    offset: DEFAULTS.PAGINATION.OFFSET,
  }),

  // Target entity filtering
  targetId: z.string().uuid('Invalid target ID'),
  targetType: z.enum(ENUMS.COMMENT.TARGET_TYPE, {
    message: 'Target must be a bobblehead, collection, or subcollection',
  }),
});

/**
 * Schema for getting comment count
 * Used for fetching the number of comments for a specific target
 */
export const getCommentCountSchema = z.object({
  targetId: z.string().uuid('Invalid target ID'),
  targetType: z.enum(ENUMS.COMMENT.TARGET_TYPE, {
    message: 'Target must be a bobblehead, collection, or subcollection',
  }),
});

// Type exports using z.infer for type-safe schema usage
export type CommentPagination = z.infer<typeof commentPaginationSchema>;
export type CreateComment = z.infer<typeof createCommentSchema>;
export type DeleteComment = z.infer<typeof deleteCommentSchema>;
export type GetCommentById = z.infer<typeof getCommentByIdSchema>;
export type GetCommentCount = z.infer<typeof getCommentCountSchema>;
export type GetComments = z.infer<typeof getCommentsSchema>;
export type UpdateComment = z.infer<typeof updateCommentSchema>;
