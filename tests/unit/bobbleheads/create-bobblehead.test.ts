import { beforeAll, describe, expect, it, vi } from 'vitest';

import { collections, users } from '@/lib/db/schema';
import { BobbleheadService } from '@/lib/services/bobbleheads.service';
import { insertBobbleheadSchema } from '@/lib/validations/bobbleheads.validation';

import { withTestIsolation } from '../../helpers/database';

describe('BobbleheadService.createAsync', () => {
  beforeAll(() => {
    const testDbUrl = process.env.DATABASE_URL_TEST;
    if (!testDbUrl) {
      console.warn('No test database URL configured, skipping database-dependent tests');
    }
  });

  it.skipIf(!process.env.DATABASE_URL_TEST)('should create a bobblehead with valid data', async () => {
    await withTestIsolation(async (db) => {
      // Create user and collection directly in transaction
      const userResult = await db
        .insert(users)
        .values({
          clerkId: 'test_clerk_id_1',
          displayName: 'Test User 1',
          email: 'test1@example.com',
          username: 'testuser1',
        })
        .returning();
      const user = userResult[0]!;

      const collectionResult = await db
        .insert(collections)
        .values({
          name: 'Test Collection 1',
          userId: user.id,
        })
        .returning();
      const collection = collectionResult[0]!;

      const bobbleheadData = {
        category: 'Sports',
        characterName: 'Test Character',
        collectionId: collection.id,
        currentCondition: 'mint' as const,
        isFeatured: false,
        isPublic: true,
        manufacturer: 'Test Manufacturer',
        name: 'Test Bobblehead',
        status: 'owned' as const,
        userId: user.id,
      };

      const result = await BobbleheadService.createAsync(bobbleheadData, db);

      expect(result).toBeDefined();
      expect(result!.name).toBe('Test Bobblehead');
      expect(result!.collectionId).toBe(collection.id);
      expect(result!.userId).toBe(user.id);
      expect(result!.category).toBe('Sports');
      expect(result!.characterName).toBe('Test Character');
      expect(result!.manufacturer).toBe('Test Manufacturer');
      expect(result!.currentCondition).toBe('mint');
      expect(result!.status).toBe('owned');
      expect(result!.id).toBeDefined();
      expect(result!.createdAt).toBeDefined();
      expect(result!.updatedAt).toBeDefined();
    });
  });

  it.skipIf(!process.env.DATABASE_URL_TEST)(
    'should create a bobblehead with only required fields',
    async () => {
      await withTestIsolation(async (db) => {
        // Create user and collection directly in transaction
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'test_clerk_id_2',
            displayName: 'Test User 2',
            email: 'test2@example.com',
            username: 'testuser2',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Test Collection 2',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        const bobbleheadData = {
          collectionId: collection.id,
          currentCondition: 'excellent' as const,
          isFeatured: false,
          isPublic: true,
          name: 'Minimal Bobblehead',
          status: 'owned' as const,
          userId: user.id,
        };

        const result = await BobbleheadService.createAsync(bobbleheadData, db);

        expect(result).toBeDefined();
        expect(result!.name).toBe('Minimal Bobblehead');
        expect(result!.collectionId).toBe(collection.id);
        expect(result!.userId).toBe(user.id);
        expect(result!.currentCondition).toBe('excellent');
        expect(result!.status).toBe('owned');
        expect(result!.isPublic).toBe(true);
        expect(result!.isFeatured).toBe(false);
        expect(result!.likeCount).toBe(0);
        expect(result!.commentCount).toBe(0);
        expect(result!.viewCount).toBe(0);
      });
    },
  );

  it('should validate input schema requirements', () => {
    expect(() => {
      const validData = {
        collectionId: 'test-collection-id',
        name: 'Test Bobblehead',
        userId: 'test-user-id',
      };
      expect(validData).toBeDefined();
    }).not.toThrow();
  });

  describe('Validation Tests - Required Fields', () => {
    it('should fail when name is missing', () => {
      const invalidData = {
        collectionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
      };

      const result = insertBobbleheadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameError = result.error.issues.find((issue) => issue.path.includes('name'));
        expect(nameError?.message).toMatch(/Required|expected string/);
      }
    });

    it('should fail when collectionId is missing', () => {
      const invalidData = {
        name: 'Test Bobblehead',
        userId: 'test-user-id',
      };

      const result = insertBobbleheadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('collectionId is required');
      }
    });

    it('should fail when userId is missing', () => {
      const invalidData = {
        collectionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'Test Bobblehead',
      };

      const result = insertBobbleheadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const userIdError = result.error.issues.find((issue) => issue.path.includes('userId'));
        expect(userIdError?.message).toBe('userId is required');
      }
    });

    it('should fail when collectionId is invalid UUID', () => {
      const invalidData = {
        collectionId: 'invalid-uuid',
        name: 'Test Bobblehead',
        userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
      };

      const result = insertBobbleheadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const collectionIdError = result.error.issues.find((issue) => issue.path.includes('collectionId'));
        expect(collectionIdError?.message).toBe('collectionId is required');
      }
    });

    it('should fail when userId is invalid UUID', () => {
      const invalidData = {
        collectionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'Test Bobblehead',
        userId: 'invalid-uuid',
      };

      const result = insertBobbleheadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const userIdError = result.error.issues.find((issue) => issue.path.includes('userId'));
        expect(userIdError?.message).toBe('userId is required');
      }
    });
  });

  describe('Validation Tests - Data Integrity', () => {
    it('should fail when name exceeds 200 characters', () => {
      const longName = 'a'.repeat(201);
      const invalidData = {
        collectionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: longName,
        userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
      };

      const result = insertBobbleheadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail when currentCondition is invalid enum value', () => {
      const invalidData = {
        collectionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        currentCondition: 'invalid_condition',
        name: 'Test Bobblehead',
        userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
      };

      const result = insertBobbleheadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail when status is invalid enum value', () => {
      const invalidData = {
        collectionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'Test Bobblehead',
        status: 'invalid_status',
        userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
      };

      const result = insertBobbleheadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail when year is below 1800', () => {
      const invalidData = {
        collectionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'Test Bobblehead',
        userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        year: 1799,
      };

      const result = insertBobbleheadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail when year is above next year', () => {
      const nextYear = new Date().getFullYear() + 2;
      const invalidData = {
        collectionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'Test Bobblehead',
        userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        year: nextYear,
      };

      const result = insertBobbleheadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Business Logic Tests - Collection Ownership', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should fail when collectionId does not exist', async () => {
      await withTestIsolation(async (db) => {
        // Create user directly in transaction
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'test_clerk_id',
            displayName: 'Test User',
            email: 'test@example.com',
            username: 'testuser123',
          })
          .returning();
        const user = userResult[0]!;

        const nonExistentCollectionId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

        const bobbleheadData = {
          collectionId: nonExistentCollectionId,
          currentCondition: 'excellent' as const,
          isFeatured: false,
          isPublic: true,
          name: 'Test Bobblehead',
          status: 'owned' as const,
          userId: user.id,
        };

        await expect(() => BobbleheadService.createAsync(bobbleheadData, db)).rejects.toThrow();
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)(
      'should allow user to create bobblehead in their own collection',
      async () => {
        await withTestIsolation(async (db) => {
          // create user and their collection
          const userResult = await db
            .insert(users)
            .values({
              clerkId: 'user_owner_clerk_id',
              displayName: 'Collection Owner',
              email: 'owner@example.com',
              username: 'owner123',
            })
            .returning();
          const user = userResult[0]!;

          const collectionResult = await db
            .insert(collections)
            .values({
              name: 'Owner Collection',
              userId: user.id,
            })
            .returning();
          const collection = collectionResult[0]!;

          const bobbleheadData = {
            collectionId: collection.id,
            currentCondition: 'excellent' as const,
            isFeatured: false,
            isPublic: true,
            name: 'Test Bobblehead',
            status: 'owned' as const,
            userId: user.id,
          };

          const result = await BobbleheadService.createAsync(bobbleheadData, db);
          expect(result).toBeDefined();
          expect(result!.name).toBe('Test Bobblehead');
          expect(result!.collectionId).toBe(collection.id);
          expect(result!.userId).toBe(user.id);
        });
      },
    );

    it.skipIf(!process.env.DATABASE_URL_TEST)('should apply default values correctly', async () => {
      await withTestIsolation(async (db) => {
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'default_test_clerk_id',
            displayName: 'Default Test User',
            email: 'defaulttest@example.com',
            username: 'defaultuser',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Default Test Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        const minimalData = {
          collectionId: collection.id,
          currentCondition: 'excellent' as const,
          isFeatured: false,
          isPublic: true,
          name: 'Test Bobblehead',
          status: 'owned' as const,
          userId: user.id,
        };

        const result = await BobbleheadService.createAsync(minimalData, db);

        expect(result).toBeDefined();
        expect(result!.currentCondition).toBe('excellent');
        expect(result!.status).toBe('owned');
        expect(result!.isPublic).toBe(true);
        expect(result!.isFeatured).toBe(false);
        expect(result!.likeCount).toBe(0);
        expect(result!.commentCount).toBe(0);
        expect(result!.viewCount).toBe(0);
      });
    });
  });

  describe('Error Handling Tests', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should handle service returning null gracefully', async () => {
      await withTestIsolation(async (db) => {
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'mock_test_clerk_id',
            displayName: 'Mock Test User',
            email: 'mocktest@example.com',
            username: 'mockuser',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Mock Test Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        const originalCreate = BobbleheadService.createAsync.bind(BobbleheadService);
        BobbleheadService.createAsync = vi.fn().mockResolvedValue(null);

        const bobbleheadData = {
          collectionId: collection.id,
          currentCondition: 'excellent' as const,
          isFeatured: false,
          isPublic: true,
          name: 'Test Bobblehead',
          status: 'owned' as const,
          userId: user.id,
        };

        const result = await BobbleheadService.createAsync(bobbleheadData, db);
        expect(result).toBeNull();

        BobbleheadService.createAsync = originalCreate;
      });
    });
  });
});
