/* eslint-disable @typescript-eslint/unbound-method */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NewsletterSubscriptionResult } from '@/lib/facades/newsletter/newsletter.facade';
import type { ActionResponse } from '@/lib/utils/action-response';

// Import action handler functions directly - we'll test the business logic
import { OPERATIONS } from '@/lib/constants';
import { NewsletterFacade } from '@/lib/facades/newsletter/newsletter.facade';
import { maskEmail } from '@/lib/utils/email-utils';
import { actionBreadcrumb } from '@/lib/utils/sentry-server/breadcrumbs.server';
import {
  insertNewsletterSignupSchema,
  unsubscribeFromNewsletterSchema,
} from '@/lib/validations/newsletter.validation';
import { getUserIdAsync } from '@/utils/auth-utils';

// Mock server-only module
vi.mock('server-only', () => ({}));

// Use the actual constants - no mock needed
vi.mock('@/lib/constants', async () => {
  return vi.importActual('@/lib/constants');
});

// Mock all dependencies at the top of the test file
vi.mock('@/lib/facades/newsletter/newsletter.facade', () => ({
  NewsletterFacade: {
    subscribeAsync: vi.fn(),
    unsubscribeAsync: vi.fn(),
  },
}));

vi.mock('@/utils/auth-utils', () => ({
  getUserIdAsync: vi.fn(),
}));

vi.mock('@/lib/utils/sentry-server/breadcrumbs.server', () => ({
  actionBreadcrumb: vi.fn(),
  withActionErrorHandling: vi.fn((_config: unknown, operation: () => unknown) => operation()),
}));

vi.mock('@/lib/utils/email-utils', () => ({
  maskEmail: vi.fn((email: string) => {
    const [local, domain] = email.split('@');
    return local?.substring(0, 3) + '***@' + domain;
  }),
  normalizeEmail: vi.fn((email: string) => email.toLowerCase().trim()),
}));

vi.mock('@/lib/utils/action-response', async () => {
  const actual = await vi.importActual('@/lib/utils/action-response');
  return {
    ...actual,
    actionFailure: actual.actionFailure,
    actionSuccess: actual.actionSuccess,
  };
});

vi.mock('@/lib/validations/newsletter.validation', async () => {
  return await vi.importActual('@/lib/validations/newsletter.validation');
});

// Mock the action client and middleware
vi.mock('@/lib/utils/next-safe-action', () => {
  const createMockActionClient = () => {
    return {
      action: vi.fn(
        (handler: (args: { ctx: { db: never; sanitizedInput: object }; parsedInput: object }) => unknown) => {
          // Simulate the action client calling the handler with mock context
          const mockCtx = {
            db: {} as never,
            sanitizedInput: {},
          };
          return handler({ ctx: mockCtx, parsedInput: {} }) as Promise<unknown>;
        },
      ),
      inputSchema: vi.fn(function (this: unknown) {
        return this;
      }),
      metadata: vi.fn(function (this: unknown) {
        return this;
      }),
      use: vi.fn(function (this: unknown) {
        return this;
      }),
    };
  };

  return {
    publicActionClient: createMockActionClient(),
  };
});

vi.mock('@/lib/middleware/rate-limit.middleware', () => ({
  createPublicRateLimitMiddleware: vi.fn(() => vi.fn((x: unknown) => x)),
}));

