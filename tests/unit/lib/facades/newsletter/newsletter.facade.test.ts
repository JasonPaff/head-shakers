/* eslint-disable @typescript-eslint/unbound-method */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NewsletterSignupRecord } from '@/lib/queries/newsletter/newsletter.queries';

import { OPERATIONS } from '@/lib/constants';

// Mock all dependencies at the top of the test file
vi.mock('@/lib/queries/newsletter/newsletter.queries', () => ({
  NewsletterQuery: {
    createSignupAsync: vi.fn(),
    findByEmailAsync: vi.fn(),
    getIsActiveSubscriberAsync: vi.fn(),
    resubscribeAsync: vi.fn(),
    unsubscribeAsync: vi.fn(),
    updateUserIdAsync: vi.fn(),
  },
}));

vi.mock('@/lib/services/cache.service', () => ({
  CacheService: {
    newsletter: {
      isActiveSubscriber: vi.fn(),
    },
  },
}));

vi.mock('@/lib/services/cache-revalidation.service', () => ({
  CacheRevalidationService: {
    newsletter: {
      onSubscriptionChange: vi.fn(),
    },
  },
}));

vi.mock('@/lib/services/resend.service', () => ({
  ResendService: {
    sendNewsletterWelcomeAsync: vi.fn(),
  },
}));

vi.mock('@/lib/utils/facade-helpers', () => ({
  executeFacadeOperation: vi.fn((_config: unknown, operation: () => unknown) => operation()),
}));

vi.mock('@/lib/utils/sentry-server/breadcrumbs.server', () => ({
  captureFacadeWarning: vi.fn(),
  facadeBreadcrumb: vi.fn(),
}));

vi.mock('@/lib/utils/email-utils', () => ({
  maskEmail: vi.fn((email: string) => email.split('@')[0]?.substring(0, 3) + '***@' + email.split('@')[1]),
  normalizeEmail: vi.fn((email: string) => email.toLowerCase().trim()),
}));

import { NewsletterFacade } from '@/lib/facades/newsletter/newsletter.facade';
import { NewsletterQuery } from '@/lib/queries/newsletter/newsletter.queries';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { CacheService } from '@/lib/services/cache.service';
import { ResendService } from '@/lib/services/resend.service';
import { normalizeEmail } from '@/lib/utils/email-utils';
import { captureFacadeWarning } from '@/lib/utils/sentry-server/breadcrumbs.server';

