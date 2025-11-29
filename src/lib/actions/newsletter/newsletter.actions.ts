'use server';

import 'server-only';

import { ACTION_NAMES, OPERATIONS } from '@/lib/constants';
import { NewsletterFacade } from '@/lib/facades/newsletter/newsletter.facade';
import { publicActionClient } from '@/lib/utils/next-safe-action';
import { maskEmail } from '@/lib/utils/privacy-utils';
import { actionBreadcrumb } from '@/lib/utils/sentry-server/breadcrumbs.server';
import { withActionErrorHandling } from '@/lib/utils/sentry-server/breadcrumbs.server';
import { insertNewsletterSignupSchema } from '@/lib/validations/newsletter.validation';
import { getUserIdAsync } from '@/utils/auth-utils';

export const subscribeToNewsletterAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.NEWSLETTER.SUBSCRIBE,
    isTransactionRequired: true,
  })
  .inputSchema(insertNewsletterSignupSchema)
  .action(async ({ ctx, parsedInput }) => {
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

          return {
            data: null,
            message: result.error || 'Unable to process your subscription. Please try again.',
            success: false,
          };
        }

        // Same message for both new and existing subscribers (privacy - prevents email enumeration)
        return {
          data: { isAlreadySubscribed: result.isAlreadySubscribed, signupId: result.signup?.id },
          message: "Thanks for subscribing! You'll receive our latest updates.",
          success: true,
        };
      },
      {
        includeResultSummary: (result) =>
          result.success ?
            {
              email: maskedEmail,
              isAlreadySubscribed: result.data?.isAlreadySubscribed,
              signupId: result.data?.signupId,
            }
          : {},
      },
    );
  });
