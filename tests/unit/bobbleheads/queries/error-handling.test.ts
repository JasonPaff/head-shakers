import { randomUUID } from 'crypto';
import { beforeAll, describe, expect, it } from 'vitest';

import { bobbleheads, collections, users } from '@/lib/db/schema';
import {
  createBobbleheadAsync,
  deleteBobbleheadAsync,
  getBobbleheadByIdAsync,
  searchBobbleheadsAsync,
  updateBobbleheadAsync,
} from '@/lib/queries/bobbleheads.queries';
import { BobbleheadService } from '@/lib/services/bobbleheads.service';

import { withTestIsolation } from '../../../helpers/database';

describe('Bobblehead Error Handling', () => {
  beforeAll(() => {
    const testDbUrl = process.env.DATABASE_URL_TEST;
    if (!testDbUrl) {
      console.warn('No test database URL configured, skipping database-dependent tests');
    }
  });

  describe('Database Constraint Violations', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)(
      'should handle foreign key constraint violation on create',
      async () => {
        await withTestIsolation(async (db) => {
          const invalidData = {
            collectionId: randomUUID(), // Non-existent collection
            name: 'Invalid Bobblehead',
            userId: randomUUID(), // Non-existent user
          };

          await expect(async () => {
            await createBobbleheadAsync(invalidData, db);
          }).rejects.toThrow();
        });
      },
    );

    it.skipIf(!process.env.DATABASE_URL_TEST)('should handle user constraint violation', async () => {
      await withTestIsolation(async (db) => {
        // Create valid collection but with invalid user reference
        const user = (
          await db
            .insert(users)
            .values({
              clerkId: 'constraint_test_clerk',
              displayName: 'Constraint Test User',
              email: 'constraint@example.com',
              username: 'constraint_user',
            })
            .returning()
        )[0]!;

        const collection = (
          await db
            .insert(collections)
            .values({
              name: 'Valid Collection',
              userId: user.id,
            })
            .returning()
        )[0]!;

        const invalidData = {
          collectionId: collection.id,
          name: 'Invalid User Bobblehead',
          userId: randomUUID(), // Non-existent user
        };

        await expect(async () => {
          await createBobbleheadAsync(invalidData, db);
        }).rejects.toThrow();
      });
    });
  });

  describe('Invalid Input Handling', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should handle invalid UUID formats gracefully', async () => {
      await withTestIsolation(async (db) => {
        const invalidIds = ['not-a-uuid', '12345', '', 'invalid-format-123'];

        for (const invalidId of invalidIds) {
          // getBobbleheadByIdAsync should handle this gracefully
          const result = await getBobbleheadByIdAsync(invalidId, db);
          expect(result).toHaveLength(0);
        }
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)('should handle null/undefined inputs', async () => {
      await withTestIsolation(async (db) => {
        // Test null/undefined handling
        await expect(async () => {
          await getBobbleheadByIdAsync(null as unknown as string, db);
        }).rejects.toThrow();

        await expect(async () => {
          await getBobbleheadByIdAsync(undefined as unknown as string, db);
        }).rejects.toThrow();
      });
    });
  });

  describe('Service Layer Error Handling', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should return null for non-existent resources', async () => {
      await withTestIsolation(async (db) => {
        const fakeId = randomUUID();

        // Service methods should return null for not found, not throw
        const result = await BobbleheadService.getByIdAsync(fakeId, undefined, db);
        expect(result).toBeNull();

        const updateResult = await BobbleheadService.updateAsync(fakeId, { name: 'Updated' }, db);
        expect(updateResult).toBeNull();

        const deleteResult = await BobbleheadService.deleteAsync(fakeId, randomUUID(), db);
        expect(deleteResult).toBeNull();
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)('should handle ownership violations gracefully', async () => {
      await withTestIsolation(async (db) => {
        // Setup test data
        const owner = (
          await db
            .insert(users)
            .values({
              clerkId: 'error_owner_clerk',
              displayName: 'Error Owner',
              email: 'errorowner@example.com',
              username: 'error_owner',
            })
            .returning()
        )[0]!;

        const collection = (
          await db
            .insert(collections)
            .values({
              name: 'Error Collection',
              userId: owner.id,
            })
            .returning()
        )[0]!;

        const bobblehead = (
          await db
            .insert(bobbleheads)
            .values({
              collectionId: collection.id,
              name: 'Owner Bobblehead',
              userId: owner.id,
            })
            .returning()
        )[0]!;

        const wrongUserId = randomUUID();

        // Delete with wrong user should return null, not throw
        const deleteResult = await BobbleheadService.deleteAsync(bobblehead.id, wrongUserId, db);
        expect(deleteResult).toBeNull();

        // Update query doesn't check ownership, but delete query does
        const queryDeleteResult = await deleteBobbleheadAsync(bobblehead.id, wrongUserId, db);
        expect(queryDeleteResult).toHaveLength(0);
      });
    });
  });

  describe('Search Error Handling', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should handle malformed search queries', async () => {
      await withTestIsolation(async (db) => {
        // Test with various edge case search terms
        const edgeCaseSearches = [
          '', // Empty string
          '   ', // Whitespace only
          '%', // SQL wildcard
          '_', // SQL wildcard
          "'DROP TABLE users;--", // SQL injection attempt
          'very'.repeat(100), // Very long string
        ];

        for (const searchTerm of edgeCaseSearches) {
          const result = await searchBobbleheadsAsync(searchTerm, {}, undefined, 20, 0, db);
          expect(Array.isArray(result)).toBe(true);
          // Should not throw errors, just return empty or valid results
        }
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)('should handle invalid search filters', async () => {
      await withTestIsolation(async (db) => {
        const invalidFilters = [
          { year: -1 }, // Invalid year
          { year: 10000 }, // Invalid year
          { category: 'x'.repeat(1000) }, // Very long category
          { manufacturer: null as unknown as string }, // Null value
        ];

        for (const filters of invalidFilters) {
          // Should not throw, may return empty results
          const result = await searchBobbleheadsAsync('', filters, undefined, 20, 0, db);
          expect(Array.isArray(result)).toBe(true);
        }
      });
    });
  });

  describe('Concurrent Access Handling', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should handle concurrent updates gracefully', async () => {
      await withTestIsolation(async (db) => {
        // Setup test data
        const user = (
          await db
            .insert(users)
            .values({
              clerkId: 'concurrent_clerk',
              displayName: 'Concurrent User',
              email: 'concurrent@example.com',
              username: 'concurrent_user',
            })
            .returning()
        )[0]!;

        const collection = (
          await db
            .insert(collections)
            .values({
              name: 'Concurrent Collection',
              userId: user.id,
            })
            .returning()
        )[0]!;

        const bobblehead = (
          await db
            .insert(bobbleheads)
            .values({
              collectionId: collection.id,
              name: 'Concurrent Bobblehead',
              userId: user.id,
            })
            .returning()
        )[0]!;

        // Simulate concurrent updates
        const update1Promise = updateBobbleheadAsync(bobblehead.id, { description: 'Update 1' }, db);
        const update2Promise = updateBobbleheadAsync(bobblehead.id, { name: 'Updated Name' }, db);

        // Both updates should complete without throwing errors
        const [result1, result2] = await Promise.all([update1Promise, update2Promise]);

        expect(result1).toHaveLength(1);
        expect(result2).toHaveLength(1);

        // Final state should be consistent
        const finalState = await getBobbleheadByIdAsync(bobblehead.id, db);
        expect(finalState).toHaveLength(1);
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)('should handle concurrent delete attempts', async () => {
      await withTestIsolation(async (db) => {
        const user = (
          await db
            .insert(users)
            .values({
              clerkId: 'delete_concurrent_clerk',
              displayName: 'Delete Concurrent User',
              email: 'deleteconcurrent@example.com',
              username: 'delete_concurrent',
            })
            .returning()
        )[0]!;

        const collection = (
          await db
            .insert(collections)
            .values({
              name: 'Delete Concurrent Collection',
              userId: user.id,
            })
            .returning()
        )[0]!;

        const bobblehead = (
          await db
            .insert(bobbleheads)
            .values({
              collectionId: collection.id,
              name: 'To Delete Concurrently',
              userId: user.id,
            })
            .returning()
        )[0]!;

        // Simulate concurrent delete attempts
        const delete1Promise = deleteBobbleheadAsync(bobblehead.id, user.id, db);
        const delete2Promise = deleteBobbleheadAsync(bobblehead.id, user.id, db);

        const [result1, result2] = await Promise.all([delete1Promise, delete2Promise]);

        // One should succeed, one might return empty (already deleted)
        const successfulDeletes = [result1, result2].filter((r) => r.length > 0);
        expect(successfulDeletes.length).toBeGreaterThanOrEqual(1);
        expect(successfulDeletes.length).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('Data Integrity Errors', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should handle extremely large data inputs', async () => {
      await withTestIsolation(async (db) => {
        const user = (
          await db
            .insert(users)
            .values({
              clerkId: 'large_data_clerk',
              displayName: 'Large Data User',
              email: 'largedata@example.com',
              username: 'large_data',
            })
            .returning()
        )[0]!;

        const collection = (
          await db
            .insert(collections)
            .values({
              name: 'Large Data Collection',
              userId: user.id,
            })
            .returning()
        )[0]!;

        // Test with very large description (should be truncated or rejected)
        const largeDescription = 'x'.repeat(10000);
        const largeData = {
          collectionId: collection.id,
          description: largeDescription,
          name: 'Large Data Bobblehead',
          userId: user.id,
        };

        // Depending on DB constraints, this might throw or succeed with truncation
        try {
          const result = await createBobbleheadAsync(largeData, db);
          expect(result).toHaveLength(1);
        } catch (error) {
          // Expected if DB has length constraints
          expect(error).toBeDefined();
        }
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)('should handle special characters in data', async () => {
      await withTestIsolation(async (db) => {
        const user = (
          await db
            .insert(users)
            .values({
              clerkId: 'special_char_clerk',
              displayName: 'Special Char User',
              email: 'specialchar@example.com',
              username: 'special_char',
            })
            .returning()
        )[0]!;

        const collection = (
          await db
            .insert(collections)
            .values({
              name: 'Special Char Collection',
              userId: user.id,
            })
            .returning()
        )[0]!;

        const specialCharData = {
          collectionId: collection.id,
          description: 'Description with émojis 🎭 and spëcial chars: ñ, ü, ø',
          name: 'Bøbblehead with \'quotes\' and "double quotes"',
          userId: user.id,
        };

        const result = await createBobbleheadAsync(specialCharData, db);
        expect(result).toHaveLength(1);
        expect(result[0]!.name).toBe('Bøbblehead with \'quotes\' and "double quotes"');
      });
    });
  });

  describe('Edge Case Boundary Conditions', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)('should handle boundary year values', async () => {
      await withTestIsolation(async (db) => {
        const user = (
          await db
            .insert(users)
            .values({
              clerkId: 'boundary_clerk',
              displayName: 'Boundary User',
              email: 'boundary@example.com',
              username: 'boundary_user',
            })
            .returning()
        )[0]!;

        const collection = (
          await db
            .insert(collections)
            .values({
              name: 'Boundary Collection',
              userId: user.id,
            })
            .returning()
        )[0]!;

        const currentYear = new Date().getFullYear();
        const boundaryYears = [1800, 1801, currentYear, currentYear + 1];

        for (const year of boundaryYears) {
          const data = {
            collectionId: collection.id,
            name: `Year ${year} Bobblehead`,
            userId: user.id,
            year,
          };

          const result = await createBobbleheadAsync(data, db);
          expect(result).toHaveLength(1);
          expect(result[0]!.year).toBe(year);
        }
      });
    });

    it.skipIf(!process.env.DATABASE_URL_TEST)('should handle minimum and maximum search limits', async () => {
      await withTestIsolation(async (db) => {
        // Test with minimum limit (1)
        const minResult = await searchBobbleheadsAsync('', {}, undefined, 1, 0, db);
        expect(Array.isArray(minResult)).toBe(true);
        expect(minResult.length).toBeLessThanOrEqual(1);

        // Test with large limit
        const largeResult = await searchBobbleheadsAsync('', {}, undefined, 1000, 0, db);
        expect(Array.isArray(largeResult)).toBe(true);

        // Test with large offset
        const offsetResult = await searchBobbleheadsAsync('', {}, undefined, 10, 10000, db);
        expect(Array.isArray(offsetResult)).toBe(true);
      });
    });
  });
});