describe('NewsletterFacade', () => {
  const mockDb = {} as never;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('subscribeAsync - New Subscriptions', () => {
    it('should create new subscription and send welcome email', async () => {
      // Arrange
      const email = 'test@example.com';
      const normalizedEmail = 'test@example.com';
      const newSignup: NewsletterSignupRecord = {
        createdAt: new Date(),
        email: normalizedEmail,
        id: 'signup-1',
        subscribedAt: new Date(),
        unsubscribedAt: null,
        userId: null,
      };

      vi.mocked(normalizeEmail).mockReturnValue(normalizedEmail);
      vi.mocked(NewsletterQuery.findByEmailAsync).mockResolvedValue(null);
      vi.mocked(NewsletterQuery.createSignupAsync).mockResolvedValue(newSignup);
      vi.mocked(ResendService.sendNewsletterWelcomeAsync).mockResolvedValue(true);

      // Act
      const result = await NewsletterFacade.subscribeAsync(email, undefined, mockDb);

      // Assert
      expect(result.isSuccessful).toBe(true);
      expect(result.isAlreadySubscribed).toBe(false);
      expect(result.signup).toEqual(newSignup);

      expect(vi.mocked(normalizeEmail)).toHaveBeenCalledWith(email);
      expect(vi.mocked(NewsletterQuery.findByEmailAsync)).toHaveBeenCalledWith(
        normalizedEmail,
        expect.any(Object),
      );
      expect(vi.mocked(NewsletterQuery.createSignupAsync)).toHaveBeenCalledWith(
        normalizedEmail,
        undefined,
        expect.any(Object),
      );
      expect(vi.mocked(CacheRevalidationService.newsletter.onSubscriptionChange)).toHaveBeenCalledWith(
        normalizedEmail,
        'subscribe',
      );

      // Allow async welcome email to settle
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(vi.mocked(ResendService.sendNewsletterWelcomeAsync)).toHaveBeenCalledWith(normalizedEmail);
    });

    it('should handle race condition (conflict after check)', async () => {
      // Arrange
      const email = 'test@example.com';
      const normalizedEmail = 'test@example.com';
      const existingSignup: NewsletterSignupRecord = {
        createdAt: new Date(),
        email: normalizedEmail,
        id: 'signup-1',
        subscribedAt: new Date(),
        unsubscribedAt: null,
        userId: null,
      };

      vi.mocked(normalizeEmail).mockReturnValue(normalizedEmail);
      vi.mocked(NewsletterQuery.findByEmailAsync)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingSignup);
      vi.mocked(NewsletterQuery.createSignupAsync).mockResolvedValue(null);

      // Act
      const result = await NewsletterFacade.subscribeAsync(email, undefined, mockDb);

      // Assert
      expect(result.isSuccessful).toBe(true);
      expect(result.isAlreadySubscribed).toBe(true);
      expect(result.signup).toEqual(existingSignup);

      expect(vi.mocked(NewsletterQuery.findByEmailAsync)).toHaveBeenCalledTimes(2);
      expect(vi.mocked(NewsletterQuery.createSignupAsync)).toHaveBeenCalledWith(
        normalizedEmail,
        undefined,
        expect.any(Object),
      );
    });

    it('should normalize email before all operations', async () => {
      // Arrange
      const email = 'Test@Example.COM  ';
      const normalizedEmail = 'test@example.com';

      vi.mocked(normalizeEmail).mockReturnValue(normalizedEmail);
      vi.mocked(NewsletterQuery.findByEmailAsync).mockResolvedValue(null);
      vi.mocked(NewsletterQuery.createSignupAsync).mockResolvedValue({
        createdAt: new Date(),
        email: normalizedEmail,
        id: 'signup-1',
        subscribedAt: new Date(),
        unsubscribedAt: null,
        userId: null,
      });

      // Act
      await NewsletterFacade.subscribeAsync(email, undefined, mockDb);

      // Assert
      expect(vi.mocked(normalizeEmail)).toHaveBeenCalledWith(email);
      expect(vi.mocked(NewsletterQuery.findByEmailAsync)).toHaveBeenCalledWith(
        normalizedEmail,
        expect.any(Object),
      );
      expect(vi.mocked(NewsletterQuery.createSignupAsync)).toHaveBeenCalledWith(
        normalizedEmail,
        undefined,
        expect.any(Object),
      );
    });

    it('should invalidate cache after successful subscription', async () => {
      // Arrange
      const email = 'test@example.com';
      const normalizedEmail = 'test@example.com';

      vi.mocked(normalizeEmail).mockReturnValue(normalizedEmail);
      vi.mocked(NewsletterQuery.findByEmailAsync).mockResolvedValue(null);
      vi.mocked(NewsletterQuery.createSignupAsync).mockResolvedValue({
        createdAt: new Date(),
        email: normalizedEmail,
        id: 'signup-1',
        subscribedAt: new Date(),
        unsubscribedAt: null,
        userId: null,
      });

      // Act
      await NewsletterFacade.subscribeAsync(email, undefined, mockDb);

      // Assert
      expect(vi.mocked(CacheRevalidationService.newsletter.onSubscriptionChange)).toHaveBeenCalledWith(
        normalizedEmail,
        'subscribe',
      );
    });
  });

  describe('subscribeAsync - Existing Subscribers', () => {
    it('should return success for already active subscriber (privacy-preserving)', async () => {
      // Arrange
      const email = 'test@example.com';
      const normalizedEmail = 'test@example.com';
      const activeSubscriber: NewsletterSignupRecord = {
        createdAt: new Date(),
        email: normalizedEmail,
        id: 'signup-1',
        subscribedAt: new Date(),
        unsubscribedAt: null,
        userId: null,
      };

      vi.mocked(normalizeEmail).mockReturnValue(normalizedEmail);
      vi.mocked(NewsletterQuery.findByEmailAsync).mockResolvedValue(activeSubscriber);

      // Act
      const result = await NewsletterFacade.subscribeAsync(email, undefined, mockDb);

      // Assert
      expect(result.isSuccessful).toBe(true);
      expect(result.isAlreadySubscribed).toBe(true);
      expect(result.signup).toEqual(activeSubscriber);

      // Verify no new signup created
      expect(vi.mocked(NewsletterQuery.createSignupAsync)).not.toHaveBeenCalled();
      expect(vi.mocked(ResendService.sendNewsletterWelcomeAsync)).not.toHaveBeenCalled();
    });

    it('should update userId if provided and not already set', async () => {
      // Arrange
      const email = 'test@example.com';
      const normalizedEmail = 'test@example.com';
      const userId = 'user-123';
      const activeSubscriber: NewsletterSignupRecord = {
        createdAt: new Date(),
        email: normalizedEmail,
        id: 'signup-1',
        subscribedAt: new Date(),
        unsubscribedAt: null,
        userId: null,
      };

      vi.mocked(normalizeEmail).mockReturnValue(normalizedEmail);
      vi.mocked(NewsletterQuery.findByEmailAsync).mockResolvedValue(activeSubscriber);
      vi.mocked(NewsletterQuery.updateUserIdAsync).mockResolvedValue({ ...activeSubscriber, userId });

      // Act
      await NewsletterFacade.subscribeAsync(email, userId, mockDb);

      // Assert
      expect(vi.mocked(NewsletterQuery.updateUserIdAsync)).toHaveBeenCalledWith(
        normalizedEmail,
        userId,
        expect.any(Object),
      );
    });

    it('should not update userId if already set', async () => {
      // Arrange
      const email = 'test@example.com';
      const normalizedEmail = 'test@example.com';
      const userId = 'user-123';
      const activeSubscriber: NewsletterSignupRecord = {
        createdAt: new Date(),
        email: normalizedEmail,
        id: 'signup-1',
        subscribedAt: new Date(),
        unsubscribedAt: null,
        userId: 'existing-user-456',
      };

      vi.mocked(normalizeEmail).mockReturnValue(normalizedEmail);
      vi.mocked(NewsletterQuery.findByEmailAsync).mockResolvedValue(activeSubscriber);

      // Act
      await NewsletterFacade.subscribeAsync(email, userId, mockDb);

      // Assert
      expect(vi.mocked(NewsletterQuery.updateUserIdAsync)).not.toHaveBeenCalled();
    });
  });

  describe('subscribeAsync - Resubscriptions', () => {
    it('should resubscribe previously unsubscribed email', async () => {
      // Arrange
      const email = 'test@example.com';
      const normalizedEmail = 'test@example.com';
      const unsubscribedSignup: NewsletterSignupRecord = {
        createdAt: new Date(),
        email: normalizedEmail,
        id: 'signup-1',
        subscribedAt: new Date('2024-01-01'),
        unsubscribedAt: new Date('2024-06-01'),
        userId: null,
      };
      const resubscribedSignup: NewsletterSignupRecord = {
        ...unsubscribedSignup,
        subscribedAt: new Date(),
        unsubscribedAt: null,
      };

      vi.mocked(normalizeEmail).mockReturnValue(normalizedEmail);
      vi.mocked(NewsletterQuery.findByEmailAsync).mockResolvedValue(unsubscribedSignup);
      vi.mocked(NewsletterQuery.resubscribeAsync).mockResolvedValue(resubscribedSignup);

      // Act
      const result = await NewsletterFacade.subscribeAsync(email, undefined, mockDb);

      // Assert
      expect(result.isSuccessful).toBe(true);
      expect(result.isAlreadySubscribed).toBe(false);
      expect(result.signup).toEqual(resubscribedSignup);

      expect(vi.mocked(NewsletterQuery.resubscribeAsync)).toHaveBeenCalledWith(
        normalizedEmail,
        expect.any(Object),
      );
      expect(vi.mocked(CacheRevalidationService.newsletter.onSubscriptionChange)).toHaveBeenCalledWith(
        normalizedEmail,
        'subscribe',
      );
    });

    it('should update userId on resubscription if provided and different', async () => {
      // Arrange
      const email = 'test@example.com';
      const normalizedEmail = 'test@example.com';
      const userId = 'user-123';
      const unsubscribedSignup: NewsletterSignupRecord = {
        createdAt: new Date(),
        email: normalizedEmail,
        id: 'signup-1',
        subscribedAt: new Date('2024-01-01'),
        unsubscribedAt: new Date('2024-06-01'),
        userId: null,
      };
      const resubscribedSignup: NewsletterSignupRecord = {
        ...unsubscribedSignup,
        subscribedAt: new Date(),
        unsubscribedAt: null,
      };

      vi.mocked(normalizeEmail).mockReturnValue(normalizedEmail);
      vi.mocked(NewsletterQuery.findByEmailAsync).mockResolvedValue(unsubscribedSignup);
      vi.mocked(NewsletterQuery.resubscribeAsync).mockResolvedValue(resubscribedSignup);
      vi.mocked(NewsletterQuery.updateUserIdAsync).mockResolvedValue({ ...resubscribedSignup, userId });

      // Act
      await NewsletterFacade.subscribeAsync(email, userId, mockDb);

      // Assert
      expect(vi.mocked(NewsletterQuery.updateUserIdAsync)).toHaveBeenCalledWith(
        normalizedEmail,
        userId,
        expect.any(Object),
      );
    });
  });

  describe('unsubscribeAsync', () => {
    it('should unsubscribe existing email and invalidate cache', async () => {
      // Arrange
      const email = 'test@example.com';
      const normalizedEmail = 'test@example.com';
      const unsubscribedSignup: NewsletterSignupRecord = {
        createdAt: new Date(),
        email: normalizedEmail,
        id: 'signup-1',
        subscribedAt: new Date(),
        unsubscribedAt: new Date(),
        userId: null,
      };

      vi.mocked(normalizeEmail).mockReturnValue(normalizedEmail);
      vi.mocked(NewsletterQuery.unsubscribeAsync).mockResolvedValue(unsubscribedSignup);

      // Act
      const result = await NewsletterFacade.unsubscribeAsync(email, mockDb);

      // Assert
      expect(result.isSuccessful).toBe(true);
      expect(result.isAlreadySubscribed).toBe(false);
      expect(result.signup).toEqual(unsubscribedSignup);

      expect(vi.mocked(normalizeEmail)).toHaveBeenCalledWith(email);
      expect(vi.mocked(NewsletterQuery.unsubscribeAsync)).toHaveBeenCalledWith(
        normalizedEmail,
        expect.any(Object),
      );
      expect(vi.mocked(CacheRevalidationService.newsletter.onSubscriptionChange)).toHaveBeenCalledWith(
        normalizedEmail,
        'unsubscribe',
      );
    });

    it('should return success even if email does not exist (privacy-preserving)', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const normalizedEmail = 'nonexistent@example.com';

      vi.mocked(normalizeEmail).mockReturnValue(normalizedEmail);
      vi.mocked(NewsletterQuery.unsubscribeAsync).mockResolvedValue(null);

      // Act
      const result = await NewsletterFacade.unsubscribeAsync(email, mockDb);

      // Assert
      expect(result.isSuccessful).toBe(true);
      expect(result.signup).toBeNull();

      // Verify cache still invalidated (privacy)
      expect(vi.mocked(CacheRevalidationService.newsletter.onSubscriptionChange)).toHaveBeenCalledWith(
        normalizedEmail,
        'unsubscribe',
      );
    });
  });

  describe('getIsActiveSubscriberAsync', () => {
    it('should return cached result when available', async () => {
      // Arrange
      const email = 'test@example.com';
      const normalizedEmail = 'test@example.com';
      const isCachedValue = true;

      vi.mocked(normalizeEmail).mockReturnValue(normalizedEmail);
      vi.mocked(CacheService.newsletter.isActiveSubscriber).mockResolvedValue(isCachedValue);

      // Act
      const result = await NewsletterFacade.getIsActiveSubscriberByEmailAsync(email, mockDb);

      // Assert
      expect(result).toBe(isCachedValue);
      expect(vi.mocked(normalizeEmail)).toHaveBeenCalledWith(email);
      expect(vi.mocked(CacheService.newsletter.isActiveSubscriber)).toHaveBeenCalled();

      // Verify query not called (cache hit)
      expect(vi.mocked(NewsletterQuery.getIsActiveSubscriberByEmailAsync)).not.toHaveBeenCalled();
    });

    it('should query and cache result when cache miss', async () => {
      // Arrange
      const email = 'test@example.com';
      const normalizedEmail = 'test@example.com';
      const isQueryResult = false;

      vi.mocked(normalizeEmail).mockReturnValue(normalizedEmail);
      vi.mocked(CacheService.newsletter.isActiveSubscriber).mockImplementation(async (fn) => {
        return fn();
      });
      vi.mocked(NewsletterQuery.getIsActiveSubscriberByEmailAsync).mockResolvedValue(isQueryResult);

      // Act
      const result = await NewsletterFacade.getIsActiveSubscriberByEmailAsync(email, mockDb);

      // Assert
      expect(result).toBe(isQueryResult);
      expect(vi.mocked(NewsletterQuery.getIsActiveSubscriberByEmailAsync)).toHaveBeenCalledWith(
        normalizedEmail,
        expect.any(Object),
      );
    });
  });

  describe('sendWelcomeEmailAsync', () => {
    it('should not throw error if welcome email fails', async () => {
      // Arrange
      const email = 'test@example.com';
      const normalizedEmail = 'test@example.com';
      const emailError = new Error('Email service unavailable');
      const newSignup: NewsletterSignupRecord = {
        createdAt: new Date(),
        email: normalizedEmail,
        id: 'signup-1',
        subscribedAt: new Date(),
        unsubscribedAt: null,
        userId: null,
      };

      vi.mocked(normalizeEmail).mockReturnValue(normalizedEmail);
      vi.mocked(NewsletterQuery.findByEmailAsync).mockResolvedValue(null);
      vi.mocked(NewsletterQuery.createSignupAsync).mockResolvedValue(newSignup);
      vi.mocked(ResendService.sendNewsletterWelcomeAsync).mockRejectedValue(emailError);

      // Act
      const result = await NewsletterFacade.subscribeAsync(email, undefined, mockDb);

      // Assert - subscription should still succeed
      expect(result.isSuccessful).toBe(true);
      expect(result.signup).toEqual(newSignup);

      // Allow async welcome email to settle
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify warning was logged
      expect(vi.mocked(captureFacadeWarning)).toHaveBeenCalledWith(
        emailError,
        'NewsletterFacade',
        OPERATIONS.NEWSLETTER.SEND_WELCOME_EMAIL,
        expect.objectContaining({
          signupId: newSignup.id,
        }),
      );
    });
  });
});
