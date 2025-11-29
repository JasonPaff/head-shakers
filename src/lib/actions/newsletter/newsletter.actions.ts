'use server';

import 'server-only';

import type { ActionResponse } from '@/lib/utils/action-response';

import { ACTION_NAMES, OPERATIONS } from '@/lib/constants';
import { NewsletterFacade } from '@/lib/facades/newsletter/newsletter.facade';
import { actionSuccess } from '@/lib/utils/action-response';
import { actionFailure } from '@/lib/utils/action-response';
import { maskEmail } from '@/lib/utils/email-utils';
import { publicActionClient } from '@/lib/utils/next-safe-action';
import { actionBreadcrumb } from '@/lib/utils/sentry-server/breadcrumbs.server';
import { withActionErrorHandling } from '@/lib/utils/sentry-server/breadcrumbs.server';
import { insertNewsletterSignupSchema } from '@/lib/validations/newsletter.validation';
import { getUserIdAsync } from '@/utils/auth-utils';

type SubscribeToNewsLetterResponse = { isAlreadySubscribed: boolean; signupId: string | undefined };

export const subscribeToNewsletterAction = publicActionClient
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
        contextType: 'NEWSLETTER_DATA',
        input: parsedInput,
        operation: OPERATIONS.NEWSLETTER.SUBSCRIBE,
        userId: userId ?? undefined,
      },
      async () => {
        const result = await NewsletterFacade.subscribeAsync(input.email, userId ?? undefined, ctx.db);

        if (result.isSuccessful) {
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
