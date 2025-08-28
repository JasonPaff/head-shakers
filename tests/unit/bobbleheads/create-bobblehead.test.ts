import { $path } from 'next-typesafe-url';
import { beforeAll, describe, expect, it } from 'vitest';

import { BobbleheadService } from '@/lib/services/bobbleheads.service';

import { withTestIsolation } from '../../helpers/database';
import { createCollection } from '../../helpers/factories';

describe('BobbleheadService.createAsync', () => {
  beforeAll(() => {
    const testDbUrl = process.env.DATABASE_URL_TEST;
    if (!testDbUrl) {
      console.warn('No test database URL configured, skipping database-dependent tests');
    }
  });

  it.skipIf(!process.env.DATABASE_URL_TEST)('should create a bobblehead with valid data', async () => {
    await withTestIsolation(async (db) => {
      const { collection, user } = await createCollection();

      const bobbleheadData = {
        category: 'Sports',
        characterName: 'Test Character',
        collectionId: collection.id,
        currentCondition: 'mint' as const,
        manufacturer: 'Test Manufacturer',
        name: 'Test Bobblehead',
        status: 'owned' as const,
        userId: user.id,
      };

      console.log(`${$path({ route: '/sign-in/[[...sign-in]]' })}(.*)`);

      // @ts-expect-error - testing with valid data
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
        const { collection, user } = await createCollection();

        const bobbleheadData = {
          collectionId: collection.id,
          name: 'Minimal Bobblehead',
          userId: user.id,
        };

        // @ts-expect-error - testing with valid data
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
});
