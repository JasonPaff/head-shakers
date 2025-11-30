'use server';

import 'server-only';

import type { ActionResponse } from '@/lib/utils/action-response';

import { ACTION_NAMES, CONFIG, OPERATIONS, SENTRY_CONTEXTS } from '@/lib/constants';
import { NewsletterFacade } from '@/lib/facades/newsletter/newsletter.facade';
import { createPublicRateLimitMiddleware } from '@/lib/middleware/rate-limit.middleware';
import { actionSuccess } from '@/lib/utils/action-response';
import { actionFailure } from '@/lib/utils/action-response';
import { maskEmail } from '@/lib/utils/email-utils';
import { publicActionClient } from '@/lib/utils/next-safe-action';
import { actionBreadcrumb } from '@/lib/utils/sentry-server/breadcrumbs.server';
import { withActionErrorHandling } from '@/lib/utils/sentry-server/breadcrumbs.server';
import { insertNewsletterSignupSchema } from '@/lib/validations/newsletter.validation';
import { unsubscribeFromNewsletterSchema } from '@/lib/validations/newsletter.validation';
import { getUserIdAsync } from '@/utils/auth-utils';

type SubscribeToNewsLetterResponse = { isAlreadySubscribed: boolean; signupId: string | undefined };

const rateLimitedPublicClient = publicActionClient.use(
  createPublicRateLimitMiddleware(
    CONFIG.RATE_LIMITING.ACTION_SPECIFIC.NEWSLETTER_SUBSCRIBE.REQUESTS,
    CONFIG.RATE_LIMITING.ACTION_SPECIFIC.NEWSLETTER_SUBSCRIBE.WINDOW,
    ACTION_NAMES.NEWSLETTER.SUBSCRIBE,
  ),
);

export const subscribeToNewsletterAction = rateLimitedPublicClient
  .metadata({
    actionName: ACTION_NAMES.NEWSLETTER.SUBSCRIBE,
    isTransactionRequired: true,
  })
  .inputSchema(insertNewsletterSignupSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<SubscribeToNewsLetterResponse>> => {
    const input = insertNewsletterSignupSchema.parse(ctx.sanitizedInput);
    const userId = await getUserIdAsync();
    const maskedEmail = maskEmail(input.email);

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.NEWSLETTER.SUBSCRIBE,
        contextData: {
          email: maskedEmail,
          hasUserId: Boolean(userId),
        },
        contextType: SENTRY_CONTEXTS.NEWSLETTER_DATA,
        input: parsedInput,
        operation: OPERATIONS.NEWSLETTER.SUBSCRIBE,
        userId: userId ?? undefined,
      },
      async () => {
        const result = await NewsletterFacade.subscribeAsync(input.email, userId ?? undefined, ctx.db);

        if (!result.isSuccessful) {
          actionBreadcrumb(
            'Newsletter signup failed',
            {
              email: maskedEmail,
              error: result.error,
              operation: OPERATIONS.NEWSLETTER.SUBSCRIBE,
            },
            'warning',
          );

          return actionFailure('Unable to process your subscription. Please try again.');
        }

        // Same message for both new and existing subscribers (privacy - prevents email enumeration)
        return actionSuccess(
          { isAlreadySubscribed: result.isAlreadySubscribed, signupId: result.signup?.id },
          "Thanks for subscribing! You'll receive our latest updates.",
        );
      },
      {
        includeResultSummary: (result) =>
          result.wasSuccess ?
            {
              email: maskedEmail,
              isAlreadySubscribed: result.data?.isAlreadySubscribed,
              signupId: result.data?.signupId,
            }
          : {},
      },
    );
  });

export const unsubscribeFromNewsletterAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.NEWSLETTER.UNSUBSCRIBE,
    isTransactionRequired: true,
  })
  .inputSchema(unsubscribeFromNewsletterSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<void>> => {
    const input = unsubscribeFromNewsletterSchema.parse(ctx.sanitizedInput);
    const userId = await getUserIdAsync();
    const maskedEmail = maskEmail(input.email);

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.NEWSLETTER.UNSUBSCRIBE,
        contextData: {
          email: maskedEmail,
          hasUserId: Boolean(userId),
        },
        contextType: SENTRY_CONTEXTS.NEWSLETTER_DATA,
        input: parsedInput,
        operation: OPERATIONS.NEWSLETTER.UNSUBSCRIBE,
        userId: userId ?? undefined,
      },
      async () => {
        const result = await NewsletterFacade.unsubscribeAsync(input.email, ctx.db);

        if (!result.isSuccessful) {
          actionBreadcrumb(
            'Newsletter unsubscribe failed',
            {
              email: maskedEmail,
              error: result.error,
              operation: OPERATIONS.NEWSLETTER.UNSUBSCRIBE,
            },
            'warning',
          );

          return actionFailure('Unable to process your unsubscribe request. Please try again.');
        }

        // Same message regardless of subscription status (privacy - prevents email enumeration)
        return actionSuccess(undefined, 'You have been unsubscribed from the newsletter.');
      },
      {
        includeResultSummary: (result) =>
          result.wasSuccess ?
            {
              email: maskedEmail,
            }
          : {},
      },
    );
  });