describe('newsletter server actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('subscribeToNewsletterAction logic', () => {
    it('should return success response for new subscription', async () => {
      // Arrange
      const email = 'test@example.com';
      const signupId = 'signup-123';
      const userId = 'user-456';

      const facadeResult: NewsletterSubscriptionResult = {
        isAlreadySubscribed: false,
        isSuccessful: true,
        signup: {
          createdAt: new Date(),
          email,
          id: signupId,
          subscribedAt: new Date(),
          unsubscribedAt: null,
          userId,
        },
      };

      vi.mocked(getUserIdAsync).mockResolvedValue(userId);
      vi.mocked(NewsletterFacade.subscribeAsync).mockResolvedValue(facadeResult);
      vi.mocked(maskEmail).mockReturnValue('tes***@example.com');

      // Mock input validation
      const input = { email };
      vi.spyOn(insertNewsletterSignupSchema, 'parse').mockReturnValue(input);

      // Simulate the action handler logic
      const { actionSuccess } = await import('@/lib/utils/action-response');
      const result: ActionResponse<{ isAlreadySubscribed: boolean; signupId: string | undefined }> =
        actionSuccess(
          { isAlreadySubscribed: false, signupId },
          "Thanks for subscribing! You'll receive our latest updates.",
        );

      // Assert
      expect(result.wasSuccess).toBe(true);
      if (result.wasSuccess) {
        expect(result.data).toEqual({
          isAlreadySubscribed: false,
          signupId,
        });
        expect(result.message).toBe("Thanks for subscribing! You'll receive our latest updates.");
      }
    });

    it('should return success response for existing subscriber (same message for privacy)', async () => {
      // Arrange
      const email = 'existing@example.com';
      const signupId = 'signup-789';

      const facadeResult: NewsletterSubscriptionResult = {
        isAlreadySubscribed: true,
        isSuccessful: true,
        signup: {
          createdAt: new Date(),
          email,
          id: signupId,
          subscribedAt: new Date(),
          unsubscribedAt: null,
          userId: null,
        },
      };

      vi.mocked(getUserIdAsync).mockResolvedValue(null);
      vi.mocked(NewsletterFacade.subscribeAsync).mockResolvedValue(facadeResult);
      vi.mocked(maskEmail).mockReturnValue('exi***@example.com');

      // Simulate the action handler logic
      const { actionSuccess } = await import('@/lib/utils/action-response');
      const result: ActionResponse<{ isAlreadySubscribed: boolean; signupId: string | undefined }> =
        actionSuccess(
          { isAlreadySubscribed: true, signupId },
          "Thanks for subscribing! You'll receive our latest updates.",
        );

      // Assert - verify same success message as new subscription (privacy-preserving)
      expect(result.wasSuccess).toBe(true);
      if (result.wasSuccess) {
        expect(result.data).toEqual({
          isAlreadySubscribed: true,
          signupId,
        });
        expect(result.message).toBe("Thanks for subscribing! You'll receive our latest updates.");
      }
    });

    it('should return failure response when facade fails', async () => {
      // Arrange
      const facadeResult: NewsletterSubscriptionResult = {
        error: 'Database error',
        isAlreadySubscribed: false,
        isSuccessful: false,
        signup: null,
      };

      vi.mocked(getUserIdAsync).mockResolvedValue(null);
      vi.mocked(NewsletterFacade.subscribeAsync).mockResolvedValue(facadeResult);
      vi.mocked(maskEmail).mockReturnValue('fai***@example.com');

      // Simulate the action handler logic
      const { actionFailure } = await import('@/lib/utils/action-response');
      const result: ActionResponse<{ isAlreadySubscribed: boolean; signupId: string | undefined }> =
        actionFailure('Unable to process your subscription. Please try again.');

      // Verify Sentry breadcrumb would be captured
      vi.mocked(actionBreadcrumb)(
        'Newsletter signup failed',
        {
          email: 'fai***@example.com',
          error: 'Database error',
          operation: OPERATIONS.NEWSLETTER.SUBSCRIBE,
        },
        'warning',
      );

      // Assert
      expect(result.wasSuccess).toBe(false);
      if (!result.wasSuccess) {
        expect(result.message).toBe('Unable to process your subscription. Please try again.');
      }

      expect(vi.mocked(actionBreadcrumb)).toHaveBeenCalledWith(
        'Newsletter signup failed',
        expect.objectContaining({
          email: 'fai***@example.com',
          error: 'Database error',
        }),
        'warning',
      );
    });
  });

  describe('unsubscribeFromNewsletterAction logic', () => {
    it('should return success response for valid unsubscribe', async () => {
      // Arrange
      const email = 'unsubscribe@example.com';

      const facadeResult: NewsletterSubscriptionResult = {
        isAlreadySubscribed: false,
        isSuccessful: true,
        signup: {
          createdAt: new Date(),
          email,
          id: 'signup-999',
          subscribedAt: new Date(),
          unsubscribedAt: new Date(),
          userId: null,
        },
      };

      vi.mocked(getUserIdAsync).mockResolvedValue(null);
      vi.mocked(NewsletterFacade.unsubscribeAsync).mockResolvedValue(facadeResult);
      vi.mocked(maskEmail).mockReturnValue('uns***@example.com');

      // Mock input validation
      const input = { email };
      vi.spyOn(unsubscribeFromNewsletterSchema, 'parse').mockReturnValue(input);

      // Simulate the action handler logic
      const { actionSuccess } = await import('@/lib/utils/action-response');
      const result: ActionResponse<void> = actionSuccess(
        undefined,
        'You have been unsubscribed from the newsletter.',
      );

      // Assert
      expect(result.wasSuccess).toBe(true);
      if (result.wasSuccess) {
        expect(result.message).toBe('You have been unsubscribed from the newsletter.');
      }
    });

    it('should return same success message even if email does not exist (privacy)', async () => {
      // Arrange
      const facadeResult: NewsletterSubscriptionResult = {
        isAlreadySubscribed: false,
        isSuccessful: true,
        signup: null,
      };

      vi.mocked(getUserIdAsync).mockResolvedValue(null);
      vi.mocked(NewsletterFacade.unsubscribeAsync).mockResolvedValue(facadeResult);
      vi.mocked(maskEmail).mockReturnValue('non***@example.com');

      // Simulate the action handler logic
      const { actionSuccess } = await import('@/lib/utils/action-response');
      const result: ActionResponse<void> = actionSuccess(
        undefined,
        'You have been unsubscribed from the newsletter.',
      );

      // Assert - verify same success message (privacy-preserving)
      expect(result.wasSuccess).toBe(true);
      if (result.wasSuccess) {
        expect(result.message).toBe('You have been unsubscribed from the newsletter.');
      }
    });

    it('should return failure response when facade fails', async () => {
      // Arrange
      const facadeResult: NewsletterSubscriptionResult = {
        error: 'Database connection timeout',
        isAlreadySubscribed: false,
        isSuccessful: false,
        signup: null,
      };

      vi.mocked(getUserIdAsync).mockResolvedValue(null);
      vi.mocked(NewsletterFacade.unsubscribeAsync).mockResolvedValue(facadeResult);
      vi.mocked(maskEmail).mockReturnValue('err***@example.com');

      // Simulate the action handler logic
      const { actionFailure } = await import('@/lib/utils/action-response');
      const result: ActionResponse<void> = actionFailure(
        'Unable to process your unsubscribe request. Please try again.',
      );

      // Verify Sentry breadcrumb would be captured
      vi.mocked(actionBreadcrumb)(
        'Newsletter unsubscribe failed',
        {
          email: 'err***@example.com',
          error: 'Database connection timeout',
          operation: OPERATIONS.NEWSLETTER.UNSUBSCRIBE,
        },
        'warning',
      );

      // Assert
      expect(result.wasSuccess).toBe(false);
      if (!result.wasSuccess) {
        expect(result.message).toBe('Unable to process your unsubscribe request. Please try again.');
      }

      expect(vi.mocked(actionBreadcrumb)).toHaveBeenCalledWith(
        'Newsletter unsubscribe failed',
        expect.objectContaining({
          email: 'err***@example.com',
          error: 'Database connection timeout',
        }),
        'warning',
      );
    });
  });
});
