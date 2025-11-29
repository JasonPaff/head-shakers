import * as Sentry from '@sentry/nextjs';

import type { NewsletterSignupRecord } from '@/lib/queries/newsletter/newsletter.queries';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { OPERATIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { NewsletterQuery } from '@/lib/queries/newsletter/newsletter.queries';
import { ResendService } from '@/lib/services/resend.service';
import { normalizeEmail } from '@/lib/utils/email-utils';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';
import { trackFacadeWarning } from '@/lib/utils/sentry-server/breadcrumbs.server';

const facadeName = 'NewsletterFacade';

/**
 * Result type for newsletter subscription operations
 */
export interface NewsletterSubscriptionResult {
  /** Error message if operation failed */
  error?: string;
  /** Whether the email was already subscribed */
  isAlreadySubscribed: boolean;
  /** Whether the operation was successful */
  isSuccessful: boolean;
  /** The signup record (null if operation failed) */
  signup: NewsletterSignupRecord | null;
}

/**
 * NewsletterFacade handles business logic for newsletter operations
 * Provides methods for subscribing, unsubscribing, and checking subscription status
 */
export class NewsletterFacade extends BaseFacade {
  /**
   * Subscribe an email to the newsletter
   *
   * Handles the following cases:
   * - New subscription: Creates a new signup record
   * - Existing active subscription: Returns success with isAlreadySubscribed=true (privacy-preserving)
   * - Previously unsubscribed: Resubscribes the email
   *
   * Sends welcome email asynchronously (non-blocking) for new subscribers.
   *
   * @param email - Email address to subscribe
   * @param userId - Optional Clerk user ID to associate with subscription
   * @param dbInstance - Database instance for transactions (defaults to db)
   * @returns Result object with subscription status and signup record
   */
  static async subscribeAsync(
    email: string,
    userId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<NewsletterSubscriptionResult> {
    return executeFacadeOperation(
      {
        data: { hasUserId: Boolean(userId) },
        facade: facadeName,
        method: 'subscribeAsync',
        operation: OPERATIONS.NEWSLETTER.SUBSCRIBE,
        userId,
      },
      async () => {
        const normalizedEmail = normalizeEmail(email);

        return await dbInstance.transaction(async (tx) => {
          const context = this.publicContext(tx);

          const existingSignup = await NewsletterQuery.findByEmailAsync(normalizedEmail, context);

          if (existingSignup) {
            if (existingSignup.unsubscribedAt !== null) {
              const resubscribed = await NewsletterQuery.resubscribeAsync(normalizedEmail, context);

              // Update userId if provided and different
              if (userId && resubscribed && resubscribed.userId !== userId) {
                await NewsletterQuery.updateUserIdAsync(normalizedEmail, userId, context);
              }

              return {
                isAlreadySubscribed: false,
                isSuccessful: true,
                signup: resubscribed,
              };
            }

            // Already actively subscribed - return success for privacy
            // Don't expose it whether email exists to prevent enumeration
            // Update userId if provided and not already set
            if (userId && !existingSignup.userId) {
              await NewsletterQuery.updateUserIdAsync(normalizedEmail, userId, context);
            }

            return {
              isAlreadySubscribed: true,
              isSuccessful: true,
              signup: existingSignup,
            };
          }

          // New subscription
          const newSignup = await NewsletterQuery.createSignupAsync(normalizedEmail, userId, context);

          if (!newSignup) {
            const existingAfterRace = await NewsletterQuery.findByEmailAsync(normalizedEmail, context);
            return {
              isAlreadySubscribed: true,
              isSuccessful: true,
              signup: existingAfterRace,
            };
          }

          // Send welcome email asynchronously - non-blocking
          void this.sendWelcomeEmailAsync(normalizedEmail, newSignup.id);

          return {
            isAlreadySubscribed: false,
            isSuccessful: true,
            signup: newSignup,
          };
        });
      },
      {
        includeResultSummary: (result) => ({
          isAlreadySubscribed: result.isAlreadySubscribed,
          isSuccessful: result.isSuccessful,
          signupId: result.signup?.id,
        }),
      },
    );
  }

  /**
   * Send welcome email asynchronously (non-blocking)
   * Failures are logged as warnings and don't fail the subscription
   *
   * @param email - Email address to send to (already normalized)
   * @param signupId - Newsletter signup ID for error tracking
   */
  private static async sendWelcomeEmailAsync(email: string, signupId: string): Promise<void> {
    try {
      await ResendService.sendNewsletterWelcomeAsync(email);
    } catch (emailError) {
      trackFacadeWarning(facadeName, 'sendWelcomeEmailAsync', 'Failed to send newsletter welcome email', {
        email: email.substring(0, 3) + '***',
        signupId,
      });

      Sentry.captureException(emailError, {
        extra: {
          email: email.substring(0, 3) + '***',
          signupId,
        },
        level: 'warning',
        tags: {
          component: facadeName,
          operation: OPERATIONS.NEWSLETTER.SEND_WELCOME_EMAIL,
        },
      });
    }
  }
}
