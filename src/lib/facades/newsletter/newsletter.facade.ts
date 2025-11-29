import type { NewsletterSignupRecord } from '@/lib/queries/newsletter/newsletter.queries';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { CACHE_ENTITY_TYPE, OPERATIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { NewsletterQuery } from '@/lib/queries/newsletter/newsletter.queries';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { CacheService } from '@/lib/services/cache.service';
import { ResendService } from '@/lib/services/resend.service';
import { maskEmail, normalizeEmail } from '@/lib/utils/email-utils';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';
import { captureFacadeWarning, facadeBreadcrumb } from '@/lib/utils/sentry-server/breadcrumbs.server';

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
   * Check if an email is actively subscribed to the newsletter
   *
   * Cache behavior: Cached for 5 minutes (SHORT TTL) to balance performance with freshness.
   * Cache is invalidated on subscribe/unsubscribe operations.
   *
   * @param email - Email address to check
   * @param dbInstance - Database instance for transactions (defaults to db)
   * @returns True if the email is actively subscribed, false otherwise
   */
  static async getIsActiveSubscriberAsync(
    email: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<boolean> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'isActiveSubscriberAsync',
        operation: OPERATIONS.NEWSLETTER.CHECK_SUBSCRIPTION,
      },
      async () => {
        const normalizedEmail = normalizeEmail(email);

        return CacheService.newsletter.isActiveSubscriber(
          async () => {
            const context = this.publicContext(dbInstance);
            return NewsletterQuery.getIsActiveSubscriberAsync(normalizedEmail, context);
          },
          normalizedEmail,
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.NEWSLETTER,
              facade: facadeName,
              operation: OPERATIONS.NEWSLETTER.CHECK_SUBSCRIPTION,
            },
          },
        );
      },
    );
  }

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
   * Cache behavior: Invalidates the subscription status cache for the email after successful subscription.
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
        const context = this.publicContext(dbInstance);

        const existingSignup = await NewsletterQuery.findByEmailAsync(normalizedEmail, context);

        if (existingSignup) {
          if (existingSignup.unsubscribedAt !== null) {
            const resubscribed = await NewsletterQuery.resubscribeAsync(normalizedEmail, context);

            // Update userId if provided and different
            if (userId && resubscribed && resubscribed.userId !== userId) {
              await NewsletterQuery.updateUserIdAsync(normalizedEmail, userId, context);
            }

            // Invalidate cache after resubscription
            CacheRevalidationService.newsletter.onSubscriptionChange(normalizedEmail, 'subscribe');

            return {
              isAlreadySubscribed: false,
              isSuccessful: true,
              signup: resubscribed,
            };
          }

          // Already actively subscribed - return success for privacy
          // Do not expose the email exists to prevent enumeration
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

        // Invalidate cache after new subscription
        CacheRevalidationService.newsletter.onSubscriptionChange(normalizedEmail, 'subscribe');

        // Send welcome email asynchronously - non-blocking
        void this.sendWelcomeEmailAsync(normalizedEmail, newSignup.id);

        return {
          isAlreadySubscribed: false,
          isSuccessful: true,
          signup: newSignup,
        };
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
   * Unsubscribe an email from the newsletter
   *
   * Privacy-preserving behavior: Always returns success, even if the email doesn't exist.
   * This prevents email enumeration attacks where attackers could determine which emails
   * are in the system by checking unsubscribe responses.
   *
   * Cache behavior: Invalidates the subscription status cache for the email after unsubscription attempt.
   * Cache is invalidated even if email doesn't exist (privacy-preserving).
   *
   * @param email - Email address to unsubscribe
   * @param dbInstance - Database instance for transactions (defaults to db)
   * @returns Result object indicating success (always successful for privacy)
   */
  static async unsubscribeAsync(
    email: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<NewsletterSubscriptionResult> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'unsubscribeAsync',
        operation: OPERATIONS.NEWSLETTER.UNSUBSCRIBE,
      },
      async () => {
        const normalizedEmail = normalizeEmail(email);
        const context = this.publicContext(dbInstance);

        // Attempt to unsubscribe the email
        const result = await NewsletterQuery.unsubscribeAsync(normalizedEmail, context);

        // Invalidate cache after unsubscription (even if email doesn't exist for privacy)
        CacheRevalidationService.newsletter.onSubscriptionChange(normalizedEmail, 'unsubscribe');

        // Privacy-preserving: Return success even if email doesn't exist
        // This prevents attackers from using the unsubscribe endpoint to enumerate emails
        return {
          isAlreadySubscribed: false,
          isSuccessful: true,
          signup: result,
        };
      },
      {
        includeResultSummary: (result) => ({
          isSuccessful: result.isSuccessful,
          wasFound: result.signup !== null,
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
      facadeBreadcrumb('Newsletter welcome email sent successfully', { email, signupId });
    } catch (emailError) {
      captureFacadeWarning(emailError, facadeName, OPERATIONS.NEWSLETTER.SEND_WELCOME_EMAIL, {
        email: maskEmail(email),
        signupId,
      });
    }
  }
}
