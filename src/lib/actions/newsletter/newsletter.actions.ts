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
import { maskEmail } from '@/lib/utils/privacy-utils';
import { insertNewsletterSignupSchema } from '@/lib/validations/newsletter.validation';
import { getUserIdAsync } from '@/utils/auth-utils';

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
  .inputSchema(insertNewsletterSignupSchema)
  .action(async ({ ctx }) => {
    const input = insertNewsletterSignupSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    const maskedEmail = maskEmail(input.email);
    const userId = await getUserIdAsync();

    Sentry.setContext(SENTRY_CONTEXTS.NEWSLETTER_DATA, {
      email: maskedEmail,
      hasUserId: Boolean(userId),
      operation: OPERATIONS.NEWSLETTER.SUBSCRIBE,
      userId,
    });

    try {
      const result = await NewsletterFacade.subscribeAsync(input.email, userId ?? undefined, dbInstance);

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

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          email: maskedEmail,
          isAlreadySubscribed: result.isAlreadySubscribed,
          signupId: result.signup?.id,
        },
        level: SENTRY_LEVELS.INFO,
        message:
          result.isAlreadySubscribed ?
            'Newsletter signup (existing subscriber)'
          : 'Newsletter signup successful',
      });

      // Same message for both new and existing subscribers (privacy - prevents email enumeration)
      return {
        data: { signupId: result.signup?.id },
        message: "Thanks for subscribing! You'll receive our latest updates.",
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: { email: maskedEmail },
        metadata: { actionName: ACTION_NAMES.NEWSLETTER.SUBSCRIBE },
        operation: OPERATIONS.NEWSLETTER.SUBSCRIBE,
      });
    }
  });
