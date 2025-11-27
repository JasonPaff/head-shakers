import { describe, expect, it } from 'vitest';

import { DEFAULTS, ENUMS, SCHEMA_LIMITS } from '@/lib/constants';
import {
  commentPaginationSchema,
  createCommentSchema,
  deleteCommentSchema,
  getCommentByIdSchema,
  getCommentCountSchema,
  getCommentsSchema,
  updateCommentSchema,
} from '@/lib/validations/comment.validation';

describe('comment validation schemas', () => {
  describe('createCommentSchema', () => {
    it('should validate a valid comment creation', () => {
      const input = {
        content: 'This is a great bobblehead!',
        targetId: '123e4567-e89b-12d3-a456-426614174000',
        targetType: 'bobblehead',
      };
      const result = createCommentSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe('This is a great bobblehead!');
        expect(result.data.targetType).toBe('bobblehead');
      }
    });

    it('should allow optional parentCommentId for replies', () => {
      const input = {
        content: 'I agree with you!',
        parentCommentId: '223e4567-e89b-12d3-a456-426614174001',
        targetId: '123e4567-e89b-12d3-a456-426614174000',
        targetType: 'bobblehead',
      };
      const result = createCommentSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.parentCommentId).toBe('223e4567-e89b-12d3-a456-426614174001');
      }
    });

    it('should reject invalid parentCommentId format', () => {
      const input = {
        content: 'Test reply',
        parentCommentId: 'not-a-valid-uuid',
        targetId: '123e4567-e89b-12d3-a456-426614174000',
        targetType: 'bobblehead',
      };
      const result = createCommentSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject empty content', () => {
      const input = {
        content: '',
        targetId: '123e4567-e89b-12d3-a456-426614174000',
        targetType: 'bobblehead',
      };
      const result = createCommentSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject invalid target type', () => {
      const input = {
        content: 'Test comment',
        targetId: '123e4567-e89b-12d3-a456-426614174000',
        targetType: 'invalid',
      };
      const result = createCommentSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should accept all valid target types', () => {
      const targetTypes = ENUMS.COMMENT.TARGET_TYPE;

      for (const targetType of targetTypes) {
        const input = {
          content: 'Test comment',
          targetId: '123e4567-e89b-12d3-a456-426614174000',
          targetType,
        };
        const result = createCommentSchema.safeParse(input);

        expect(result.success).toBe(true);
      }
    });
  });

  describe('updateCommentSchema', () => {
    it('should validate a valid comment update', () => {
      const input = {
        commentId: '123e4567-e89b-12d3-a456-426614174000',
        content: 'Updated comment content',
      };
      const result = updateCommentSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe('Updated comment content');
      }
    });

    it('should trim whitespace from content', () => {
      const input = {
        commentId: '123e4567-e89b-12d3-a456-426614174000',
        content: '  trimmed content  ',
      };
      const result = updateCommentSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe('trimmed content');
      }
    });

    it('should reject content exceeding maximum length', () => {
      const input = {
        commentId: '123e4567-e89b-12d3-a456-426614174000',
        content: 'a'.repeat(SCHEMA_LIMITS.COMMENT.CONTENT.MAX + 1),
      };
      const result = updateCommentSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject invalid commentId', () => {
      const input = {
        commentId: 'not-a-uuid',
        content: 'Updated content',
      };
      const result = updateCommentSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('deleteCommentSchema', () => {
    it('should validate a valid comment ID', () => {
      const input = { commentId: '123e4567-e89b-12d3-a456-426614174000' };
      const result = deleteCommentSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.commentId).toBe('123e4567-e89b-12d3-a456-426614174000');
      }
    });

    it('should reject invalid UUID', () => {
      const input = { commentId: 'invalid' };
      const result = deleteCommentSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('getCommentByIdSchema', () => {
    it('should validate a valid comment ID', () => {
      const input = { commentId: '123e4567-e89b-12d3-a456-426614174000' };
      const result = getCommentByIdSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('should reject missing commentId', () => {
      const input = {};
      const result = getCommentByIdSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('commentPaginationSchema', () => {
    it('should use defaults when no values provided', () => {
      const input = {};
      const result = commentPaginationSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(DEFAULTS.PAGINATION.LIMIT);
        expect(result.data.offset).toBe(DEFAULTS.PAGINATION.OFFSET);
      }
    });

    it('should accept valid pagination values', () => {
      const input = { limit: 50, offset: 10 };
      const result = commentPaginationSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
        expect(result.data.offset).toBe(10);
      }
    });

    it('should reject limit exceeding maximum', () => {
      const input = { limit: DEFAULTS.PAGINATION.MAX_LIMIT + 1 };
      const result = commentPaginationSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject negative offset', () => {
      const input = { offset: -1 };
      const result = commentPaginationSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should coerce string values to numbers', () => {
      const input = { limit: '25', offset: '5' };
      const result = commentPaginationSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(25);
        expect(result.data.offset).toBe(5);
      }
    });
  });

  describe('getCommentsSchema', () => {
    it('should validate valid get comments request', () => {
      const input = {
        targetId: '123e4567-e89b-12d3-a456-426614174000',
        targetType: 'collection',
      };
      const result = getCommentsSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.targetType).toBe('collection');
        expect(result.data.pagination.limit).toBe(DEFAULTS.PAGINATION.LIMIT);
      }
    });

    it('should accept custom pagination', () => {
      const input = {
        pagination: { limit: 30, offset: 20 },
        targetId: '123e4567-e89b-12d3-a456-426614174000',
        targetType: 'bobblehead',
      };
      const result = getCommentsSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pagination.limit).toBe(30);
        expect(result.data.pagination.offset).toBe(20);
      }
    });
  });

  describe('getCommentCountSchema', () => {
    it('should validate valid count request', () => {
      const input = {
        targetId: '123e4567-e89b-12d3-a456-426614174000',
        targetType: 'bobblehead',
      };
      const result = getCommentCountSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('should reject invalid target type', () => {
      const input = {
        targetId: '123e4567-e89b-12d3-a456-426614174000',
        targetType: 'user',
      };
      const result = getCommentCountSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });
});
