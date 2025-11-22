import { describe, expect, it } from 'vitest';

import {
  deleteBobbleheadPhotoSchema,
  deleteBobbleheadSchema,
  getBobbleheadByIdSchema,
  getBobbleheadBySlugSchema,
  reorderBobbleheadPhotosSchema,
  updateBobbleheadPhotoMetadataSchema,
} from '@/lib/validations/bobbleheads.validation';

describe('bobbleheads validation schemas', () => {
  describe('deleteBobbleheadSchema', () => {
    it('should validate a valid UUID', () => {
      const input = { bobbleheadId: '123e4567-e89b-12d3-a456-426614174000' };
      const result = deleteBobbleheadSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bobbleheadId).toBe('123e4567-e89b-12d3-a456-426614174000');
      }
    });

    it('should reject missing bobbleheadId', () => {
      const input = {};
      const result = deleteBobbleheadSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID format', () => {
      const input = { bobbleheadId: 'not-a-uuid' };
      const result = deleteBobbleheadSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('getBobbleheadByIdSchema', () => {
    it('should validate a valid UUID', () => {
      const input = { id: '123e4567-e89b-12d3-a456-426614174000' };
      const result = getBobbleheadByIdSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      }
    });

    it('should reject invalid UUID', () => {
      const input = { id: 'invalid-id' };
      const result = getBobbleheadByIdSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('getBobbleheadBySlugSchema', () => {
    it('should validate a valid slug', () => {
      const input = { slug: 'my-bobblehead-123' };
      const result = getBobbleheadBySlugSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.slug).toBe('my-bobblehead-123');
      }
    });

    it('should reject slug with uppercase letters', () => {
      const input = { slug: 'My-Bobblehead' };
      const result = getBobbleheadBySlugSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject slug with spaces', () => {
      const input = { slug: 'my bobblehead' };
      const result = getBobbleheadBySlugSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject empty slug', () => {
      const input = { slug: '' };
      const result = getBobbleheadBySlugSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should accept slug with numbers and hyphens', () => {
      const input = { slug: 'bobblehead-2024-edition' };
      const result = getBobbleheadBySlugSchema.safeParse(input);

      expect(result.success).toBe(true);
    });
  });

  describe('deleteBobbleheadPhotoSchema', () => {
    it('should validate valid bobbleheadId and photoId', () => {
      const input = {
        bobbleheadId: '123e4567-e89b-12d3-a456-426614174000',
        photoId: '223e4567-e89b-12d3-a456-426614174001',
      };
      const result = deleteBobbleheadPhotoSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bobbleheadId).toBe('123e4567-e89b-12d3-a456-426614174000');
        expect(result.data.photoId).toBe('223e4567-e89b-12d3-a456-426614174001');
      }
    });

    it('should reject missing photoId', () => {
      const input = {
        bobbleheadId: '123e4567-e89b-12d3-a456-426614174000',
      };
      const result = deleteBobbleheadPhotoSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject invalid photoId format', () => {
      const input = {
        bobbleheadId: '123e4567-e89b-12d3-a456-426614174000',
        photoId: 'not-a-uuid',
      };
      const result = deleteBobbleheadPhotoSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('reorderBobbleheadPhotosSchema', () => {
    it('should validate valid reorder input', () => {
      const input = {
        bobbleheadId: '123e4567-e89b-12d3-a456-426614174000',
        photoOrder: [
          { id: '223e4567-e89b-12d3-a456-426614174001', sortOrder: 0 },
          { id: '323e4567-e89b-12d3-a456-426614174002', isPrimary: true, sortOrder: 1 },
        ],
      };
      const result = reorderBobbleheadPhotosSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.photoOrder).toHaveLength(2);
        expect(result.data.photoOrder[1]?.isPrimary).toBe(true);
      }
    });

    it('should reject empty photoOrder array', () => {
      const input = {
        bobbleheadId: '123e4567-e89b-12d3-a456-426614174000',
        photoOrder: [],
      };
      const result = reorderBobbleheadPhotosSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject negative sortOrder', () => {
      const input = {
        bobbleheadId: '123e4567-e89b-12d3-a456-426614174000',
        photoOrder: [{ id: '223e4567-e89b-12d3-a456-426614174001', sortOrder: -1 }],
      };
      const result = reorderBobbleheadPhotosSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('updateBobbleheadPhotoMetadataSchema', () => {
    it('should validate valid metadata update', () => {
      const input = {
        altText: 'A rare bobblehead from 1995',
        bobbleheadId: '123e4567-e89b-12d3-a456-426614174000',
        caption: 'Found at a vintage shop',
        photoId: '223e4567-e89b-12d3-a456-426614174001',
      };
      const result = updateBobbleheadPhotoMetadataSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.altText).toBe('A rare bobblehead from 1995');
        expect(result.data.caption).toBe('Found at a vintage shop');
      }
    });

    it('should allow optional altText and caption', () => {
      const input = {
        bobbleheadId: '123e4567-e89b-12d3-a456-426614174000',
        photoId: '223e4567-e89b-12d3-a456-426614174001',
      };
      const result = updateBobbleheadPhotoMetadataSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('should trim whitespace from altText', () => {
      const input = {
        altText: '  trimmed text  ',
        bobbleheadId: '123e4567-e89b-12d3-a456-426614174000',
        photoId: '223e4567-e89b-12d3-a456-426614174001',
      };
      const result = updateBobbleheadPhotoMetadataSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.altText).toBe('trimmed text');
      }
    });
  });
});
