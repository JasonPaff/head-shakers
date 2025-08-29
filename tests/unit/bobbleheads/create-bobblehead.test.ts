import { randomUUID } from 'crypto';
import { beforeAll, describe, expect, it } from 'vitest';

import { DEFAULTS } from '@/lib/constants';
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
      const userResult = await db
        .insert(users)
        .values({
          clerkId: 'test_clerk_id_1',
          displayName: 'Test User 1',
          email: 'test1@example.com',
          username: 'test_user_1',
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
        currentCondition: 'poor' as const,
        isFeatured: false,
        isPublic: true,
        manufacturer: 'Test Manufacturer',
        name: 'Test Bobblehead',
        status: 'sold' as const,
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
      expect(result!.currentCondition).toBe('poor');
      expect(result!.status).toBe('sold');
      expect(result!.id).toBeDefined();
      expect(result!.createdAt).toBeDefined();
      expect(result!.updatedAt).toBeDefined();
    });
  });

  it.skipIf(!process.env.DATABASE_URL_TEST)(
    'should create a bobblehead with only required fields',
    async () => {
      await withTestIsolation(async (db) => {
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'test_clerk_id_2',
            displayName: 'Test User 2',
            email: 'test2@example.com',
            username: 'test_user_2',
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
          name: 'Minimal Bobblehead',
          userId: user.id,
        };

        const result = await BobbleheadService.createAsync(bobbleheadData, db);

        expect(result).toBeDefined();
        expect(result!.name).toBe('Minimal Bobblehead');
        expect(result!.collectionId).toBe(collection.id);
        expect(result!.userId).toBe(user.id);
        expect(result!.currentCondition).toBe(DEFAULTS.BOBBLEHEAD.CONDITION);
        expect(result!.status).toBe(DEFAULTS.BOBBLEHEAD.STATUS);
        expect(result!.isPublic).toBe(DEFAULTS.BOBBLEHEAD.IS_PUBLIC);
        expect(result!.isFeatured).toBe(DEFAULTS.BOBBLEHEAD.IS_FEATURED);
        expect(result!.likeCount).toBe(DEFAULTS.BOBBLEHEAD.LIKE_COUNT);
        expect(result!.commentCount).toBe(DEFAULTS.BOBBLEHEAD.COMMENT_COUNT);
        expect(result!.viewCount).toBe(DEFAULTS.BOBBLEHEAD.VIEW_COUNT);
      });
    },
  );

  it('should validate input schema requirements', () => {
    const validData = {
      collectionId: randomUUID(),
      currentCondition: 'excellent' as const,
      isFeatured: false,
      isPublic: true,
      name: 'Test Bobblehead',
      status: 'owned' as const,
      userId: randomUUID(),
    };

    const result = insertBobbleheadSchema.safeParse(validData);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe('Test Bobblehead');
      expect(result.data.collectionId).toBe(validData.collectionId);
      expect(result.data.userId).toBe(validData.userId);
      expect(result.data.currentCondition).toBe('excellent');
      expect(result.data.status).toBe('owned');
      expect(result.data.isPublic).toBe(true);
      expect(result.data.isFeatured).toBe(false);
    }
  });

  it('should apply default values when fields are omitted', () => {
    const minimalData = {
      collectionId: randomUUID(),
      name: 'Test Bobblehead',
      userId: randomUUID(),
    };

    const result = insertBobbleheadSchema.safeParse(minimalData);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe('Test Bobblehead');
      expect(result.data.collectionId).toBe(minimalData.collectionId);
      expect(result.data.userId).toBe(minimalData.userId);
      expect(result.data.currentCondition).toBe(DEFAULTS.BOBBLEHEAD.CONDITION);
      expect(result.data.status).toBe(DEFAULTS.BOBBLEHEAD.STATUS);
      expect(result.data.isPublic).toBe(DEFAULTS.BOBBLEHEAD.IS_PUBLIC);
      expect(result.data.isFeatured).toBe(DEFAULTS.BOBBLEHEAD.IS_FEATURED);
    }
  });

  describe('Validation Tests - Required Fields', () => {
    it('should fail when name is missing', () => {
      const invalidData = {
        collectionId: randomUUID(),
        userId: randomUUID(),
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
        userId: randomUUID(),
      };

      const result = insertBobbleheadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const collectionIdError = result.error.issues.find((issue) => issue.path.includes('collectionId'));
        expect(collectionIdError?.message).toBe('collectionId is required');
      }
    });

    it('should fail when userId is missing', () => {
      const invalidData = {
        collectionId: randomUUID(),
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
        userId: randomUUID(),
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
        collectionId: randomUUID(),
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
        collectionId: randomUUID(),
        name: longName,
        userId: randomUUID(),
      };

      const result = insertBobbleheadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should succeed when name is exactly 200 characters', () => {
      const maxLengthName = 'a'.repeat(200);
      const validData = {
        collectionId: randomUUID(),
        name: maxLengthName,
        userId: randomUUID(),
      };

      const result = insertBobbleheadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail when currentCondition is invalid enum value', () => {
      const invalidData = {
        collectionId: randomUUID(),
        currentCondition: 'invalid_condition',
        name: 'Test Bobblehead',
        userId: randomUUID(),
      };

      const result = insertBobbleheadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail when status is invalid enum value', () => {
      const invalidData = {
        collectionId: randomUUID(),
        name: 'Test Bobblehead',
        status: 'invalid_status',
        userId: randomUUID(),
      };

      const result = insertBobbleheadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail when year is below 1800', () => {
      const invalidData = {
        collectionId: randomUUID(),
        name: 'Test Bobblehead',
        userId: randomUUID(),
        year: 1799,
      };

      const result = insertBobbleheadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail when year is above next year', () => {
      const nextYear = new Date().getFullYear() + 2;
      const invalidData = {
        collectionId: randomUUID(),
        name: 'Test Bobblehead',
        userId: randomUUID(),
        year: nextYear,
      };

      const result = insertBobbleheadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should succeed when year is exactly next year', () => {
      const nextYear = new Date().getFullYear() + 1;
      const validData = {
        collectionId: randomUUID(),
        name: 'Test Bobblehead',
        userId: randomUUID(),
        year: nextYear,
      };

      const result = insertBobbleheadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Business Logic Tests - Collection Ownership', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should fail when collectionId does not exist', async () => {
      await withTestIsolation(async (db) => {
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'test_clerk_id',
            displayName: 'Test User',
            email: 'test@example.com',
            username: 'test_user_123',
          })
          .returning();
        const user = userResult[0]!;

        const bobbleheadData = {
          collectionId: randomUUID(),
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
          // create the user and their collection
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
            username: 'default_user',
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
          name: 'Test Bobblehead',
          userId: user.id,
        };

        const result = await BobbleheadService.createAsync(minimalData, db);

        expect(result).toBeDefined();
        expect(result!.currentCondition).toBe(DEFAULTS.BOBBLEHEAD.CONDITION);
        expect(result!.status).toBe(DEFAULTS.BOBBLEHEAD.STATUS);
        expect(result!.isPublic).toBe(DEFAULTS.BOBBLEHEAD.IS_PUBLIC);
        expect(result!.isFeatured).toBe(DEFAULTS.BOBBLEHEAD.IS_FEATURED);
        expect(result!.likeCount).toBe(DEFAULTS.BOBBLEHEAD.LIKE_COUNT);
        expect(result!.commentCount).toBe(DEFAULTS.BOBBLEHEAD.COMMENT_COUNT);
        expect(result!.viewCount).toBe(DEFAULTS.BOBBLEHEAD.VIEW_COUNT);
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)(
      'should override defaults when values are explicitly provided',
      async () => {
        await withTestIsolation(async (db) => {
          const userResult = await db
            .insert(users)
            .values({
              clerkId: 'override_test_clerk_id',
              displayName: 'Override Test User',
              email: 'overridetest@example.com',
              username: 'override_user',
            })
            .returning();
          const user = userResult[0]!;

          const collectionResult = await db
            .insert(collections)
            .values({
              name: 'Override Test Collection',
              userId: user.id,
            })
            .returning();
          const collection = collectionResult[0]!;

          const explicitData = {
            collectionId: collection.id,
            currentCondition: 'poor' as const,
            isFeatured: true,
            isPublic: false,
            name: 'Test Bobblehead',
            status: 'sold' as const,
            userId: user.id,
          };

          const result = await BobbleheadService.createAsync(explicitData, db);

          expect(result).toBeDefined();
          expect(result!.currentCondition).toBe('poor');
          expect(result!.status).toBe('sold');
          expect(result!.isPublic).toBe(false);
          expect(result!.isFeatured).toBe(true);
        });
      },
    );
  });

  describe('Error Handling Tests', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)(
      'should handle database constraint violations gracefully',
      async () => {
        await withTestIsolation(async (db) => {
          const userResult = await db
            .insert(users)
            .values({
              clerkId: 'constraint_test_clerk_id',
              displayName: 'Constraint Test User',
              email: 'constrainttest@example.com',
              username: 'constraint_user',
            })
            .returning();
          const user = userResult[0]!;

          const collectionResult = await db
            .insert(collections)
            .values({
              name: 'Constraint Test Collection',
              userId: user.id,
            })
            .returning();
          const collection = collectionResult[0]!;

          const invalidUserIdData = {
            collectionId: collection.id,
            currentCondition: 'excellent' as const,
            isFeatured: false,
            isPublic: true,
            name: 'Test Bobblehead',
            status: 'owned' as const,
            userId: '00000000-0000-4000-8000-000000000000',
          };

          await expect(() => BobbleheadService.createAsync(invalidUserIdData, db)).rejects.toThrow();
        });
      },
    );
  });
});
