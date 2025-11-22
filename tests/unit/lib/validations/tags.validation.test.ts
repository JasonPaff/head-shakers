import { describe, expect, it } from 'vitest';

import { CONFIG, SCHEMA_LIMITS } from '@/lib/constants';
import {
  attachTagsSchema,
  bulkDeleteTagsSchema,
  deleteTagSchema,
  detachTagsSchema,
  getTagSuggestionsSchema,
  insertTagSchema,
  updateTagActionSchema,
} from '@/lib/validations/tags.validation';

describe('tags validation schemas', () => {
  describe('insertTagSchema', () => {
    it('should validate a valid tag', () => {
      const input = {
        color: '#3B82F6',
        name: 'Vintage',
      };
      const result = insertTagSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Vintage');
        expect(result.data.color).toBe('#3B82F6');
      }
    });

    it('should validate tag with default usage count', () => {
      const input = {
        color: '#FF5733',
        name: 'Sports',
      };
      const result = insertTagSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.usageCount).toBe(0);
      }
    });

    it('should reject invalid hex color format', () => {
      const input = {
        color: 'red',
        name: 'Test',
      };
      const result = insertTagSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject hex color without hash', () => {
      const input = {
        color: '3B82F6',
        name: 'Test',
      };
      const result = insertTagSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject short hex color', () => {
      const input = {
        color: '#FFF',
        name: 'Test',
      };
      const result = insertTagSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const input = {
        color: '#3B82F6',
        name: '',
      };
      const result = insertTagSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject name exceeding maximum length', () => {
      const input = {
        color: '#3B82F6',
        name: 'a'.repeat(SCHEMA_LIMITS.TAG.NAME.MAX + 1),
      };
      const result = insertTagSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should trim whitespace from name', () => {
      const input = {
        color: '#3B82F6',
        name: '  Trimmed Tag  ',
      };
      const result = insertTagSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Trimmed Tag');
      }
    });

    it('should accept lowercase hex color', () => {
      const input = {
        color: '#3b82f6',
        name: 'Test',
      };
      const result = insertTagSchema.safeParse(input);

      expect(result.success).toBe(true);
    });
  });

  describe('attachTagsSchema', () => {
    it('should validate valid tag attachment', () => {
      const input = {
        bobbleheadId: '123e4567-e89b-12d3-a456-426614174000',
        tagIds: ['223e4567-e89b-12d3-a456-426614174001'],
      };
      const result = attachTagsSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tagIds).toHaveLength(1);
      }
    });

    it('should validate multiple tags', () => {
      const input = {
        bobbleheadId: '123e4567-e89b-12d3-a456-426614174000',
        tagIds: [
          '223e4567-e89b-12d3-a456-426614174001',
          '323e4567-e89b-12d3-a456-426614174002',
          '423e4567-e89b-12d3-a456-426614174003',
        ],
      };
      const result = attachTagsSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tagIds).toHaveLength(3);
      }
    });

    it('should reject empty tagIds array', () => {
      const input = {
        bobbleheadId: '123e4567-e89b-12d3-a456-426614174000',
        tagIds: [],
      };
      const result = attachTagsSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('At least one tag is required');
      }
    });

    it('should reject tags exceeding maximum per bobblehead', () => {
      const maxTags = CONFIG.CONTENT.MAX_TAGS_PER_BOBBLEHEAD;
      const tagIds = Array.from({ length: maxTags + 1 }, () => '123e4567-e89b-12d3-a456-426614174000');

      const input = {
        bobbleheadId: '123e4567-e89b-12d3-a456-426614174000',
        tagIds,
      };
      const result = attachTagsSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject invalid bobbleheadId', () => {
      const input = {
        bobbleheadId: 'not-a-uuid',
        tagIds: ['223e4567-e89b-12d3-a456-426614174001'],
      };
      const result = attachTagsSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject invalid tagId in array', () => {
      const input = {
        bobbleheadId: '123e4567-e89b-12d3-a456-426614174000',
        tagIds: ['valid-uuid-is-not', '223e4567-e89b-12d3-a456-426614174001'],
      };
      const result = attachTagsSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('detachTagsSchema', () => {
    it('should validate valid tag detachment', () => {
      const input = {
        bobbleheadId: '123e4567-e89b-12d3-a456-426614174000',
        tagIds: ['223e4567-e89b-12d3-a456-426614174001'],
      };
      const result = detachTagsSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('should reject empty tagIds array', () => {
      const input = {
        bobbleheadId: '123e4567-e89b-12d3-a456-426614174000',
        tagIds: [],
      };
      const result = detachTagsSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('bulkDeleteTagsSchema', () => {
    it('should validate valid bulk delete', () => {
      const input = {
        tagIds: ['223e4567-e89b-12d3-a456-426614174001', '323e4567-e89b-12d3-a456-426614174002'],
      };
      const result = bulkDeleteTagsSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tagIds).toHaveLength(2);
      }
    });

    it('should reject empty tagIds array', () => {
      const input = { tagIds: [] };
      const result = bulkDeleteTagsSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject invalid tagId', () => {
      const input = { tagIds: ['not-valid'] };
      const result = bulkDeleteTagsSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('getTagSuggestionsSchema', () => {
    it('should validate valid query', () => {
      const input = { query: 'vin' };
      const result = getTagSuggestionsSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query).toBe('vin');
      }
    });

    it('should reject query shorter than 2 characters', () => {
      const input = { query: 'a' };
      const result = getTagSuggestionsSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters');
      }
    });

    it('should reject query longer than 50 characters', () => {
      const input = { query: 'a'.repeat(51) };
      const result = getTagSuggestionsSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Query too long');
      }
    });

    it('should accept exactly 2 character query', () => {
      const input = { query: 'ab' };
      const result = getTagSuggestionsSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('should accept exactly 50 character query', () => {
      const input = { query: 'a'.repeat(50) };
      const result = getTagSuggestionsSchema.safeParse(input);

      expect(result.success).toBe(true);
    });
  });

  describe('deleteTagSchema', () => {
    it('should validate valid tag ID', () => {
      const input = { tagId: '123e4567-e89b-12d3-a456-426614174000' };
      const result = deleteTagSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tagId).toBe('123e4567-e89b-12d3-a456-426614174000');
      }
    });

    it('should reject invalid tag ID', () => {
      const input = { tagId: 'invalid' };
      const result = deleteTagSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('updateTagActionSchema', () => {
    it('should validate valid tag update', () => {
      const input = {
        color: '#FF5733',
        name: 'Updated Name',
        tagId: '123e4567-e89b-12d3-a456-426614174000',
      };
      const result = updateTagActionSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Updated Name');
        expect(result.data.color).toBe('#FF5733');
      }
    });

    it('should allow partial updates', () => {
      const input = {
        name: 'Only Name Updated',
        tagId: '123e4567-e89b-12d3-a456-426614174000',
      };
      const result = updateTagActionSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Only Name Updated');
        expect(result.data.color).toBeUndefined();
      }
    });

    it('should reject missing tagId', () => {
      const input = {
        name: 'Test',
      };
      const result = updateTagActionSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });
});
