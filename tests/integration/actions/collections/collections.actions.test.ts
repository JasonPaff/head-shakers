/**
 * Collections Actions Integration Tests
 *
 * Tests the server action layer for collection CRUD operations.
 * Verifies action response format (ActionResponse<T>) and error handling.
 *
 * Note: Business logic is thoroughly tested in collections.facade.test.ts
 * These tests focus on the action layer responses and error message format.
 *
 * Tests cover:
 * - Action success/failure response format
 * - Permission checks at action level
 * - Error message responses
 * - Integration with real database via Testcontainers
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ERROR_MESSAGES } from '@/lib/constants';

import { createTestCollection } from '../../../fixtures/collection.factory';
import { createTestUser } from '../../../fixtures/user.factory';
import { getTestDb, resetTestDatabase } from '../../../setup/test-db';

// Mock server-only to allow importing server actions in tests
vi.mock('server-only', () => ({}));

// Mock the database to use test database
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
  withScope: vi.fn(
    <T>(callback: (scope: { setContext: () => void; setTag: () => void; setUser: () => void }) => T): T =>
      callback({
        setContext: vi.fn(),
        setTag: vi.fn(),
        setUser: vi.fn(),
      }),
  ),
}));

// Mock cache service to avoid external calls
vi.mock('@/lib/services/cache.service', () => ({
  CacheService: {
    collections: {
      browseResults: <T>(_key: unknown, callback: () => T): T => callback(),
      byId: <T>(_key: unknown, callback: () => T): T => callback(),
      byUser: <T>(_key: unknown, callback: () => T): T => callback(),
      dashboard: <T>(_key: unknown, callback: () => T): T => callback(),
      list: <T>(_key: unknown, callback: () => T): T => callback(),
      public: <T>(_key: unknown, callback: () => T): T => callback(),
      user: <T>(_key: unknown, callback: () => T): T => callback(),
      withRelations: <T>(_key: unknown, callback: () => T): T => callback(),
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

// Mock Clerk authentication
const mockAuth = vi.fn();
const mockCurrentUser = vi.fn();

vi.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth,
  currentUser: mockCurrentUser,
}));

// Import actions AFTER all mocks are set up
const { createCollectionAction, deleteCollectionAction, updateCollectionAction } = await import(
  '@/lib/actions/collections/collections.actions'
);

describe('Collections Actions Integration Tests', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    await resetTestDatabase();
    vi.clearAllMocks();

    // Create test user in database
    testUser = await createTestUser();

    // Mock Clerk auth to return test user's Clerk ID
    mockAuth.mockResolvedValue({ userId: testUser!.clerkId });
    mockCurrentUser.mockResolvedValue({
      emailAddresses: [{ emailAddress: testUser!.email }],
      id: testUser!.clerkId,
      primaryEmailAddressId: 'primary-email-id',
      username: testUser!.username,
    });
  });

  afterEach(async () => {
    await resetTestDatabase();
    vi.clearAllMocks();
  });

  describe('createCollectionAction', () => {
    it('should create collection with valid data and return success response', async () => {
      const input = {
        description: 'My awesome bobbleheads',
        isPublic: true,
        name: 'My Collection',
      };

      const result = await createCollectionAction(input);

      // Verify ActionResponse format
      expect(result?.data).toBeDefined();
      expect(result?.data?.wasSuccess).toBe(true);

      // Verify success response structure
      if (result?.data?.wasSuccess) {
        expect(result.data.data).toBeDefined();
        expect(result.data.data.name).toBe('My Collection');
        expect(result.data.data.description).toBe('My awesome bobbleheads');
        expect(result.data.data.isPublic).toBe(true);
        expect(result.data.data.userId).toBe(testUser!.id);
        expect(result.data.data.slug).toBeDefined();
        expect(result.data.message).toBe('Collection created successfully!');
      }
    });

    it('should return failure when collection name is already taken', async () => {
      // Create first collection
      await createTestCollection({
        name: 'Duplicate Name',
        userId: testUser!.id,
      });

      // Try to create another with same name
      const input = {
        description: 'Another description',
        isPublic: true,
        name: 'Duplicate Name',
      };

      const result = await createCollectionAction(input);

      // Verify ActionResponse failure format
      expect(result?.data).toBeDefined();
      expect(result?.data?.wasSuccess).toBe(false);

      // Verify failure response structure
      if (result?.data && !result.data.wasSuccess) {
        expect(result.data.data).toBeNull();
        expect(result.data.message).toBe(ERROR_MESSAGES.COLLECTION.NAME_TAKEN);
      }
    });
  });

  describe('updateCollectionAction', () => {
    it('should update collection and return success response', async () => {
      const collection = await createTestCollection({
        name: 'Original Name',
        userId: testUser!.id,
      });

      const input = {
        collectionId: collection!.id,
        description: 'Updated description',
        isPublic: false,
        name: 'Updated Name',
      };

      const result = await updateCollectionAction(input);

      // Verify ActionResponse success format
      expect(result?.data).toBeDefined();
      expect(result?.data?.wasSuccess).toBe(true);

      // Verify success response structure
      if (result?.data?.wasSuccess) {
        expect(result.data.data).toBeDefined();
        expect(result.data.data.name).toBe('Updated Name');
        expect(result.data.data.description).toBe('Updated description');
        expect(result.data.data.isPublic).toBe(false);
        expect(result.data.message).toBe('Collection updated successfully!');
      }
    });

    it('should return failure when user does not own the collection', async () => {
      // Create another user
      const otherUser = await createTestUser({ username: 'otheruser' });

      // Create collection owned by other user
      const collection = await createTestCollection({
        name: 'Other User Collection',
        userId: otherUser!.id,
      });

      // Try to update as test user (who doesn't own it)
      const input = {
        collectionId: collection!.id,
        description: 'Hacked description',
        isPublic: true,
        name: 'Hacked Name',
      };

      const result = await updateCollectionAction(input);

      // Verify the action throws or returns server error
      // The action will throw an error which gets caught by next-safe-action
      expect(result?.serverError).toBeDefined();
      expect(result?.data).toBeUndefined();
    });
  });

  describe('deleteCollectionAction', () => {
    it('should delete collection and return success response', async () => {
      const collection = await createTestCollection({
        name: 'To Delete',
        userId: testUser!.id,
      });

      const input = {
        collectionId: collection!.id,
      };

      const result = await deleteCollectionAction(input);

      // Verify ActionResponse success format
      expect(result?.data).toBeDefined();
      expect(result?.data?.wasSuccess).toBe(true);

      // Verify success response structure
      if (result?.data?.wasSuccess) {
        expect(result.data.data).toBeDefined();
        expect(result.data.data.id).toBe(collection!.id);
        expect(result.data.message).toBe('Collection deleted successfully!');
      }
    });

    it('should return failure when collection does not exist', async () => {
      const input = {
        collectionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Non-existent UUID
      };

      const result = await deleteCollectionAction(input);

      // Verify the action throws or returns server error
      // The action will throw an error which gets caught by next-safe-action
      expect(result?.serverError).toBeDefined();
      expect(result?.data).toBeUndefined();
    });
  });
});
