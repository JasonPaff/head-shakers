import { randomUUID } from 'crypto';
import { beforeAll, describe, expect, it } from 'vitest';

import { DEFAULTS } from '@/lib/constants';
import { bobbleheads, collections, users } from '@/lib/db/schema';
import { BobbleheadService } from '@/lib/services/bobbleheads.service';
import { insertBobbleheadSchema } from '@/lib/validations/bobbleheads.validation';

import { withTestIsolation } from '../../../helpers/database.helpers';

describe('BobbleheadService', () => {
  beforeAll(() => {
    const testDbUrl = process.env.DATABASE_URL_TEST;
    if (!testDbUrl) {
      console.warn('No test database URL configured, skipping database-dependent tests');
    }
  });

  describe('createAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should create a bobblehead and return it', async () => {
      await withTestIsolation(async (db) => {
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'service_create_clerk',
            displayName: 'Service Create User',
            email: 'service_create@example.com',
            username: 'service_create',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Service Create Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        const bobbleheadData = {
          category: 'Sports',
          collectionId: collection.id,
          description: 'Test description',
          name: 'Service Test Bobblehead',
          userId: user.id,
        };

        const parsed = insertBobbleheadSchema.parse(bobbleheadData);
        const result = await BobbleheadService.createAsync(parsed, user.id, db);

        expect(result).toBeDefined();
        expect(result).not.toBeNull();
        expect(result!.name).toBe('Service Test Bobblehead');
        expect(result!.category).toBe('Sports');
        expect(result!.description).toBe('Test description');
        expect(result!.id).toBeDefined();
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)('should handle database errors gracefully', async () => {
      await withTestIsolation(async (db) => {
        const invalidData = {
          collectionId: randomUUID(), // non-existent collection
          name: 'Will Fail',
          userId: randomUUID(), // non-existent user
        };

        const parsed = insertBobbleheadSchema.parse(invalidData);
        // should throw due to foreign key constraint
        await expect(() => BobbleheadService.createAsync(parsed, randomUUID(), db)).rejects.toThrow();
      });
    });
  });

  describe('createWithPhotosAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should create bobblehead without photos', async () => {
      await withTestIsolation(async (db) => {
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'service_photos_clerk',
            displayName: 'Service Photos User',
            email: 'service_photos@example.com',
            username: 'service_photos',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Service Photos Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        const bobbleheadData = {
          collectionId: collection.id,
          name: 'No Photos Bobblehead',
          userId: user.id,
        };

        const parsed = insertBobbleheadSchema.parse(bobbleheadData);
        const result = await BobbleheadService.createWithPhotosAsync(parsed, user.id, [], db);

        expect(result).toBeDefined();
        expect(result!.name).toBe('No Photos Bobblehead');
      });
    });
  });

  describe('updateAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should update a bobblehead and return it', async () => {
      await withTestIsolation(async (db) => {
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'service_update_clerk',
            displayName: 'Service Update User',
            email: 'service_update@example.com',
            username: 'service_update',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Service Update Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        const bobbleheadResult = await db
          .insert(bobbleheads)
          .values({
            collectionId: collection.id,
            description: 'Original',
            name: 'Original Name',
            status: 'owned',
            userId: user.id,
          })
          .returning();
        const bobblehead = bobbleheadResult[0]!;

        const updateData = {
          description: 'Updated',
          name: 'Updated Name',
          status: 'sold' as const,
        };

        const result = await BobbleheadService.updateAsync(bobblehead.id, updateData, user.id, db);

        expect(result).toBeDefined();
        expect(result).not.toBeNull();
        expect(result!.name).toBe('Updated Name');
        expect(result!.description).toBe('Updated');
        expect(result!.status).toBe('sold');
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)('should return null if bobblehead does not exist', async () => {
      await withTestIsolation(async (db) => {
        const fakeId = randomUUID();
        const updateData = { name: 'Will Not Update' };

        const result = await BobbleheadService.updateAsync(fakeId, updateData, randomUUID(), db);

        expect(result).toBeNull();
      });
    });
  });

  describe('deleteAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should soft delete a bobblehead', async () => {
      await withTestIsolation(async (db) => {
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'service_delete_clerk',
            displayName: 'Service Delete User',
            email: 'service_delete@example.com',
            username: 'service_delete',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Service Delete Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        const bobbleheadResult = await db
          .insert(bobbleheads)
          .values({
            collectionId: collection.id,
            name: 'To Delete',
            userId: user.id,
          })
          .returning();
        const bobblehead = bobbleheadResult[0]!;

        const result = await BobbleheadService.deleteAsync(bobblehead.id, user.id, db);

        expect(result).toBeDefined();
        expect(result).not.toBeNull();
        expect(result!.isDeleted).toBe(true);
        expect(result!.deletedAt).toBeInstanceOf(Date);
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)('should return null if not authorized', async () => {
      await withTestIsolation(async (db) => {
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'service_owner_clerk',
            displayName: 'Service Owner User',
            email: 'service_owner@example.com',
            username: 'service_owner',
          })
          .returning();
        const owner = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Service Owner Collection',
            userId: owner.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        const bobbleheadResult = await db
          .insert(bobbleheads)
          .values({
            collectionId: collection.id,
            name: 'Owner Bobblehead',
            userId: owner.id,
          })
          .returning();
        const bobblehead = bobbleheadResult[0]!;

        const differentUserId = randomUUID();
        const result = await BobbleheadService.deleteAsync(bobblehead.id, differentUserId, db);

        expect(result).toBeNull();
      });
    });
  });

  describe('deleteBulkAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should delete multiple bobbleheads', async () => {
      await withTestIsolation(async (db) => {
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'service_bulk_clerk',
            displayName: 'Service Bulk User',
            email: 'service_bulk@example.com',
            username: 'service_bulk',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Service Bulk Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        const bobblehead1 = await db
          .insert(bobbleheads)
          .values({
            collectionId: collection.id,
            name: 'Bulk 1',
            userId: user.id,
          })
          .returning();

        const bobblehead2 = await db
          .insert(bobbleheads)
          .values({
            collectionId: collection.id,
            name: 'Bulk 2',
            userId: user.id,
          })
          .returning();

        const ids = [bobblehead1[0]!.id, bobblehead2[0]!.id];

        const result = await BobbleheadService.deleteBulkAsync(ids, user.id, db);

        expect(result).toHaveLength(2);
        result.forEach((item) => {
          expect(item.isDeleted).toBe(true);
        });
      });
    });
  });

  describe('getByIdAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should get bobblehead with details', async () => {
      await withTestIsolation(async (db) => {
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'service_getbyid_clerk',
            displayName: 'Service GetById User',
            email: 'service_getbyid@example.com',
            username: 'service_getbyid',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Service GetById Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        const bobbleheadResult = await db
          .insert(bobbleheads)
          .values({
            collectionId: collection.id,
            isPublic: true,
            name: 'Get By Id Test',
            userId: user.id,
          })
          .returning();
        const bobblehead = bobbleheadResult[0]!;

        const result = await BobbleheadService.getByIdAsync(bobblehead.id, undefined, db);

        expect(result).toBeDefined();
        expect(result).not.toBeNull();
        expect(result!.name).toBe('Get By Id Test');
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)('should return null for non-existent bobblehead', async () => {
      await withTestIsolation(async (db) => {
        const fakeId = randomUUID();
        const result = await BobbleheadService.getByIdAsync(fakeId, undefined, db);

        expect(result).toBeNull();
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)('should respect privacy settings', async () => {
      await withTestIsolation(async (db) => {
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'service_privacy_clerk',
            displayName: 'Service Privacy User',
            email: 'service_privacy@example.com',
            username: 'service_privacy',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Service Privacy Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        const bobbleheadResult = await db
          .insert(bobbleheads)
          .values({
            collectionId: collection.id,
            isPublic: false,
            name: 'Private Bobblehead',
            userId: user.id,
          })
          .returning();
        const bobblehead = bobbleheadResult[0]!;

        // try to get private bobblehead without user ID
        const anonymousResult = await BobbleheadService.getByIdAsync(bobblehead.id, undefined, db);
        expect(anonymousResult).toBeNull();

        // try with owner user ID
        const ownerResult = await BobbleheadService.getByIdAsync(bobblehead.id, user.id, db);
        expect(ownerResult).not.toBeNull();
        expect(ownerResult!.name).toBe('Private Bobblehead');

        // try with different user ID
        const otherResult = await BobbleheadService.getByIdAsync(bobblehead.id, randomUUID(), db);
        expect(otherResult).toBeNull();
      });
    });
  });

  describe('getByIdBasicAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should get basic bobblehead data', async () => {
      await withTestIsolation(async (db) => {
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'service_basic_clerk',
            displayName: 'Service Basic User',
            email: 'service_basic@example.com',
            username: 'service_basic',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Service Basic Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        const bobbleheadResult = await db
          .insert(bobbleheads)
          .values({
            collectionId: collection.id,
            isPublic: false,
            name: 'Basic Test',
            userId: user.id,
          })
          .returning();
        const bobblehead = bobbleheadResult[0]!;

        const result = await BobbleheadService.getByIdBasicAsync(bobblehead.id, db);

        expect(result).toBeDefined();
        expect(result).not.toBeNull();
        expect(result!.name).toBe('Basic Test');
      });
    });
  });

  describe('getByCollectionAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should get all bobbleheads in collection', async () => {
      await withTestIsolation(async (db) => {
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'service_collection_clerk',
            displayName: 'Service Collection User',
            email: 'service_collection@example.com',
            username: 'service_collection',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Service Test Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        await db.insert(bobbleheads).values([
          {
            collectionId: collection.id,
            isPublic: true,
            name: 'Collection Item 1',
            userId: user.id,
          },
          {
            collectionId: collection.id,
            isPublic: true,
            name: 'Collection Item 2',
            userId: user.id,
          },
          {
            collectionId: collection.id,
            isPublic: false,
            name: 'Private Collection Item',
            userId: user.id,
          },
        ]);

        // get public items only
        const publicResult = await BobbleheadService.getByCollectionAsync(collection.id, undefined, db);
        expect(publicResult).toHaveLength(2);

        // get all items (owner)
        const ownerResult = await BobbleheadService.getByCollectionAsync(collection.id, user.id, db);
        expect(ownerResult).toHaveLength(3);
      });
    });
  });

  describe('getByUserAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should get all bobbleheads for a user', async () => {
      await withTestIsolation(async (db) => {
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'service_byuser_clerk',
            displayName: 'Service ByUser User',
            email: 'service_byuser@example.com',
            username: 'service_byuser',
          })
          .returning();
        const user = userResult[0]!;

        const collection1 = await db
          .insert(collections)
          .values({
            name: 'Service User Collection 1',
            userId: user.id,
          })
          .returning();

        const collection2 = await db
          .insert(collections)
          .values({
            name: 'Service User Collection 2',
            userId: user.id,
          })
          .returning();

        await db.insert(bobbleheads).values([
          {
            collectionId: collection1[0]!.id,
            isPublic: true,
            name: 'User Item 1',
            userId: user.id,
          },
          {
            collectionId: collection2[0]!.id,
            isPublic: false,
            name: 'User Item 2',
            userId: user.id,
          },
        ]);

        // get public items only
        const publicResult = await BobbleheadService.getByUserAsync(user.id, undefined, db);
        expect(publicResult).toHaveLength(1);

        // get all items (owner viewing)
        const ownerResult = await BobbleheadService.getByUserAsync(user.id, user.id, db);
        expect(ownerResult).toHaveLength(2);
      });
    });
  });

  describe('existsAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should return true if bobblehead exists', async () => {
      await withTestIsolation(async (db) => {
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'service_exists_clerk',
            displayName: 'Service Exists User',
            email: 'service_exists@example.com',
            username: 'service_exists',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Service Exists Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        const bobbleheadResult = await db
          .insert(bobbleheads)
          .values({
            collectionId: collection.id,
            name: 'Exists Test',
            userId: user.id,
          })
          .returning();
        const bobblehead = bobbleheadResult[0]!;

        const exists = await BobbleheadService.existsAsync(bobblehead.id, db);
        expect(exists).toBe(true);
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)(
      'should return false if bobblehead does not exist',
      async () => {
        await withTestIsolation(async (db) => {
          const fakeId = randomUUID();
          const exists = await BobbleheadService.existsAsync(fakeId, db);
          expect(exists).toBe(false);
        });
      },
    );
  });

  describe('belongsToUserAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should return true if user owns bobblehead', async () => {
      await withTestIsolation(async (db) => {
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'service_belongs_clerk',
            displayName: 'Service Belongs User',
            email: 'service_belongs@example.com',
            username: 'service_belongs',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Service Belongs Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        const bobbleheadResult = await db
          .insert(bobbleheads)
          .values({
            collectionId: collection.id,
            name: 'Belongs Test',
            userId: user.id,
          })
          .returning();
        const bobblehead = bobbleheadResult[0]!;

        const belongsToOwner = await BobbleheadService.belongsToUserAsync(bobblehead.id, user.id, db);
        expect(belongsToOwner).toBe(true);

        const belongsToOther = await BobbleheadService.belongsToUserAsync(bobblehead.id, randomUUID(), db);
        expect(belongsToOther).toBe(false);
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)('should return false for non-existent bobblehead', async () => {
      await withTestIsolation(async (db) => {
        const fakeId = randomUUID();
        const userId = randomUUID();
        const belongs = await BobbleheadService.belongsToUserAsync(fakeId, userId, db);
        expect(belongs).toBe(false);
      });
    });
  });

  describe('searchAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should search bobbleheads with filters', async () => {
      await withTestIsolation(async (db) => {
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'service_search_clerk',
            displayName: 'Service Search User',
            email: 'service_search@example.com',
            username: 'service_search',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Service Search Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        await db.insert(bobbleheads).values([
          {
            category: 'Sports',
            collectionId: collection.id,
            isPublic: true,
            manufacturer: 'Nike',
            name: 'Basketball Player',
            userId: user.id,
          },
          {
            category: 'Movies',
            collectionId: collection.id,
            isPublic: true,
            manufacturer: 'Funko',
            name: 'Movie Character',
            userId: user.id,
          },
          {
            category: 'Sports',
            collectionId: collection.id,
            isPublic: false,
            manufacturer: 'Nike',
            name: 'Private Sports Item',
            userId: user.id,
          },
        ]);

        // search by category
        const sportsResult = await BobbleheadService.searchAsync(
          '',
          { category: 'Sports' },
          undefined,
          20,
          0,
          db,
        );
        expect(sportsResult).toHaveLength(1); // Only public sports item

        // search by manufacturer
        const nikeResult = await BobbleheadService.searchAsync(
          '',
          { manufacturer: 'Nike' },
          user.id,
          20,
          0,
          db,
        );
        expect(nikeResult).toHaveLength(2); // Both Nike items (owner can see private)

        // search by text
        const textResult = await BobbleheadService.searchAsync('Character', {}, undefined, 20, 0, db);
        expect(textResult).toHaveLength(1);
        expect(textResult[0]!.name).toBe('Movie Character');
      });
    });
  });

  describe('Input Validation Tests', () => {
    it('should validate input schema requirements', () => {
      const validData = {
        collectionId: randomUUID(),
        currentCondition: 'excellent' as const,
        isFeatured: false,
        isPublic: true,
        name: 'Test Bobblehead',
        status: 'owned' as const,
      };

      const result = insertBobbleheadSchema.safeParse(validData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.name).toBe('Test Bobblehead');
        expect(result.data.collectionId).toBe(validData.collectionId);
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
      };

      const result = insertBobbleheadSchema.safeParse(minimalData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.name).toBe('Test Bobblehead');
        expect(result.data.collectionId).toBe(minimalData.collectionId);
        expect(result.data.currentCondition).toBe(DEFAULTS.BOBBLEHEAD.CONDITION);
        expect(result.data.status).toBe(DEFAULTS.BOBBLEHEAD.STATUS);
        expect(result.data.isPublic).toBe(DEFAULTS.BOBBLEHEAD.IS_PUBLIC);
        expect(result.data.isFeatured).toBe(DEFAULTS.BOBBLEHEAD.IS_FEATURED);
      }
    });

    describe('Required Fields', () => {
      it('should fail when name is missing', () => {
        const invalidData = {
          collectionId: randomUUID(),
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
        };

        const result = insertBobbleheadSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          const collectionIdError = result.error.issues.find((issue) => issue.path.includes('collectionId'));
          expect(collectionIdError?.message).toBe('Collection is required');
        }
      });

      it('should fail when collectionId is invalid UUID', () => {
        const invalidData = {
          collectionId: 'invalid-uuid',
          name: 'Test Bobblehead',
        };

        const result = insertBobbleheadSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          const collectionIdError = result.error.issues.find((issue) => issue.path.includes('collectionId'));
          expect(collectionIdError?.message).toBe('Collection is required');
        }
      });
    });

    describe('Data Integrity', () => {
      it('should fail when name exceeds 100 characters', () => {
        const longName = 'a'.repeat(101);
        const invalidData = {
          collectionId: randomUUID(),
          name: longName,
        };

        const result = insertBobbleheadSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should succeed when name is exactly 100 characters', () => {
        const maxLengthName = 'a'.repeat(100);
        const validData = {
          collectionId: randomUUID(),
          name: maxLengthName,
        };

        const result = insertBobbleheadSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should fail when currentCondition is invalid enum value', () => {
        const invalidData = {
          collectionId: randomUUID(),
          currentCondition: 'invalid_condition',
          name: 'Test Bobblehead',
        };

        const result = insertBobbleheadSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should fail when status is invalid enum value', () => {
        const invalidData = {
          collectionId: randomUUID(),
          name: 'Test Bobblehead',
          status: 'invalid_status',
        };

        const result = insertBobbleheadSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should fail when year is below 1800', () => {
        const invalidData = {
          collectionId: randomUUID(),
          name: 'Test Bobblehead',
          year: '1799',
        };

        const result = insertBobbleheadSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should fail when year is above next year', () => {
        const nextYear = new Date().getFullYear() + 2;
        const invalidData = {
          collectionId: randomUUID(),
          name: 'Test Bobblehead',
          year: nextYear.toString(),
        };

        const result = insertBobbleheadSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should succeed when year is exactly next year', () => {
        const nextYear = new Date().getFullYear() + 1;
        const validData = {
          collectionId: randomUUID(),
          name: 'Test Bobblehead',
          year: nextYear.toString(),
        };

        const result = insertBobbleheadSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });
  });
});
