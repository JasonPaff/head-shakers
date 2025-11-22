/**
 * Social Facade Integration Tests
 *
 * These tests verify the Social business logic layer
 * using Testcontainers for real database interactions.
 *
 * Tests cover:
 * - Like operations (toggle, count)
 * - Comment CRUD operations
 * - Comment replies and nesting
 * - Permission checks
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SocialFacade } from '@/lib/facades/social/social.facade';

import { createTestBobblehead } from '../../fixtures/bobblehead.factory';
import { createTestCollection } from '../../fixtures/collection.factory';
import { createTestUser } from '../../fixtures/user.factory';
import { getTestDb, resetTestDatabase } from '../../setup/test-db';

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

// Mock cache service
vi.mock('@/lib/services/cache.service', () => ({
  CacheService: {
    bobbleheads: {
      byId: <T>(callback: () => T): T => callback(),
    },
    cached: <T>(callback: () => T): T => callback(),
    collections: {
      byId: <T>(callback: () => T): T => callback(),
      public: <T>(callback: () => T): T => callback(),
      user: <T>(callback: () => T): T => callback(),
    },
    invalidateByTag: vi.fn(),
    social: {
      comments: <T>(callback: () => T): T => callback(),
      likes: <T>(callback: () => T): T => callback(),
      likeStatus: <T>(callback: () => T): T => callback(),
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

describe('SocialFacade Integration Tests', () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterEach(async () => {
    await resetTestDatabase();
    vi.clearAllMocks();
  });

  describe('toggleLike', () => {
    it('should like a collection', async () => {
      const user = await createTestUser();
      const owner = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({ isPublic: true, userId: owner!.id });

      const result = await SocialFacade.toggleLike(collection!.id, 'collection', user!.id);

      expect(result.isSuccessful).toBe(true);
      expect(result.isLiked).toBe(true);
      expect(result.likeCount).toBe(1);
      expect(result.likeId).toBeDefined();
    });

    it('should unlike a previously liked collection', async () => {
      const user = await createTestUser();
      const owner = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({ isPublic: true, userId: owner!.id });

      // First like
      await SocialFacade.toggleLike(collection!.id, 'collection', user!.id);

      // Then unlike
      const result = await SocialFacade.toggleLike(collection!.id, 'collection', user!.id);

      expect(result.isSuccessful).toBe(true);
      expect(result.isLiked).toBe(false);
      expect(result.likeCount).toBe(0);
    });

    it('should like a bobblehead', async () => {
      const user = await createTestUser();
      const owner = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({ isPublic: true, userId: owner!.id });
      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        userId: owner!.id,
      });

      const result = await SocialFacade.toggleLike(bobblehead!.id, 'bobblehead', user!.id);

      expect(result.isSuccessful).toBe(true);
      expect(result.isLiked).toBe(true);
    });

    it('should track like count across multiple users', async () => {
      const users = await Promise.all([
        createTestUser({ username: 'user1' }),
        createTestUser({ username: 'user2' }),
        createTestUser({ username: 'user3' }),
      ]);
      const owner = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({ isPublic: true, userId: owner!.id });

      // All users like the collection
      for (const user of users) {
        await SocialFacade.toggleLike(collection!.id, 'collection', user!.id);
      }

      const result = await SocialFacade.toggleLike(collection!.id, 'collection', users[0]!.id);

      // First user unlikes, count should be 2
      expect(result.likeCount).toBe(2);
    });
  });

  describe('getUserLikeStatus', () => {
    it('should return like status for a user', async () => {
      const user = await createTestUser();
      const owner = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({ isPublic: true, userId: owner!.id });

      // Like the collection
      await SocialFacade.toggleLike(collection!.id, 'collection', user!.id);

      const result = await SocialFacade.getUserLikeStatus(collection!.id, 'collection', user!.id);

      expect(result.isLiked).toBe(true);
    });

    it('should return not liked for user who has not liked', async () => {
      const user = await createTestUser();
      const owner = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({ isPublic: true, userId: owner!.id });

      const result = await SocialFacade.getUserLikeStatus(collection!.id, 'collection', user!.id);

      expect(result.isLiked).toBe(false);
    });
  });

  describe('createComment', () => {
    it('should create a comment on a collection', async () => {
      const user = await createTestUser();
      const owner = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({ isPublic: true, userId: owner!.id });

      const result = await SocialFacade.createComment(
        {
          content: 'Great collection!',
          targetId: collection!.id,
          targetType: 'collection',
        },
        user!.id,
      );

      expect(result.isSuccessful).toBe(true);
      expect(result.comment).toBeDefined();
      expect(result.comment!.content).toBe('Great collection!');
      expect(result.comment!.userId).toBe(user!.id);
    });

    it('should create a comment on a bobblehead', async () => {
      const user = await createTestUser();
      const owner = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({ isPublic: true, userId: owner!.id });
      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        userId: owner!.id,
      });

      const result = await SocialFacade.createComment(
        {
          content: 'Nice bobblehead!',
          targetId: bobblehead!.id,
          targetType: 'bobblehead',
        },
        user!.id,
      );

      expect(result.isSuccessful).toBe(true);
      expect(result.comment!.targetType).toBe('bobblehead');
    });
  });

  describe('createCommentReply', () => {
    it('should create a reply to an existing comment', async () => {
      const user = await createTestUser();
      const replier = await createTestUser({ username: 'replier' });
      const owner = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({ isPublic: true, userId: owner!.id });

      // Create parent comment
      const parentResult = await SocialFacade.createComment(
        {
          content: 'Original comment',
          targetId: collection!.id,
          targetType: 'collection',
        },
        user!.id,
      );

      // Create reply
      const replyResult = await SocialFacade.createCommentReply(
        {
          content: 'This is a reply',
          parentCommentId: parentResult.comment!.id,
          targetId: collection!.id,
          targetType: 'collection',
        },
        replier!.id,
      );

      expect(replyResult.isSuccessful).toBe(true);
      expect(replyResult.comment!.parentCommentId).toBe(parentResult.comment!.id);
    });

    it('should fail when replying to non-existent comment', async () => {
      const user = await createTestUser();
      const owner = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({ isPublic: true, userId: owner!.id });

      const result = await SocialFacade.createCommentReply(
        {
          content: 'Reply to nothing',
          parentCommentId: '00000000-0000-0000-0000-000000000000',
          targetId: collection!.id,
          targetType: 'collection',
        },
        user!.id,
      );

      expect(result.isSuccessful).toBe(false);
      expect(result.error).toContain('Parent comment not found');
    });
  });

  describe('updateComment', () => {
    it('should update own comment', async () => {
      const user = await createTestUser();
      const owner = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({ isPublic: true, userId: owner!.id });

      // Create comment
      const createResult = await SocialFacade.createComment(
        {
          content: 'Original content',
          targetId: collection!.id,
          targetType: 'collection',
        },
        user!.id,
      );

      // Update comment
      const updateResult = await SocialFacade.updateComment(
        createResult.comment!.id,
        'Updated content',
        user!.id,
      );

      expect(updateResult.isSuccessful).toBe(true);
      expect(updateResult.comment!.content).toBe('Updated content');
    });

    it('should not allow updating another user comment', async () => {
      const user = await createTestUser();
      const otherUser = await createTestUser({ username: 'other' });
      const owner = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({ isPublic: true, userId: owner!.id });

      // Create comment as user
      const createResult = await SocialFacade.createComment(
        {
          content: 'My comment',
          targetId: collection!.id,
          targetType: 'collection',
        },
        user!.id,
      );

      // Try to update as other user
      const updateResult = await SocialFacade.updateComment(
        createResult.comment!.id,
        'Hacked content',
        otherUser!.id,
      );

      expect(updateResult.isSuccessful).toBe(false);
    });
  });

  describe('deleteComment', () => {
    it('should delete own comment', async () => {
      const user = await createTestUser();
      const owner = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({ isPublic: true, userId: owner!.id });

      // Create comment
      const createResult = await SocialFacade.createComment(
        {
          content: 'To be deleted',
          targetId: collection!.id,
          targetType: 'collection',
        },
        user!.id,
      );

      // Delete comment
      const deleteResult = await SocialFacade.deleteComment(createResult.comment!.id, user!.id);

      expect(deleteResult).toBe(true);
    });

    it('should not allow deleting another user comment', async () => {
      const user = await createTestUser();
      const otherUser = await createTestUser({ username: 'other' });
      const owner = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({ isPublic: true, userId: owner!.id });

      // Create comment as user
      const createResult = await SocialFacade.createComment(
        {
          content: 'Protected comment',
          targetId: collection!.id,
          targetType: 'collection',
        },
        user!.id,
      );

      // Try to delete as other user
      const deleteResult = await SocialFacade.deleteComment(createResult.comment!.id, otherUser!.id);

      expect(deleteResult).toBe(false);
    });
  });

  describe('getComments', () => {
    it('should return comments for a target', async () => {
      const users = await Promise.all([
        createTestUser({ username: 'user1' }),
        createTestUser({ username: 'user2' }),
      ]);
      const owner = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({ isPublic: true, userId: owner!.id });

      // Create multiple comments
      await SocialFacade.createComment(
        { content: 'Comment 1', targetId: collection!.id, targetType: 'collection' },
        users[0]!.id,
      );
      await SocialFacade.createComment(
        { content: 'Comment 2', targetId: collection!.id, targetType: 'collection' },
        users[1]!.id,
      );

      const result = await SocialFacade.getComments(
        collection!.id,
        'collection',
        { limit: 10, offset: 0 },
        users[0]!.id,
      );

      expect(result.comments.length).toBe(2);
    });

    it('should paginate comments', async () => {
      const user = await createTestUser();
      const owner = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({ isPublic: true, userId: owner!.id });

      // Create 5 comments
      for (let i = 0; i < 5; i++) {
        await SocialFacade.createComment(
          { content: `Comment ${i}`, targetId: collection!.id, targetType: 'collection' },
          user!.id,
        );
      }

      const page1 = await SocialFacade.getComments(
        collection!.id,
        'collection',
        { limit: 2, offset: 0 },
        user!.id,
      );

      const page2 = await SocialFacade.getComments(
        collection!.id,
        'collection',
        { limit: 2, offset: 2 },
        user!.id,
      );

      expect(page1.comments.length).toBe(2);
      expect(page2.comments.length).toBe(2);
      expect(page1.hasMore).toBe(true);
    });
  });
});
