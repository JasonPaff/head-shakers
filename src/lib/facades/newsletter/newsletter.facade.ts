import * as Sentry from '@sentry/nextjs';

import type { NewsletterSignupRecord } from '@/lib/queries/newsletter/newsletter.queries';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { OPERATIONS, SENTRY_BREADCRUMB_CATEGORIES, SENTRY_LEVELS } from '@/lib/constants';
import { db } from '@/lib/db';
import { createPublicQueryContext } from '@/lib/queries/base/query-context';
import { NewsletterQuery } from '@/lib/queries/newsletter/newsletter.queries';
import { ResendService } from '@/lib/services/resend.service';
import { createFacadeError } from '@/lib/utils/error-builders';

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
export class NewsletterFacade {
  /**
   * Check if an email is currently subscribed to the newsletter
   * Returns true only if email exists AND is not unsubscribed
   *
   * @param email - Email address to check
   * @param dbInstance - Optional database instance for transactions
   * @returns Boolean indicating if email is actively subscribed
   */
  static async isEmailSubscribedAsync(email: string, dbInstance?: DatabaseExecutor): Promise<boolean> {
    try {
      const context = createPublicQueryContext({ dbInstance });
      return NewsletterQuery.isActiveSubscriberAsync(email, context);
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { email: email.substring(0, 3) + '***' },
        facade: facadeName,
        method: 'isEmailSubscribedAsync',
        operation: OPERATIONS.NEWSLETTER.CHECK_SUBSCRIPTION,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Subscribe an email to the newsletter
   * Handles the following cases:
   * - New subscription: Creates a new signup record
   * - Existing active subscription: Returns success with isAlreadySubscribed=true
   * - Previously unsubscribed: Resubscribes the email
   *
   * @param email - Email address to subscribe
   * @param userId - Optional Clerk user ID to associate with subscription
   * @param dbInstance - Optional database instance for transactions
   * @returns Result object with subscription status and signup record
   */
  static async subscribeAsync(
    email: string,
    userId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<NewsletterSubscriptionResult> {
    try {
      return await (dbInstance ?? db).transaction(async (tx) => {
        const context = createPublicQueryContext({ dbInstance: tx });
        const normalizedEmail = email.toLowerCase().trim();

        // Check if email already exists
        const existingSignup = await NewsletterQuery.findByEmailAsync(normalizedEmail, context);

        if (existingSignup) {
          // Check if previously unsubscribed
          if (existingSignup.unsubscribedAt !== null) {
            // Resubscribe
            const resubscribed = await NewsletterQuery.resubscribeAsync(normalizedEmail, context);

            // Update userId if provided and different
            if (userId && resubscribed && resubscribed.userId !== userId) {
              await NewsletterQuery.updateUserIdAsync(normalizedEmail, userId, context);
            }

            Sentry.addBreadcrumb({
              category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
              data: {
                hasUserId: Boolean(userId),
                signupId: resubscribed?.id,
              },
              level: SENTRY_LEVELS.INFO,
              message: 'Newsletter email resubscribed',
            });

            return {
              isAlreadySubscribed: false,
              isSuccessful: true,
              signup: resubscribed,
            };
          }

          // Already actively subscribed - return success for privacy
          // Don't expose whether email exists to prevent enumeration
          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
            data: {
              hasUserId: Boolean(userId),
              signupId: existingSignup.id,
            },
            level: SENTRY_LEVELS.INFO,
            message: 'Newsletter signup attempted for existing subscriber',
          });

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
        const newSignup = await NewsletterQuery.createSignupAsync(normalizedEmail, userId ?? null, context);

        if (!newSignup) {
          // Race condition - email was created between check and insert
          // This shouldn't happen with transaction, but handle gracefully
          const existingAfterRace = await NewsletterQuery.findByEmailAsync(normalizedEmail, context);
          return {
            isAlreadySubscribed: true,
            isSuccessful: true,
            signup: existingAfterRace,
          };
        }

        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            hasUserId: Boolean(userId),
            signupId: newSignup.id,
          },
          level: SENTRY_LEVELS.INFO,
          message: 'New newsletter subscription created',
        });

        // Send welcome email asynchronously for new subscribers
        // Wrapped in try-catch to ensure email failures don't affect subscription
        try {
          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
            data: {
              email: normalizedEmail.substring(0, 3) + '***',
              operation: OPERATIONS.NEWSLETTER.SEND_WELCOME_EMAIL,
            },
            level: SENTRY_LEVELS.INFO,
            message: 'Sending newsletter welcome email',
          });

          // Fire and forget - don't await to avoid blocking subscription
          void ResendService.sendNewsletterWelcomeAsync(normalizedEmail).catch((emailError) => {
            Sentry.captureException(emailError, {
              extra: {
                email: normalizedEmail.substring(0, 3) + '***',
                signupId: newSignup.id,
              },
              tags: {
                component: facadeName,
                operation: OPERATIONS.NEWSLETTER.SEND_WELCOME_EMAIL,
              },
            });
          });
        } catch (emailError) {
          // Log but don't throw - subscription should succeed even if email fails
          Sentry.captureException(emailError, {
            extra: {
              email: normalizedEmail.substring(0, 3) + '***',
              signupId: newSignup.id,
            },
            tags: {
              component: facadeName,
              operation: OPERATIONS.NEWSLETTER.SEND_WELCOME_EMAIL,
            },
          });
        }

        return {
          isAlreadySubscribed: false,
          isSuccessful: true,
          signup: newSignup,
        };
      });
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { hasUserId: Boolean(userId) },
        facade: facadeName,
        method: 'subscribeAsync',
        operation: OPERATIONS.NEWSLETTER.SUBSCRIBE,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Unsubscribe an email from the newsletter
   * Uses soft delete pattern - sets unsubscribedAt timestamp
   *
   * @param email - Email address to unsubscribe
   * @param dbInstance - Optional database instance for transactions
   * @returns The unsubscribed signup record, or null if email not found
   */
  static async unsubscribeAsync(
    email: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<NewsletterSignupRecord | null> {
    try {
      const context = createPublicQueryContext({ dbInstance });
      const normalizedEmail = email.toLowerCase().trim();

      // Check if email exists first
      const existingSignup = await NewsletterQuery.findByEmailAsync(normalizedEmail, context);

      if (!existingSignup) {
        // Email not found - return null but don't error
        // This prevents email enumeration attacks
        return null;
      }

      if (existingSignup.unsubscribedAt !== null) {
        // Already unsubscribed - return existing record
        return existingSignup;
      }

      const unsubscribed = await NewsletterQuery.unsubscribeAsync(normalizedEmail, context);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          signupId: unsubscribed?.id,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Newsletter email unsubscribed',
      });

      return unsubscribed;
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { email: email.substring(0, 3) + '***' },
        facade: facadeName,
        method: 'unsubscribeAsync',
        operation: OPERATIONS.NEWSLETTER.UNSUBSCRIBE,
      };
      throw createFacadeError(errorContext, error);
    }
  }
}
