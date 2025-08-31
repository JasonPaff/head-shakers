import { randomUUID } from 'crypto';
import { describe, expect, it } from 'vitest';

import { DEFAULTS, ENUMS, SCHEMA_LIMITS } from '@/lib/constants';
import {
  deleteBobbleheadPhotoSchema,
  deleteBobbleheadSchema,
  deleteBobbleheadsSchema,
  getBobbleheadByIdSchema,
  getBobbleheadsByCollectionSchema,
  insertBobbleheadSchema,
  publicBobbleheadSchema,
  reorderPhotosSchema,
  searchBobbleheadsSchema,
  updateBobbleheadSchema,
} from '@/lib/validations/bobbleheads.validation';

describe('Bobblehead Validation Schemas', () => {
  describe('insertBobbleheadSchema', () => {
    it('should validate a complete bobblehead object', () => {
      const validData = {
        acquisitionDate: '2024-01-01',
        acquisitionMethod: 'purchased',
        category: 'Sports',
        characterName: 'Test Character',
        collectionId: randomUUID(),
        currentCondition: 'excellent' as const,
        customFields: [{ isSpecialEdition: 'true' }],
        description: 'A test bobblehead description',
        height: '6.5',
        isFeatured: true,
        isPublic: true,
        manufacturer: 'Test Manufacturer',
        material: 'Resin',
        name: 'Test Bobblehead',
        purchaseLocation: 'Test Store',
        purchasePrice: '49.99',
        series: 'Test Series',
        status: 'owned' as const,
        subCollectionId: randomUUID(),
        weight: '2.50',
        year: '2024',
      };

      const result = insertBobbleheadSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Bobblehead');
        expect(result.data.height).toBe(6.5);
        expect(result.data.purchasePrice).toBe(49.99);
      }
    });

    it('should apply defaults for optional fields', () => {
      const minimalData = {
        collectionId: randomUUID(),
        name: 'Minimal Bobblehead',
      };

      const result = insertBobbleheadSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentCondition).toBe(DEFAULTS.BOBBLEHEAD.CONDITION);
        expect(result.data.status).toBe(DEFAULTS.BOBBLEHEAD.STATUS);
        expect(result.data.isPublic).toBe(DEFAULTS.BOBBLEHEAD.IS_PUBLIC);
        expect(result.data.isFeatured).toBe(DEFAULTS.BOBBLEHEAD.IS_FEATURED);
      }
    });

    it('should trim whitespace from string fields', () => {
      const dataWithWhitespace = {
        category: '  Sports  ',
        collectionId: randomUUID(),
        manufacturer: '  Test Manufacturer  ',
        name: '  Test Bobblehead  ',
      };

      const result = insertBobbleheadSchema.safeParse(dataWithWhitespace);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Bobblehead');
        expect(result.data.category).toBe('Sports');
        expect(result.data.manufacturer).toBe('Test Manufacturer');
      }
    });

    it('should validate height field format', () => {
      const validHeights = ['10', '10.5', '10.50', '0.1'];
      const invalidHeights = ['10.555', 'abc', '10,5', '-10'];

      validHeights.forEach((height) => {
        const result = insertBobbleheadSchema.safeParse({
          collectionId: randomUUID(),
          height,
          name: 'Test',
        });
        expect(result.success).toBe(true);
      });

      invalidHeights.forEach((height) => {
        const result = insertBobbleheadSchema.safeParse({
          collectionId: randomUUID(),
          height,
          name: 'Test',
        });
        expect(result.success).toBe(false);
      });
    });

    it('should validate purchasePrice field format', () => {
      const validPrices = ['100', '100.00', '100.5', '0.99'];
      const invalidPrices = ['100.999', 'free', '100,00', '-50'];

      validPrices.forEach((purchasePrice) => {
        const result = insertBobbleheadSchema.safeParse({
          collectionId: randomUUID(),
          name: 'Test',
          purchasePrice,
        });
        expect(result.success).toBe(true);
      });

      invalidPrices.forEach((purchasePrice) => {
        const result = insertBobbleheadSchema.safeParse({
          collectionId: randomUUID(),
          name: 'Test',
          purchasePrice,
        });
        expect(result.success).toBe(false);
      });
    });

    it('should validate year field boundaries', () => {
      const currentYear = new Date().getFullYear();
      const validYears = ['1900', '2000', currentYear.toString(), (currentYear + 1).toString()];
      const invalidYears = ['1799', (currentYear + 2).toString(), '-1', '0', 'not-a-year'];

      validYears.forEach((year) => {
        const result = insertBobbleheadSchema.safeParse({
          collectionId: randomUUID(),
          name: 'Test',
          year,
        });
        expect(result.success).toBe(true);
      });

      invalidYears.forEach((year) => {
        const result = insertBobbleheadSchema.safeParse({
          collectionId: randomUUID(),
          name: 'Test',
          year,
        });
        expect(result.success).toBe(false);
      });
    });

    it('should validate enum fields', () => {
      const validConditions = ENUMS.BOBBLEHEAD.CONDITION;
      const validStatuses = ENUMS.BOBBLEHEAD.STATUS;

      validConditions.forEach((condition) => {
        const result = insertBobbleheadSchema.safeParse({
          collectionId: randomUUID(),
          currentCondition: condition,
          name: 'Test',
        });
        expect(result.success).toBe(true);
      });

      validStatuses.forEach((status) => {
        const result = insertBobbleheadSchema.safeParse({
          collectionId: randomUUID(),
          name: 'Test',
          status,
        });
        expect(result.success).toBe(true);
      });

      const invalidCondition = insertBobbleheadSchema.safeParse({
        collectionId: randomUUID(),
        currentCondition: 'invalid_condition',
        name: 'Test',
      });
      expect(invalidCondition.success).toBe(false);

      const invalidStatus = insertBobbleheadSchema.safeParse({
        collectionId: randomUUID(),
        name: 'Test',
        status: 'invalid_status',
      });
      expect(invalidStatus.success).toBe(false);
    });

    it('should enforce field length limits', () => {
      const longName = 'a'.repeat(SCHEMA_LIMITS.BOBBLEHEAD.NAME.MAX + 1);
      const maxName = 'a'.repeat(SCHEMA_LIMITS.BOBBLEHEAD.NAME.MAX);
      const shortName = 'a'.repeat(SCHEMA_LIMITS.BOBBLEHEAD.NAME.MIN - 1);
      const minName = 'a'.repeat(SCHEMA_LIMITS.BOBBLEHEAD.NAME.MIN);

      const tooLong = insertBobbleheadSchema.safeParse({
        collectionId: randomUUID(),
        name: longName,
      });
      expect(tooLong.success).toBe(false);

      const maxLength = insertBobbleheadSchema.safeParse({
        collectionId: randomUUID(),
        name: maxName,
      });
      expect(maxLength.success).toBe(true);

      const tooShort = insertBobbleheadSchema.safeParse({
        collectionId: randomUUID(),
        name: shortName,
      });
      expect(tooShort.success).toBe(false);

      const minLength = insertBobbleheadSchema.safeParse({
        collectionId: randomUUID(),
        name: minName,
      });
      expect(minLength.success).toBe(true);
    });
  });

  describe('updateBobbleheadSchema', () => {
    it('should allow all fields to be optional', () => {
      const emptyUpdate = {};
      const result = updateBobbleheadSchema.safeParse(emptyUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate partial updates', () => {
      const partialUpdate = {
        description: 'Updated description',
        name: 'Updated Name',
        status: 'sold' as const,
      };

      const result = updateBobbleheadSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Updated Name');
        expect(result.data.description).toBe('Updated description');
        expect(result.data.status).toBe('sold');
      }
    });

    it('should maintain validation rules for provided fields', () => {
      const invalidUpdate = {
        name: 'a', // Too short
        year: 1799, // Too early
      };

      const result = updateBobbleheadSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });

  describe('getBobbleheadByIdSchema', () => {
    it('should validate UUID format', () => {
      const validId = { id: randomUUID() };
      const result = getBobbleheadByIdSchema.safeParse(validId);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      const invalidIds = [{ id: 'not-a-uuid' }, { id: '12345' }, { id: '' }, {}];

      invalidIds.forEach((data) => {
        const result = getBobbleheadByIdSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('getBobbleheadsByCollectionSchema', () => {
    it('should validate with required collectionId', () => {
      const validData = {
        collectionId: randomUUID(),
      };

      const result = getBobbleheadsByCollectionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20); // Default
        expect(result.data.offset).toBe(0); // Default
      }
    });

    it('should validate pagination parameters', () => {
      const validData = {
        collectionId: randomUUID(),
        limit: 50,
        offset: 100,
      };

      const result = getBobbleheadsByCollectionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
        expect(result.data.offset).toBe(100);
      }
    });

    it('should enforce limit boundaries', () => {
      const tooHigh = {
        collectionId: randomUUID(),
        limit: 101,
      };

      const tooLow = {
        collectionId: randomUUID(),
        limit: 0,
      };

      expect(getBobbleheadsByCollectionSchema.safeParse(tooHigh).success).toBe(false);
      expect(getBobbleheadsByCollectionSchema.safeParse(tooLow).success).toBe(false);
    });
  });

  describe('searchBobbleheadsSchema', () => {
    it('should validate complete search parameters', () => {
      const validSearch = {
        filters: {
          category: 'Sports',
          collectionId: randomUUID(),
          manufacturer: 'Test Manufacturer',
          maxYear: 2024,
          minYear: 2000,
          status: 'owned' as const,
        },
        limit: 50,
        offset: 0,
        searchTerm: 'test search',
      };

      const result = searchBobbleheadsSchema.safeParse(validSearch);
      expect(result.success).toBe(true);
    });

    it('should allow empty search', () => {
      const emptySearch = {};
      const result = searchBobbleheadsSchema.safeParse(emptySearch);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.filters).toEqual({});
        expect(result.data.limit).toBe(20);
        expect(result.data.offset).toBe(0);
      }
    });

    it('should validate year range in filters', () => {
      const invalidYearRange = {
        filters: {
          maxYear: 1999,
          minYear: 2000,
        },
      };

      const validYearRange = {
        filters: {
          maxYear: 2024,
          minYear: 2000,
        },
      };

      // Note: The schema doesn't enforce min < max, but validates individual bounds
      const resultInvalid = searchBobbleheadsSchema.safeParse(invalidYearRange);
      expect(resultInvalid.success).toBe(true); // Both years are valid individually

      const resultValid = searchBobbleheadsSchema.safeParse(validYearRange);
      expect(resultValid.success).toBe(true);
    });

    it('should trim search term', () => {
      const searchWithWhitespace = {
        searchTerm: '  test search  ',
      };

      const result = searchBobbleheadsSchema.safeParse(searchWithWhitespace);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.searchTerm).toBe('test search');
      }
    });
  });

  describe('deleteBobbleheadSchema', () => {
    it('should validate single delete request', () => {
      const validDelete = {
        id: randomUUID(),
      };

      const result = deleteBobbleheadSchema.safeParse(validDelete);
      expect(result.success).toBe(true);
    });

    it('should validate UUID format', () => {
      const uuid = randomUUID();
      const validDelete = {
        id: uuid,
      };

      const result = deleteBobbleheadSchema.safeParse(validDelete);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(uuid);
      }
    });
  });

  describe('deleteBobbleheadsSchema', () => {
    it('should validate bulk delete request', () => {
      const validBulkDelete = {
        ids: [randomUUID(), randomUUID(), randomUUID()],
      };

      const result = deleteBobbleheadsSchema.safeParse(validBulkDelete);
      expect(result.success).toBe(true);
    });

    it('should require at least one ID', () => {
      const emptyDelete = {
        ids: [],
      };

      const result = deleteBobbleheadsSchema.safeParse(emptyDelete);
      expect(result.success).toBe(false);
    });

    it('should validate each UUID in array', () => {
      const mixedIds = {
        ids: [randomUUID(), 'not-a-uuid', randomUUID()],
      };

      const result = deleteBobbleheadsSchema.safeParse(mixedIds);
      expect(result.success).toBe(false);
    });
  });

  describe('reorderPhotosSchema', () => {
    it('should validate photo reorder request', () => {
      const validReorder = {
        bobbleheadId: randomUUID(),
        updates: [
          { id: randomUUID(), sortOrder: 0 },
          { id: randomUUID(), sortOrder: 1 },
          { id: randomUUID(), sortOrder: 2 },
        ],
      };

      const result = reorderPhotosSchema.safeParse(validReorder);
      expect(result.success).toBe(true);
    });

    it('should require at least one update', () => {
      const emptyUpdates = {
        bobbleheadId: randomUUID(),
        updates: [],
      };

      const result = reorderPhotosSchema.safeParse(emptyUpdates);
      expect(result.success).toBe(false);
    });

    it('should validate sortOrder is non-negative', () => {
      const negativeSortOrder = {
        bobbleheadId: randomUUID(),
        updates: [{ id: randomUUID(), sortOrder: -1 }],
      };

      const result = reorderPhotosSchema.safeParse(negativeSortOrder);
      expect(result.success).toBe(false);
    });
  });

  describe('publicBobbleheadSchema', () => {
    it('should validate public bobblehead structure', () => {
      const publicBobblehead = {
        acquisitionDate: null,
        acquisitionMethod: null,
        category: null,
        characterName: null,
        collectionId: randomUUID(),
        commentCount: 0,
        createdAt: new Date(),
        currentCondition: 'good',
        customFields: null,
        description: null,
        height: null,
        id: randomUUID(),
        isFeatured: false,
        isPublic: true,
        likeCount: 0,
        manufacturer: null,
        material: null,
        name: 'Test Bobblehead',
        purchaseLocation: null,
        purchasePrice: null,
        series: null,
        status: 'owned',
        subCollectionId: null,
        updatedAt: new Date(),
        userId: randomUUID(),
        viewCount: 0,
        weight: null,
        year: null,
      };

      const result = publicBobbleheadSchema.safeParse(publicBobblehead);
      if (!result.success) {
        console.error('Validation errors:', result.error.issues);
      }
      expect(result.success).toBe(true);
    });
  });

  describe('deleteBobbleheadPhotoSchema', () => {
    it('should validate photo deletion request', () => {
      const validDelete = {
        bobbleheadId: randomUUID(),
        id: randomUUID(),
      };

      const result = deleteBobbleheadPhotoSchema.safeParse(validDelete);
      expect(result.success).toBe(true);
    });

    it('should require both IDs', () => {
      const missingBobbleheadId = {
        id: randomUUID(),
      };

      const missingPhotoId = {
        bobbleheadId: randomUUID(),
      };

      expect(deleteBobbleheadPhotoSchema.safeParse(missingBobbleheadId).success).toBe(false);
      expect(deleteBobbleheadPhotoSchema.safeParse(missingPhotoId).success).toBe(false);
    });
  });
});
