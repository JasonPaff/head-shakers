import { describe, expect, it } from 'vitest';

import { ENUMS } from '@/lib/constants';
import {
  getBatchLikeDataSchema,
  getLikeStatusSchema,
  toggleLikeSchema,
} from '@/lib/validations/like.validation';

describe('like validation schemas', () => {
  describe('toggleLikeSchema', () => {
    it('should validate a valid like toggle for bobblehead', () => {
      const input = {
        targetId: '123e4567-e89b-12d3-a456-426614174000',
        targetType: 'bobblehead',
      };
      const result = toggleLikeSchema.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.targetId).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.data?.targetType).toBe('bobblehead');
    });

    it('should validate a valid like toggle for collection', () => {
      const input = {
        targetId: '123e4567-e89b-12d3-a456-426614174000',
        targetType: 'collection',
      };
      const result = toggleLikeSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('should reject invalid target type', () => {
      const input = {
        targetId: '123e4567-e89b-12d3-a456-426614174000',
        targetType: 'user',
      };
      const result = toggleLikeSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain('bobblehead or collection');
    });

    it('should reject invalid UUID format', () => {
      const input = {
        targetId: 'not-a-uuid',
        targetType: 'bobblehead',
      };
      const result = toggleLikeSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain('valid UUID');
    });

    it('should reject missing targetId', () => {
      const input = {
        targetType: 'bobblehead',
      };
      const result = toggleLikeSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject missing targetType', () => {
      const input = {
        targetId: '123e4567-e89b-12d3-a456-426614174000',
      };
      const result = toggleLikeSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should accept all valid target types', () => {
      const targetTypes = ENUMS.LIKE.TARGET_TYPE;

      for (const targetType of targetTypes) {
        const input = {
          targetId: '123e4567-e89b-12d3-a456-426614174000',
          targetType,
        };
        const result = toggleLikeSchema.safeParse(input);

        expect(result.success).toBe(true);
      }
    });
  });

  describe('getLikeStatusSchema', () => {
    it('should validate same as toggleLikeSchema', () => {
      const input = {
        targetId: '123e4567-e89b-12d3-a456-426614174000',
        targetType: 'bobblehead',
      };
      const result = getLikeStatusSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('should reject invalid input same as toggleLikeSchema', () => {
      const input = {
        targetId: 'invalid',
        targetType: 'invalid',
      };
      const result = getLikeStatusSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('getBatchLikeDataSchema', () => {
    it('should validate a valid batch with single target', () => {
      const input = {
        targets: [
          {
            targetId: '123e4567-e89b-12d3-a456-426614174000',
            targetType: 'bobblehead',
          },
        ],
      };
      const result = getBatchLikeDataSchema.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.targets).toHaveLength(1);
    });

    it('should validate a valid batch with multiple targets', () => {
      const input = {
        targets: [
          {
            targetId: '123e4567-e89b-12d3-a456-426614174000',
            targetType: 'bobblehead',
          },
          {
            targetId: '223e4567-e89b-12d3-a456-426614174001',
            targetType: 'collection',
          },
        ],
      };
      const result = getBatchLikeDataSchema.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.targets).toHaveLength(2);
    });

    it('should reject empty targets array', () => {
      const input = {
        targets: [],
      };
      const result = getBatchLikeDataSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain('At least one target is required');
    });

    it('should reject targets exceeding maximum (50)', () => {
      // Generate 51 targets with valid UUIDs to test maximum limit
      const targets = Array.from({ length: 51 }, () => ({
        targetId: '123e4567-e89b-12d3-a456-426614174000',
        targetType: 'bobblehead' as const,
      }));

      const input = { targets };
      const result = getBatchLikeDataSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain('Maximum 50 targets');
    });

    it('should validate exactly 50 targets (maximum allowed)', () => {
      const targets = Array.from({ length: 50 }, () => ({
        targetId: '123e4567-e89b-12d3-a456-426614174000',
        targetType: 'bobblehead' as const,
      }));

      const input = { targets };
      const result = getBatchLikeDataSchema.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.targets).toHaveLength(50);
    });

    it('should reject batch with invalid target ID', () => {
      const input = {
        targets: [
          {
            targetId: 'not-valid-uuid',
            targetType: 'bobblehead',
          },
        ],
      };
      const result = getBatchLikeDataSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject batch with invalid target type', () => {
      const input = {
        targets: [
          {
            targetId: '123e4567-e89b-12d3-a456-426614174000',
            targetType: 'user',
          },
        ],
      };
      const result = getBatchLikeDataSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject missing targets field', () => {
      const input = {};
      const result = getBatchLikeDataSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });
});
