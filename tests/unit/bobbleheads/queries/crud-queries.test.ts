import { randomUUID } from 'crypto';
import { beforeAll, describe, expect, it } from 'vitest';

import { DEFAULTS } from '@/lib/constants';
import { bobbleheads, collections, users } from '@/lib/db/schema';
import {
  createBobbleheadAsync,
  deleteBobbleheadAsync,
  deleteBobbleheadsAsync,
  getBobbleheadByIdAsync,
  getBobbleheadsByCollectionAsync,
  getBobbleheadsByUserAsync,
  getBobbleheadWithDetailsAsync,
  updateBobbleheadAsync,
} from '@/lib/queries/bobbleheads.queries';
import { insertBobbleheadSchema } from '@/lib/validations/bobbleheads.validation';

import { withTestIsolation } from '../../../helpers/database.helpers';

describe('Bobblehead CRUD Queries', () => {
  beforeAll(() => {
    const testDbUrl = process.env.DATABASE_URL_TEST;
    if (!testDbUrl) {
      console.warn('No test database URL configured, skipping database-dependent tests');
    }
  });

  describe('createBobbleheadAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should create a new bobblehead', async () => {
      await withTestIsolation(async (db) => {
        // Setup test data
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'test_clerk_create',
            displayName: 'Test User',
            email: 'create@example.com',
            username: 'create_user',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Test Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        // Test create operation
        const bobbleheadData = {
          category: 'Sports',
          collectionId: collection.id,
          name: 'Test Bobblehead',
          userId: user.id,
        };

        const parsed = insertBobbleheadSchema.parse(bobbleheadData);
        const result = await createBobbleheadAsync(parsed, user.id, db);

        expect(result).toHaveLength(1);
        expect(result[0]).toBeDefined();
        expect(result[0]!.name).toBe('Test Bobblehead');
        expect(result[0]!.category).toBe('Sports');
        expect(result[0]!.collectionId).toBe(collection.id);
        expect(result[0]!.userId).toBe(user.id);
        expect(result[0]!.id).toBeDefined();
        expect(result[0]!.createdAt).toBeInstanceOf(Date);
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)('should apply defaults when creating', async () => {
      await withTestIsolation(async (db) => {
        // Setup test data
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'test_clerk_defaults',
            displayName: 'Default User',
            email: 'defaults@example.com',
            username: 'default_user',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Default Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        // Test minimal data
        const minimalData = {
          collectionId: collection.id,
          name: 'Minimal Bobblehead',
          userId: user.id,
        };

        const parsed = insertBobbleheadSchema.parse(minimalData);
        const result = await createBobbleheadAsync(parsed, user.id, db);

        expect(result[0]!.currentCondition).toBe(DEFAULTS.BOBBLEHEAD.CONDITION);
        expect(result[0]!.status).toBe(DEFAULTS.BOBBLEHEAD.STATUS);
        expect(result[0]!.isPublic).toBe(DEFAULTS.BOBBLEHEAD.IS_PUBLIC);
        expect(result[0]!.isFeatured).toBe(DEFAULTS.BOBBLEHEAD.IS_FEATURED);
        expect(result[0]!.likeCount).toBe(0);
        expect(result[0]!.commentCount).toBe(0);
        expect(result[0]!.viewCount).toBe(0);
      });
    });
  });

  describe('getBobbleheadByIdAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should retrieve bobblehead by ID', async () => {
      await withTestIsolation(async (db) => {
        // Setup test data
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'test_clerk_getbyid',
            displayName: 'Get User',
            email: 'getbyid@example.com',
            username: 'get_user',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Get Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        const bobbleheadResult = await db
          .insert(bobbleheads)
          .values({
            collectionId: collection.id,
            name: 'Get Test Bobblehead',
            userId: user.id,
          })
          .returning();
        const bobblehead = bobbleheadResult[0]!;

        // Test get by ID
        const result = await getBobbleheadByIdAsync(bobblehead.id, db);

        expect(result).toHaveLength(1);
        expect(result[0]!.id).toBe(bobblehead.id);
        expect(result[0]!.name).toBe('Get Test Bobblehead');
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)('should return empty array for non-existent ID', async () => {
      await withTestIsolation(async (db) => {
        const fakeId = randomUUID();
        const result = await getBobbleheadByIdAsync(fakeId, db);

        expect(result).toHaveLength(0);
      });
    });
  });

  describe('getBobbleheadWithDetailsAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)(
      'should respect visibility rules for public bobbleheads',
      async () => {
        await withTestIsolation(async (db) => {
          // Setup test data
          const userResult = await db
            .insert(users)
            .values({
              clerkId: 'test_clerk_visibility',
              displayName: 'Visibility User',
              email: 'visibility@example.com',
              username: 'visibility_user',
            })
            .returning();
          const user = userResult[0]!;

          const collectionResult = await db
            .insert(collections)
            .values({
              name: 'Visibility Collection',
              userId: user.id,
            })
            .returning();
          const collection = collectionResult[0]!;

          // Create public and private bobbleheads
          const publicBobblehead = await db
            .insert(bobbleheads)
            .values({
              collectionId: collection.id,
              isPublic: true,
              name: 'Public Bobblehead',
              userId: user.id,
            })
            .returning();

          const privateBobblehead = await db
            .insert(bobbleheads)
            .values({
              collectionId: collection.id,
              isPublic: false,
              name: 'Private Bobblehead',
              userId: user.id,
            })
            .returning();

          // Test without userId (anonymous)
          const publicResult = await getBobbleheadWithDetailsAsync(publicBobblehead[0]!.id, undefined, db);
          expect(publicResult).toHaveLength(1);

          const privateResult = await getBobbleheadWithDetailsAsync(privateBobblehead[0]!.id, undefined, db);
          expect(privateResult).toHaveLength(0);

          // Test with owner userId
          const privateWithOwner = await getBobbleheadWithDetailsAsync(privateBobblehead[0]!.id, user.id, db);
          expect(privateWithOwner).toHaveLength(1);

          // Test with different userId
          const differentUserId = randomUUID();
          const privateWithOther = await getBobbleheadWithDetailsAsync(
            privateBobblehead[0]!.id,
            differentUserId,
            db,
          );
          expect(privateWithOther).toHaveLength(0);
        });
      },
    );

    it.skipIf(!process.env.DATABASE_URL_TEST)('should exclude deleted bobbleheads', async () => {
      await withTestIsolation(async (db) => {
        // Setup test data
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'test_clerk_deleted',
            displayName: 'Deleted User',
            email: 'deleted@example.com',
            username: 'deleted_user',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Deleted Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        // Create a deleted bobblehead
        const deletedBobblehead = await db
          .insert(bobbleheads)
          .values({
            collectionId: collection.id,
            deletedAt: new Date(),
            isDeleted: true,
            isPublic: true,
            name: 'Deleted Bobblehead',
            userId: user.id,
          })
          .returning();

        // Test that deleted bobblehead is not returned
        const result = await getBobbleheadWithDetailsAsync(deletedBobblehead[0]!.id, undefined, db);
        expect(result).toHaveLength(0);
      });
    });
  });

  describe('updateBobbleheadAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should update bobblehead fields', async () => {
      await withTestIsolation(async (db) => {
        // Setup test data
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'test_clerk_update',
            displayName: 'Update User',
            email: 'update@example.com',
            username: 'update_user',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Update Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        const bobbleheadResult = await db
          .insert(bobbleheads)
          .values({
            collectionId: collection.id,
            currentCondition: 'good',
            description: 'Original description',
            name: 'Original Name',
            status: 'owned',
            userId: user.id,
          })
          .returning();
        const bobblehead = bobbleheadResult[0]!;

        // Test update
        const updateData = {
          currentCondition: 'excellent' as const,
          description: 'Updated description',
          name: 'Updated Name',
          status: 'sold' as const,
        };

        const result = await updateBobbleheadAsync(bobblehead.id, updateData, user.id, db);

        expect(result).toHaveLength(1);
        expect(result[0]!.name).toBe('Updated Name');
        expect(result[0]!.description).toBe('Updated description');
        expect(result[0]!.status).toBe('sold');
        expect(result[0]!.currentCondition).toBe('excellent');
        expect(result[0]!.updatedAt.getTime()).toBeGreaterThanOrEqual(bobblehead.updatedAt.getTime());
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)('should handle partial updates', async () => {
      await withTestIsolation(async (db) => {
        // Setup test data
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'test_clerk_partial',
            displayName: 'Partial User',
            email: 'partial@example.com',
            username: 'partial_user',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Partial Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        const bobbleheadResult = await db
          .insert(bobbleheads)
          .values({
            category: 'Sports',
            collectionId: collection.id,
            description: 'Original description',
            name: 'Original Name',
            userId: user.id,
          })
          .returning();
        const bobblehead = bobbleheadResult[0]!;

        // Test partial update
        const partialUpdate = {
          description: 'Only description updated',
        };

        const result = await updateBobbleheadAsync(bobblehead.id, partialUpdate, user.id, db);

        expect(result[0]!.description).toBe('Only description updated');
        expect(result[0]!.name).toBe('Original Name'); // Unchanged
        expect(result[0]!.category).toBe('Sports'); // Unchanged
      });
    });
  });

  describe('deleteBobbleheadAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should soft delete a bobblehead', async () => {
      await withTestIsolation(async (db) => {
        // Setup test data
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'test_clerk_delete',
            displayName: 'Delete User',
            email: 'delete@example.com',
            username: 'delete_user',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Delete Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        const bobbleheadResult = await db
          .insert(bobbleheads)
          .values({
            collectionId: collection.id,
            name: 'To Be Deleted',
            userId: user.id,
          })
          .returning();
        const bobblehead = bobbleheadResult[0]!;

        // Test delete
        const result = await deleteBobbleheadAsync(bobblehead.id, user.id, db);

        expect(result).toHaveLength(1);
        expect(result[0]!.isDeleted).toBe(true);
        expect(result[0]!.deletedAt).toBeInstanceOf(Date);

        // Verify it's soft deleted
        const checkResult = await getBobbleheadWithDetailsAsync(bobblehead.id, user.id, db);
        expect(checkResult).toHaveLength(0); // Should not return deleted items
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)('should only delete owned bobbleheads', async () => {
      await withTestIsolation(async (db) => {
        // Setup test data with two users
        const ownerResult = await db
          .insert(users)
          .values({
            clerkId: 'test_clerk_owner',
            displayName: 'Owner User',
            email: 'owner@example.com',
            username: 'owner_user',
          })
          .returning();
        const owner = ownerResult[0]!;

        const otherResult = await db
          .insert(users)
          .values({
            clerkId: 'test_clerk_other',
            displayName: 'Other User',
            email: 'other@example.com',
            username: 'other_user',
          })
          .returning();
        const other = otherResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Owner Collection',
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

        // Try to delete with wrong user
        const result = await deleteBobbleheadAsync(bobblehead.id, other.id, db);
        expect(result).toHaveLength(0);

        // Verify it's not deleted
        const checkResult = await getBobbleheadByIdAsync(bobblehead.id, db);
        expect(checkResult[0]!.isDeleted).toBe(false);
      });
    });
  });

  describe('deleteBobbleheadsAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should soft delete multiple bobbleheads', async () => {
      await withTestIsolation(async (db) => {
        // Setup test data
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'test_clerk_bulk_delete',
            displayName: 'Bulk Delete User',
            email: 'bulk_delete@example.com',
            username: 'bulk_delete_user',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Bulk Delete Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        // Create multiple bobbleheads
        const bobblehead1 = await db
          .insert(bobbleheads)
          .values({
            collectionId: collection.id,
            name: 'Bulk Delete 1',
            userId: user.id,
          })
          .returning();

        const bobblehead2 = await db
          .insert(bobbleheads)
          .values({
            collectionId: collection.id,
            name: 'Bulk Delete 2',
            userId: user.id,
          })
          .returning();

        const bobblehead3 = await db
          .insert(bobbleheads)
          .values({
            collectionId: collection.id,
            name: 'Bulk Delete 3',
            userId: user.id,
          })
          .returning();

        const ids = [bobblehead1[0]!.id, bobblehead2[0]!.id, bobblehead3[0]!.id];

        // Test bulk delete
        const result = await deleteBobbleheadsAsync(ids, user.id, db);

        expect(result).toHaveLength(3);
        result.forEach((item) => {
          expect(item.isDeleted).toBe(true);
          expect(item.deletedAt).toBeInstanceOf(Date);
        });
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)('should only delete owned items in bulk', async () => {
      await withTestIsolation(async (db) => {
        // Setup test data with two users
        const user1Result = await db
          .insert(users)
          .values({
            clerkId: 'test_clerk_bulk1',
            displayName: 'Bulk User 1',
            email: 'bulk1@example.com',
            username: 'bulk_user1',
          })
          .returning();
        const user1 = user1Result[0]!;

        const user2Result = await db
          .insert(users)
          .values({
            clerkId: 'test_clerk_bulk2',
            displayName: 'Bulk User 2',
            email: 'bulk2@example.com',
            username: 'bulk_user2',
          })
          .returning();
        const user2 = user2Result[0]!;

        const collection1Result = await db
          .insert(collections)
          .values({
            name: 'User 1 Collection',
            userId: user1.id,
          })
          .returning();
        const collection1 = collection1Result[0]!;

        const collection2Result = await db
          .insert(collections)
          .values({
            name: 'User 2 Collection',
            userId: user2.id,
          })
          .returning();
        const collection2 = collection2Result[0]!;

        // Create bobbleheads for different users
        const bobblehead1 = await db
          .insert(bobbleheads)
          .values({
            collectionId: collection1.id,
            name: 'User 1 Bobblehead',
            userId: user1.id,
          })
          .returning();

        const bobblehead2 = await db
          .insert(bobbleheads)
          .values({
            collectionId: collection2.id,
            name: 'User 2 Bobblehead',
            userId: user2.id,
          })
          .returning();

        const ids = [bobblehead1[0]!.id, bobblehead2[0]!.id];

        // Try to delete both with user1 (should only delete user1's bobblehead)
        const result = await deleteBobbleheadsAsync(ids, user1.id, db);

        expect(result).toHaveLength(1);
        expect(result[0]!.userId).toBe(user1.id);

        // Verify user2's bobblehead is not deleted
        const checkResult = await getBobbleheadByIdAsync(bobblehead2[0]!.id, db);
        expect(checkResult[0]!.isDeleted).toBe(false);
      });
    });
  });

  describe('getBobbleheadsByCollectionAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should get all bobbleheads in a collection', async () => {
      await withTestIsolation(async (db) => {
        // Setup test data
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'test_clerk_collection',
            displayName: 'Collection User',
            email: 'collection@example.com',
            username: 'collection_user',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Test Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        // Create multiple bobbleheads in the same collection
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
            name: 'Private Item',
            userId: user.id,
          },
        ]);

        // Test getting collection items (public only)
        const publicResult = await getBobbleheadsByCollectionAsync(collection.id, undefined, db);
        expect(publicResult).toHaveLength(2);

        // Test getting collection items (with owner access)
        const ownerResult = await getBobbleheadsByCollectionAsync(collection.id, user.id, db);
        expect(ownerResult).toHaveLength(3);
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)('should order by createdAt descending', async () => {
      await withTestIsolation(async (db) => {
        // Setup test data
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'test_clerk_order',
            displayName: 'Order User',
            email: 'order@example.com',
            username: 'order_user',
          })
          .returning();
        const user = userResult[0]!;

        const collectionResult = await db
          .insert(collections)
          .values({
            name: 'Order Collection',
            userId: user.id,
          })
          .returning();
        const collection = collectionResult[0]!;

        // Create bobbleheads with different creation times
        const older = new Date('2024-01-01');
        const newer = new Date('2024-12-01');

        await db.insert(bobbleheads).values({
          collectionId: collection.id,
          createdAt: older,
          isPublic: true,
          name: 'Older Item',
          userId: user.id,
        });

        await db.insert(bobbleheads).values({
          collectionId: collection.id,
          createdAt: newer,
          isPublic: true,
          name: 'Newer Item',
          userId: user.id,
        });

        const result = await getBobbleheadsByCollectionAsync(collection.id, undefined, db);

        expect(result).toHaveLength(2);
        expect(result[0]!.name).toBe('Newer Item');
        expect(result[1]!.name).toBe('Older Item');
      });
    });
  });

  describe('getBobbleheadsByUserAsync', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should get all bobbleheads for a user', async () => {
      await withTestIsolation(async (db) => {
        // Setup test data
        const userResult = await db
          .insert(users)
          .values({
            clerkId: 'test_clerk_byuser',
            displayName: 'By User',
            email: 'byuser@example.com',
            username: 'by_user',
          })
          .returning();
        const user = userResult[0]!;

        // Create multiple collections
        const collection1 = await db
          .insert(collections)
          .values({
            name: 'User Collection 1',
            userId: user.id,
          })
          .returning();

        const collection2 = await db
          .insert(collections)
          .values({
            name: 'User Collection 2',
            userId: user.id,
          })
          .returning();

        // Create bobbleheads across collections
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

        // Test getting user's bobbleheads (viewer is not owner)
        const publicResult = await getBobbleheadsByUserAsync(user.id, randomUUID(), db);
        expect(publicResult).toHaveLength(1);
        expect(publicResult[0]!.name).toBe('User Item 1');

        // Test getting user's bobbleheads (viewer is owner)
        const ownerResult = await getBobbleheadsByUserAsync(user.id, user.id, db);
        expect(ownerResult).toHaveLength(2);
      });
    });
  });
});
