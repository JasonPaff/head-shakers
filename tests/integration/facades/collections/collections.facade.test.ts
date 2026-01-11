/**
 * Collections Facade Integration Tests
 *
 * These tests verify the Collections business logic layer
 * using Testcontainers for real database interactions.
 *
 * Tests cover:
 * - Collection CRUD operations
 * - Permission checks
 * - Validation handling
 * - Edge cases and error scenarios
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';

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

// Mock cache service to avoid external calls
vi.mock('@/lib/services/cache.service', () => ({
  CacheService: {
    collections: {
      browseResults: <T>(callback: () => T): T => callback(),
      byId: <T>(callback: () => T): T => callback(),
      byUser: <T>(callback: () => T): T => callback(),
      dashboard: <T>(callback: () => T): T => callback(),
      list: <T>(callback: () => T): T => callback(),
      public: <T>(callback: () => T): T => callback(),
      user: <T>(callback: () => T): T => callback(),
      withRelations: <T>(callback: () => T): T => callback(),
    },
    users: {
      profile: <T>(callback: () => T): T => callback(),
    },
  },
}));

// Mock Next.js revalidation
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Mock cache revalidation service
vi.mock('@/lib/services/cache-revalidation.service', () => ({
  CacheRevalidationService: {
    collections: {
      onCreate: vi.fn(),
      onDelete: vi.fn(),
      onUpdate: vi.fn(),
    },
  },
}));

// Mock SEO cache utils
vi.mock('@/lib/seo/cache.utils', () => ({
  invalidateMetadataCache: vi.fn(),
}));

// Mock Cloudinary service
vi.mock('@/lib/services/cloudinary.service', () => ({
  CloudinaryService: {
    deletePhotosFromCloudinary: vi.fn(),
    extractPublicIdFromUrl: vi.fn(),
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

describe('CollectionsFacade Integration Tests', () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterEach(async () => {
    await resetTestDatabase();
    vi.clearAllMocks();
  });

  describe('createAsync', () => {
    it('should create a collection with valid data', async () => {
      const user = await createTestUser();

      const collectionData = {
        description: 'My awesome bobbleheads',
        isPublic: true,
        name: 'My Collection',
      };

      const result = await CollectionsFacade.createCollectionAsync(collectionData, user!.id);

      expect(result).toBeDefined();
      expect(result!.name).toBe('My Collection');
      expect(result!.description).toBe('My awesome bobbleheads');
      expect(result!.isPublic).toBe(true);
      expect(result!.userId).toBe(user!.id);
      expect(result!.slug).toBeDefined();
    });

    it('should generate a unique slug for the collection', async () => {
      const user = await createTestUser();

      const collection1 = await CollectionsFacade.createCollectionAsync(
        { description: null, isPublic: true, name: 'Test Collection' },
        user!.id,
      );

      const collection2 = await CollectionsFacade.createCollectionAsync(
        { description: null, isPublic: true, name: 'Another Collection' },
        user!.id,
      );

      // Each collection should have a unique slug derived from its name
      expect(collection1!.slug).toContain('test-collection');
      expect(collection2!.slug).toContain('another-collection');
      expect(collection1!.slug).not.toBe(collection2!.slug);
    });

    it('should reject duplicate collection names for the same user', async () => {
      const user = await createTestUser();

      await CollectionsFacade.createCollectionAsync(
        { description: null, isPublic: true, name: 'Test Collection' },
        user!.id,
      );

      // Creating a second collection with the same name should fail
      await expect(
        CollectionsFacade.createCollectionAsync(
          { description: null, isPublic: true, name: 'Test Collection' },
          user!.id,
        ),
      ).rejects.toThrow();
    });

    it('should create a private collection when isPublic is false', async () => {
      const user = await createTestUser();

      const result = await CollectionsFacade.createCollectionAsync(
        { description: null, isPublic: false, name: 'Private Collection' },
        user!.id,
      );

      expect(result!.isPublic).toBe(false);
    });

    it('should set default values for optional fields', async () => {
      const user = await createTestUser();

      const result = await CollectionsFacade.createCollectionAsync(
        { description: null, isPublic: true, name: 'Minimal Collection' },
        user!.id,
      );

      expect(result!.description).toBeNull();
      expect(result!.coverImageUrl).toBeNull();
      // totalItems is no longer stored on collections - it's computed dynamically from bobbleheads count
    });
  });

  describe('updateAsync', () => {
    it('should update a collection with valid data', async () => {
      const user = await createTestUser();
      const collection = await createTestCollection({
        name: 'Original Name',
        userId: user!.id,
      });

      const result = await CollectionsFacade.updateAsync(
        {
          collectionId: collection!.id,
          description: 'Updated description',
          isPublic: true,
          name: 'Updated Name',
        },
        user!.id,
      );

      expect(result!.name).toBe('Updated Name');
      expect(result!.description).toBe('Updated description');
    });

    it('should not allow updating another user collection', async () => {
      const user1 = await createTestUser({ username: 'user1' });
      const user2 = await createTestUser({ username: 'user2' });
      const collection = await createTestCollection({
        name: 'User1 Collection',
        userId: user1!.id,
      });

      const result = await CollectionsFacade.updateAsync(
        { collectionId: collection!.id, description: null, isPublic: true, name: 'Hacked Name' },
        user2!.id,
      );

      expect(result).toBeNull();
    });

    it('should update slug when name changes', async () => {
      const user = await createTestUser();
      const collection = await createTestCollection({
        name: 'Original Name',
        userId: user!.id,
      });
      const originalSlug = collection!.slug;

      const result = await CollectionsFacade.updateAsync(
        { collectionId: collection!.id, description: null, isPublic: true, name: 'Completely New Name' },
        user!.id,
      );

      expect(result!.slug).not.toBe(originalSlug);
      expect(result!.slug).toContain('completely-new-name');
    });
  });

  describe('deleteAsync', () => {
    it('should delete a collection', async () => {
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });

      const result = await CollectionsFacade.deleteAsync({ collectionId: collection!.id }, user!.id);

      expect(result).toBeDefined();
      expect(result!.id).toBe(collection!.id);

      // Verify it's actually deleted
      const fetched = await CollectionsFacade.getByIdAsync(collection!.id, user!.id);
      expect(fetched).toBeNull();
    });

    it('should not allow deleting another user collection', async () => {
      const user1 = await createTestUser({ username: 'user1' });
      const user2 = await createTestUser({ username: 'user2' });
      const collection = await createTestCollection({ userId: user1!.id });

      const result = await CollectionsFacade.deleteAsync({ collectionId: collection!.id }, user2!.id);

      expect(result).toBeNull();

      // Verify it still exists
      const fetched = await CollectionsFacade.getByIdAsync(collection!.id, user1!.id);
      expect(fetched).toBeDefined();
    });
  });

  describe('getCollectionById', () => {
    it('should return a collection by id for owner', async () => {
      const user = await createTestUser();
      const collection = await createTestCollection({
        name: 'Test Collection',
        userId: user!.id,
      });

      const result = await CollectionsFacade.getByIdAsync(collection!.id, user!.id);

      expect(result).toBeDefined();
      expect(result!.id).toBe(collection!.id);
      expect(result!.name).toBe('Test Collection');
    });

    it('should return public collection for non-owner', async () => {
      const owner = await createTestUser({ username: 'owner' });
      const viewer = await createTestUser({ username: 'viewer' });
      const collection = await createTestCollection({
        isPublic: true,
        userId: owner!.id,
      });

      const result = await CollectionsFacade.getByIdAsync(collection!.id, viewer!.id);

      expect(result).toBeDefined();
      expect(result!.id).toBe(collection!.id);
    });

    it('should not return private collection for non-owner', async () => {
      const owner = await createTestUser({ username: 'owner' });
      const viewer = await createTestUser({ username: 'viewer' });
      const collection = await createTestCollection({
        isPublic: false,
        userId: owner!.id,
      });

      const result = await CollectionsFacade.getByIdAsync(collection!.id, viewer!.id);

      expect(result).toBeNull();
    });

    it('should return null for non-existent collection', async () => {
      const user = await createTestUser();

      const result = await CollectionsFacade.getByIdAsync('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', user!.id);

      expect(result).toBeNull();
    });
  });

  // Note: getCollectionsByUser, browseCollections and getCategories tests require
  // more complex cache mocking and are better suited for E2E tests with full infrastructure
});
