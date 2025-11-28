import { describe, expect, it } from 'vitest';

import { deleteCollectionSchema, getCollectionBySlugSchema } from '@/lib/validations/collections.validation';

describe('collections validation schemas', () => {
  describe('deleteCollectionSchema', () => {
    it('should validate a valid collection ID', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const input = { collectionId: validUuid };
      const result = deleteCollectionSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.collectionId).toBe(validUuid);
      }
    });

    it('should reject missing collectionId', () => {
      const input = {};
      const result = deleteCollectionSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject non-string collectionId', () => {
      const input = { collectionId: 123 };
      const result = deleteCollectionSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('getCollectionBySlugSchema', () => {
    it('should validate a valid slug and userId', () => {
      const input = {
        slug: 'my-collection',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };
      const result = getCollectionBySlugSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.slug).toBe('my-collection');
        expect(result.data.userId).toBe('123e4567-e89b-12d3-a456-426614174000');
      }
    });

    it('should reject empty slug', () => {
      const input = {
        slug: '',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };
      const result = getCollectionBySlugSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject slug with uppercase letters', () => {
      const input = {
        slug: 'My-Collection',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };
      const result = getCollectionBySlugSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject slug with spaces', () => {
      const input = {
        slug: 'my collection',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };
      const result = getCollectionBySlugSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID for userId', () => {
      const input = {
        slug: 'my-collection',
        userId: 'not-a-uuid',
      };
      const result = getCollectionBySlugSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should accept slug with numbers', () => {
      const input = {
        slug: 'collection-123',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };
      const result = getCollectionBySlugSchema.safeParse(input);

      expect(result.success).toBe(true);
    });
  });
});
