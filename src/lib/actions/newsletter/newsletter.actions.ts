'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';

import {
  ACTION_NAMES,
  OPERATIONS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { NewsletterFacade } from '@/lib/facades/newsletter/newsletter.facade';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { publicActionClient } from '@/lib/utils/next-safe-action';
import { newsletterSignupSchema } from '@/lib/validations/newsletter.validation';

/**
 * Helper function to mask email for privacy in Sentry context
 * Shows first 3 characters and domain only (e.g., "joh***@example.com")
 */
function maskEmail(email: string): string {
  const parts = email.split('@');
  const localPart = parts[0] ?? '';
  const domain = parts[1] ?? '';
  const visibleChars = Math.min(3, localPart.length);
  return localPart.substring(0, visibleChars) + '***@' + domain;
}

/**
 * Newsletter signup action (public - no auth required)
 *
 * Features:
 * - Stores email in newsletter_signups table via NewsletterFacade
 * - Handles duplicate emails gracefully (returns success for privacy)
 * - Supports resubscription for previously unsubscribed emails
 * - Does NOT send confirmation email (future enhancement)
 *
 * Privacy considerations:
 * - Returns same success message for new and existing subscribers
 * - Prevents email enumeration attacks
 * - Masks email in Sentry context
 *
 * Sentry integration:
 * - Sets NEWSLETTER_DATA context at action start
 * - Adds breadcrumbs for successful subscriptions
 * - Captures warnings for failed subscriptions (non-blocking)
 * - Performance monitoring handled by sentryMiddleware via startSpan
 */
export const subscribeToNewsletterAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.NEWSLETTER.SUBSCRIBE,
    isTransactionRequired: true,
  })
  .inputSchema(newsletterSignupSchema)
  .action(async ({ ctx }) => {
    const input = newsletterSignupSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    // Mask email for privacy in all Sentry operations
    const maskedEmail = maskEmail(input.email);

    // 1. Set Sentry context at start of action (following server-actions convention)
    Sentry.setContext(SENTRY_CONTEXTS.NEWSLETTER_DATA, {
      email: maskedEmail,
      operation: OPERATIONS.NEWSLETTER.SUBSCRIBE,
    });

    try {
      // 2. Delegate to facade for business logic
      // userId is undefined for public action (no auth context)
      const result = await NewsletterFacade.subscribeAsync(input.email, undefined, dbInstance);

      // 3. Handle unsuccessful results with warning breadcrumb
      if (!result.isSuccessful) {
        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            email: maskedEmail,
            error: result.error,
            operation: OPERATIONS.NEWSLETTER.SUBSCRIBE,
          },
          level: SENTRY_LEVELS.WARNING,
          message: 'Newsletter signup failed',
        });

        return {
          data: null,
          message: result.error || 'Unable to process your subscription. Please try again.',
          success: false,
        };
      }

      // 4. Add Sentry breadcrumb for successful operation
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          email: maskedEmail,
          isAlreadySubscribed: result.isAlreadySubscribed,
          signupId: result.signup?.id,
        },
        level: SENTRY_LEVELS.INFO,
        message: result.isAlreadySubscribed ? 'Newsletter signup (existing subscriber)' : 'Newsletter signup successful',
      });

      // 5. Return consistent response shape
      // Same message for both new and existing subscribers (privacy - prevents email enumeration)
      return {
        data: { signupId: result.signup?.id },
        message: 'Thanks for subscribing! You\'ll receive our latest updates.',
        success: true,
      };
    } catch (error) {
      // 6. Handle errors with utility
      return handleActionError(error, {
        input: { email: maskedEmail },
        metadata: { actionName: ACTION_NAMES.NEWSLETTER.SUBSCRIBE },
        operation: OPERATIONS.NEWSLETTER.SUBSCRIBE,
      });
    }
  });
