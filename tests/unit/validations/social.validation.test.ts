/**
 * Social Validation Schema Unit Tests
 *
 * These tests verify the Zod validation schemas for social features.
 * Unit tests that don't require database access.
 */

import { describe, expect, it } from 'vitest';

import {
  createCommentSchema,
  deleteCommentSchema,
  getCommentsSchema,
  updateCommentSchema,
} from '@/lib/validations/comment.validation';
import { getBatchLikeDataSchema, toggleLikeSchema } from '@/lib/validations/like.validation';

// Valid UUID v4 format for testing (proper hex chars, version 4, variant bits)
const VALID_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const VALID_UUID_2 = 'b1ffcd88-8b1a-4df9-ac7e-7cc8ce491b22';

describe('Social Validation Schemas', () => {
  describe('toggleLikeSchema', () => {
    it('should validate correct like data', () => {
      const validData = {
        targetId: VALID_UUID,
        targetType: 'collection',
      };

      const result = toggleLikeSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should validate all target types', () => {
      const targetTypes = ['bobblehead', 'collection'];

      targetTypes.forEach((targetType) => {
        const result = toggleLikeSchema.safeParse({
          targetId: VALID_UUID,
          targetType,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid UUID', () => {
      const result = toggleLikeSchema.safeParse({
        targetId: 'not-a-uuid',
        targetType: 'collection',
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain('UUID');
    });

    it('should reject invalid target type', () => {
      const result = toggleLikeSchema.safeParse({
        targetId: VALID_UUID,
        targetType: 'invalid',
      });

      expect(result.success).toBe(false);
    });

    it('should require targetId', () => {
      const result = toggleLikeSchema.safeParse({
        targetType: 'collection',
      });

      expect(result.success).toBe(false);
    });

    it('should require targetType', () => {
      const result = toggleLikeSchema.safeParse({
        targetId: VALID_UUID,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('getBatchLikeDataSchema', () => {
    it('should validate array of targets', () => {
      const validData = {
        targets: [
          { targetId: VALID_UUID, targetType: 'collection' },
          { targetId: VALID_UUID_2, targetType: 'bobblehead' },
        ],
      };

      const result = getBatchLikeDataSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should require at least one target', () => {
      const result = getBatchLikeDataSchema.safeParse({
        targets: [],
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain('At least one target');
    });

    it('should reject more than 50 targets', () => {
      // Generate valid UUIDs for each target
      const targets = Array.from({ length: 51 }, (_, i) => ({
        targetId: `a0eebc99-9c0b-4ef8-bb6d-6bb9bd38${String(i).padStart(4, '0')}`,
        targetType: 'collection' as const,
      }));

      const result = getBatchLikeDataSchema.safeParse({ targets });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain('Maximum 50');
    });
  });

  describe('createCommentSchema', () => {
    it('should validate correct comment data', () => {
      const validData = {
        content: 'This is a test comment',
        targetId: VALID_UUID,
        targetType: 'collection',
      };

      const result = createCommentSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should allow optional parentCommentId for replies', () => {
      const validData = {
        content: 'This is a reply',
        parentCommentId: VALID_UUID_2,
        targetId: VALID_UUID,
        targetType: 'collection',
      };

      const result = createCommentSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject empty content', () => {
      const result = createCommentSchema.safeParse({
        content: '',
        targetId: VALID_UUID,
        targetType: 'collection',
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid parentCommentId', () => {
      const result = createCommentSchema.safeParse({
        content: 'Valid content',
        parentCommentId: 'not-a-uuid',
        targetId: VALID_UUID,
        targetType: 'collection',
      });

      expect(result.success).toBe(false);
    });

    it('should validate all target types for comments', () => {
      const targetTypes = ['bobblehead', 'collection'];

      targetTypes.forEach((targetType) => {
        const result = createCommentSchema.safeParse({
          content: 'Test comment',
          targetId: VALID_UUID,
          targetType,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('updateCommentSchema', () => {
    it('should validate correct update data', () => {
      const validData = {
        commentId: VALID_UUID,
        content: 'Updated comment content',
      };

      const result = updateCommentSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject invalid commentId', () => {
      const result = updateCommentSchema.safeParse({
        commentId: 'invalid',
        content: 'Valid content',
      });

      expect(result.success).toBe(false);
    });

    it('should reject empty content', () => {
      const result = updateCommentSchema.safeParse({
        commentId: VALID_UUID,
        content: '',
      });

      expect(result.success).toBe(false);
    });

    it('should trim whitespace from content', () => {
      const validData = {
        commentId: VALID_UUID,
        content: '  Trimmed content  ',
      };

      const result = updateCommentSchema.safeParse(validData);

      expect(result.success).toBe(true);
      expect(result.data?.content).toBe('Trimmed content');
    });
  });

  describe('deleteCommentSchema', () => {
    it('should validate correct delete data', () => {
      const validData = {
        commentId: VALID_UUID,
      };

      const result = deleteCommentSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject invalid commentId', () => {
      const result = deleteCommentSchema.safeParse({
        commentId: 'not-valid',
      });

      expect(result.success).toBe(false);
    });

    it('should require commentId', () => {
      const result = deleteCommentSchema.safeParse({});

      expect(result.success).toBe(false);
    });
  });

  describe('getCommentsSchema', () => {
    it('should validate correct get comments data', () => {
      const validData = {
        targetId: VALID_UUID,
        targetType: 'collection',
      };

      const result = getCommentsSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should apply default pagination', () => {
      const validData = {
        targetId: VALID_UUID,
        targetType: 'collection',
      };

      const result = getCommentsSchema.safeParse(validData);

      expect(result.success).toBe(true);
      expect(result.data?.pagination).toBeDefined();
      expect(result.data?.pagination.limit).toBeGreaterThan(0);
      expect(result.data?.pagination.offset).toBe(0);
    });

    it('should accept custom pagination', () => {
      const validData = {
        pagination: { limit: 25, offset: 10 },
        targetId: VALID_UUID,
        targetType: 'collection',
      };

      const result = getCommentsSchema.safeParse(validData);

      expect(result.success).toBe(true);
      expect(result.data?.pagination.limit).toBe(25);
      expect(result.data?.pagination.offset).toBe(10);
    });

    it('should reject negative offset', () => {
      const result = getCommentsSchema.safeParse({
        pagination: { limit: 10, offset: -5 },
        targetId: VALID_UUID,
        targetType: 'collection',
      });

      expect(result.success).toBe(false);
    });
  });
});
