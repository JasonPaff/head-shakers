import { describe, expect, it } from 'vitest';

import {
  deleteCollectionSchema,
  getCollectionBySlugSchema,
  insertCollectionSchema,
  updateCollectionSchema,
} from '@/lib/validations/collections.validation';

describe('collections validation schemas', () => {
  describe('insertCollectionSchema', () => {
    it('should validate correct input with all fields', () => {
      const validInput = {
        coverImageUrl: 'https://example.com/image.jpg',
        description: 'A comprehensive collection of vintage bobbleheads',
        isPublic: true,
        name: 'Vintage Collection',
      };

      const result = insertCollectionSchema.safeParse(validInput);

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Vintage Collection');
      expect(result.data?.description).toBe('A comprehensive collection of vintage bobbleheads');
      expect(result.data?.coverImageUrl).toBe('https://example.com/image.jpg');
      expect(result.data?.isPublic).toBe(true);
    });

    it('should validate correct input with minimal fields (name only)', () => {
      const validInput = {
        description: '',
        name: 'My Collection',
      };

      const result = insertCollectionSchema.safeParse(validInput);

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('My Collection');
      expect(result.data?.description).toBeNull(); // empty string transforms to null
      expect(result.data?.isPublic).toBe(true); // default value
    });

    it('should reject name below min length', () => {
      const invalidInput = {
        description: '',
        name: '', // empty string is below min length of 1
      };

      const result = insertCollectionSchema.safeParse(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error?.issues.length).toBeGreaterThan(0);
      expect(result.error?.issues.some((issue) => issue.path.includes('name'))).toBe(true);
    });

    it('should reject name above max length', () => {
      const invalidInput = {
        description: '',
        name: 'a'.repeat(51), // exceeds max length of 50
      };

      const result = insertCollectionSchema.safeParse(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error?.issues.length).toBeGreaterThan(0);
      expect(result.error?.issues.some((issue) => issue.path.includes('name'))).toBe(true);
    });

    it('should reject invalid coverImageUrl format', () => {
      const invalidInput = {
        coverImageUrl: 'not-a-valid-url',
        name: 'Valid Name',
      };

      const result = insertCollectionSchema.safeParse(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error?.issues.length).toBeGreaterThan(0);
      expect(result.error?.issues[0]?.path).toContain('coverImageUrl');
    });
  });

  describe('updateCollectionSchema', () => {
    it('should require collectionId UUID', () => {
      const validInput = {
        collectionId: '123e4567-e89b-12d3-a456-426614174000',
        description: '',
        name: 'Updated Collection',
      };

      const result = updateCollectionSchema.safeParse(validInput);

      expect(result.success).toBe(true);
      expect(result.data?.collectionId).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.data?.name).toBe('Updated Collection');
    });

    it('should reject invalid collectionId UUID format', () => {
      const invalidInput = {
        collectionId: 'not-a-uuid',
        description: '',
        name: 'Updated Collection',
      };

      const result = updateCollectionSchema.safeParse(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error?.issues.length).toBeGreaterThan(0);
      expect(result.error?.issues.some((issue) => issue.path.includes('collectionId'))).toBe(true);
    });
  });

  describe('deleteCollectionSchema', () => {
    it('should validate a valid collection ID', () => {
      const input = { collectionId: 'collection-123' };
      const result = deleteCollectionSchema.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.collectionId).toBe('collection-123');
    });

    it('should validate collectionId is present', () => {
      const input = { collectionId: 'valid-id' };
      const result = deleteCollectionSchema.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.collectionId).toBeDefined();
      expect(result.data?.collectionId).toBe('valid-id');
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
      expect(result.data?.slug).toBe('my-collection');
      expect(result.data?.userId).toBe('123e4567-e89b-12d3-a456-426614174000');
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

    it('should validate slug format (lowercase, hyphens only)', () => {
      const validInput = {
        slug: 'valid-slug-123',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };
      const result = getCollectionBySlugSchema.safeParse(validInput);

      expect(result.success).toBe(true);
      expect(result.data?.slug).toBe('valid-slug-123');
    });
  });
});
