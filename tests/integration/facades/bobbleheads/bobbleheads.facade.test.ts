/**
 * Bobbleheads Facade Integration Tests
 *
 * These tests verify the Bobbleheads business logic layer
 * using Testcontainers for real database interactions.
 *
 * Tests cover:
 * - Bobblehead CRUD operations
 * - Photo management
 * - Permission checks
 * - Collection relationships
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';

import { createTestBobblehead, createTestBobbleheads } from '../../../fixtures/bobblehead.factory';
import { createTestCollection } from '../../../fixtures/collection.factory';
import { createTestUser } from '../../../fixtures/user.factory';
import { getTestDb, resetTestDatabase } from '../../../setup/test-db';

// Mock the database to use the test container database
vi.mock('@/lib/db', () => ({
  get db() {
    return getTestDb();
  },
}));

// Mock Sentry to avoid external calls during tests
vi.mock('@sentry/nextjs', () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setContext: vi.fn(),
  setUser: vi.fn(),
  startSpan: vi.fn(
    <T>(
      _options: unknown,
      callback: (span: { recordException: () => void; setStatus: () => void }) => T,
    ): T => callback({ recordException: vi.fn(), setStatus: vi.fn() }),
  ),
}));

// Mock Cloudinary service
vi.mock('@/lib/services/cloudinary.service', () => ({
  CloudinaryService: {
    deletePhotosByUrls: vi.fn().mockResolvedValue([]),
    extractPublicIdFromUrl: vi.fn((url: string) => url),
    movePhotosToPermFolder: vi.fn((photos: Array<{ publicId: string; url: string }>) =>
      photos.map((p) => ({
        newPublicId: p.publicId,
        newUrl: p.url,
        oldPublicId: p.publicId,
      })),
    ),
  },
}));

// Mock cache service
vi.mock('@/lib/services/cache.service', () => ({
  CacheService: {
    bobbleheads: {
      byCollection: <T>(callback: () => T): T => callback(),
      byId: <T>(callback: () => T): T => callback(),
      byUser: <T>(callback: () => T): T => callback(),
      detail: <T>(callback: () => T): T => callback(),
      list: <T>(callback: () => T): T => callback(),
      photos: <T>(callback: () => T): T => callback(),
      search: <T>(callback: () => T): T => callback(),
      user: <T>(callback: () => T): T => callback(),
      withRelations: <T>(callback: () => T): T => callback(),
    },
    collections: {
      byId: <T>(callback: () => T): T => callback(),
      public: <T>(callback: () => T): T => callback(),
    },
  },
}));

// Mock Redis client to avoid connection issues in tests
vi.mock('@/lib/utils/redis-client', () => ({
  getRedisClient: vi.fn(() => ({
    del: vi.fn(),
    get: vi.fn(),
    keys: vi.fn().mockResolvedValue([]),
    set: vi.fn(),
  })),
  redis: {
    del: vi.fn(),
    get: vi.fn(),
    keys: vi.fn().mockResolvedValue([]),
    set: vi.fn(),
  },
}));

describe('BobbleheadsFacade Integration Tests', () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterEach(async () => {
    await resetTestDatabase();
    vi.clearAllMocks();
  });

  describe('createAsync', () => {
    it('should create a bobblehead with valid data', async () => {
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });

      const result = await BobbleheadsFacade.createAsync(
        {
          collectionId: collection!.id,
          currentCondition: 'good',
          isFeatured: false,
          isPublic: true,
          name: 'Michael Jordan',
          status: 'owned',
        },
        user!.id,
      );

      expect(result).toBeDefined();
      expect(result!.name).toBe('Michael Jordan');
      expect(result!.collectionId).toBe(collection!.id);
      expect(result!.userId).toBe(user!.id);
      expect(result!.slug).toBeDefined();
    });

    it('should generate unique slugs for same-named bobbleheads', async () => {
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });

      const bobblehead1 = await BobbleheadsFacade.createAsync(
        {
          collectionId: collection!.id,
          currentCondition: 'good',
          isFeatured: false,
          isPublic: true,
          name: 'Test Bobblehead',
          status: 'owned',
        },
        user!.id,
      );

      const bobblehead2 = await BobbleheadsFacade.createAsync(
        {
          collectionId: collection!.id,
          currentCondition: 'good',
          isFeatured: false,
          isPublic: true,
          name: 'Test Bobblehead',
          status: 'owned',
        },
        user!.id,
      );

      expect(bobblehead1!.slug).not.toBe(bobblehead2!.slug);
    });

    it('should create bobblehead with all optional fields', async () => {
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });

      const result = await BobbleheadsFacade.createAsync(
        {
          collectionId: collection!.id,
          currentCondition: 'mint',
          description: 'Limited edition',
          isFeatured: true,
          isPublic: true,
          manufacturer: 'FOCO',
          name: 'Rare Bobblehead',
          purchasePrice: 100,
          status: 'owned',
          year: 2024,
        },
        user!.id,
      );

      expect(result!.manufacturer).toBe('FOCO');
      expect(result!.currentCondition).toBe('mint');
      expect(result!.purchasePrice).toBe(100);
      expect(result!.year).toBe(2024);
    });
  });

  describe('updateAsync', () => {
    it('should update a bobblehead', async () => {
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });
      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Original Name',
        userId: user!.id,
      });

      const result = await BobbleheadsFacade.updateAsync(
        {
          collectionId: collection!.id,
          currentCondition: 'good',
          description: 'Updated description',
          id: bobblehead!.id,
          isFeatured: false,
          isPublic: true,
          name: 'Updated Name',
          status: 'owned',
        },
        user!.id,
      );

      expect(result!.name).toBe('Updated Name');
      expect(result!.description).toBe('Updated description');
    });

    it('should not allow updating another user bobblehead', async () => {
      const user1 = await createTestUser({ username: 'user1' });
      const user2 = await createTestUser({ username: 'user2' });
      const collection = await createTestCollection({ userId: user1!.id });
      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        userId: user1!.id,
      });

      const result = await BobbleheadsFacade.updateAsync(
        {
          collectionId: collection!.id,
          currentCondition: 'good',
          id: bobblehead!.id,
          isFeatured: false,
          isPublic: true,
          name: 'Hacked Name',
          status: 'owned',
        },
        user2!.id,
      );

      expect(result).toBeNull();
    });
  });

  describe('deleteAsync', () => {
    it('should delete a bobblehead', async () => {
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });
      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        userId: user!.id,
      });

      const result = await BobbleheadsFacade.deleteAsync({ bobbleheadId: bobblehead!.id }, user!.id);

      expect(result).toBeDefined();
      expect(result!.id).toBe(bobblehead!.id);
    });

    it('should not allow deleting another user bobblehead', async () => {
      const user1 = await createTestUser({ username: 'user1' });
      const user2 = await createTestUser({ username: 'user2' });
      const collection = await createTestCollection({ userId: user1!.id });
      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        userId: user1!.id,
      });

      const result = await BobbleheadsFacade.deleteAsync({ bobbleheadId: bobblehead!.id }, user2!.id);

      expect(result).toBeNull();
    });
  });

  describe('getBobbleheadById', () => {
    it('should return a bobblehead by id', async () => {
      const user = await createTestUser();
      const collection = await createTestCollection({ isPublic: true, userId: user!.id });
      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Test Bobblehead',
        userId: user!.id,
      });

      const result = await BobbleheadsFacade.getBobbleheadById(bobblehead!.id, user!.id);

      expect(result).toBeDefined();
      expect(result!.id).toBe(bobblehead!.id);
      expect(result!.name).toBe('Test Bobblehead');
    });

    it('should return null for non-existent bobblehead', async () => {
      const user = await createTestUser();

      const result = await BobbleheadsFacade.getBobbleheadById(
        '00000000-0000-0000-0000-000000000000',
        user!.id,
      );

      expect(result).toBeNull();
    });
  });

  describe('getBobbleheadsByCollection', () => {
    it('should return all bobbleheads in a collection', async () => {
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });
      await createTestBobbleheads(user!.id, collection!.id, 5);

      const result = await BobbleheadsFacade.getBobbleheadsByCollection(collection!.id, {}, user!.id);

      expect(result).toHaveLength(5);
    });

    it('should return empty array for collection with no bobbleheads', async () => {
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });

      const result = await BobbleheadsFacade.getBobbleheadsByCollection(collection!.id, {}, user!.id);

      expect(result).toEqual([]);
    });
  });

  describe('getBobbleheadsByUser', () => {
    it('should return all bobbleheads owned by a user', async () => {
      const user = await createTestUser();
      const collection1 = await createTestCollection({ name: 'Collection 1', userId: user!.id });
      const collection2 = await createTestCollection({ name: 'Collection 2', userId: user!.id });
      await createTestBobbleheads(user!.id, collection1!.id, 3);
      await createTestBobbleheads(user!.id, collection2!.id, 2);

      const result = await BobbleheadsFacade.getBobbleheadsByUser(user!.id, {}, user!.id);

      expect(result).toHaveLength(5);
    });

    it('should support pagination', async () => {
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });
      await createTestBobbleheads(user!.id, collection!.id, 10);

      const page1 = await BobbleheadsFacade.getBobbleheadsByUser(user!.id, { limit: 5, offset: 0 }, user!.id);
      const page2 = await BobbleheadsFacade.getBobbleheadsByUser(user!.id, { limit: 5, offset: 5 }, user!.id);

      expect(page1).toHaveLength(5);
      expect(page2).toHaveLength(5);
    });
  });

  describe('addPhotoAsync', () => {
    it('should add a photo to a bobblehead', async () => {
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });
      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        userId: user!.id,
      });

      const result = await BobbleheadsFacade.addPhotoAsync({
        bobbleheadId: bobblehead!.id,
        height: 600,
        isPrimary: true,
        sortOrder: 0,
        url: 'https://example.com/photo.jpg',
        width: 800,
      });

      expect(result).toBeDefined();
      expect(result!.bobbleheadId).toBe(bobblehead!.id);
      expect(result!.isPrimary).toBe(true);
    });
  });

  describe('getBobbleheadPhotos', () => {
    it('should return photos for a bobblehead', async () => {
      const user = await createTestUser();
      const collection = await createTestCollection({ isPublic: true, userId: user!.id });
      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        userId: user!.id,
      });

      // Add some photos
      await BobbleheadsFacade.addPhotoAsync({
        bobbleheadId: bobblehead!.id,
        height: 600,
        isPrimary: true,
        sortOrder: 0,
        url: 'https://example.com/photo1.jpg',
        width: 800,
      });
      await BobbleheadsFacade.addPhotoAsync({
        bobbleheadId: bobblehead!.id,
        height: 600,
        isPrimary: false,
        sortOrder: 1,
        url: 'https://example.com/photo2.jpg',
        width: 800,
      });

      const photos = await BobbleheadsFacade.getBobbleheadPhotos(bobblehead!.id, user!.id);

      expect(photos).toHaveLength(2);
      expect(photos[0]!.isPrimary).toBe(true);
    });
  });
});
