'use server';

import 'server-only';

import type { ActionResponse } from '@/lib/utils/action-response';

import { ACTION_NAMES, OPERATIONS, SENTRY_CONTEXTS } from '@/lib/constants';
import { LaunchNotificationFacade } from '@/lib/facades/launch-notifications/launch-notification.facade';
import { actionSuccess } from '@/lib/utils/action-response';
import { maskEmail } from '@/lib/utils/email-utils';
import { publicActionClient } from '@/lib/utils/next-safe-action';
import { withActionErrorHandling } from '@/lib/utils/sentry-server/breadcrumbs.server';
import { addToWaitlistSchema } from '@/lib/validations/launch-notification.validations';

/**
 * add email to launch notification waitlist
 * sends confirmation email and stores email in database
 * silent success for duplicates (privacy-friendly)
 */
export const addToLaunchWaitlistAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.PUBLIC.ADD_TO_LAUNCH_WAITLIST,
    isTransactionRequired: false,
  })
  .inputSchema(addToWaitlistSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<void>> => {
    const input = addToWaitlistSchema.parse(ctx.sanitizedInput);
    const maskedEmail = maskEmail(input.email);

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.PUBLIC.ADD_TO_LAUNCH_WAITLIST,
        contextData: {
          email: maskedEmail,
        },
        contextType: SENTRY_CONTEXTS.LAUNCH_NOTIFICATION_DATA,
        input: parsedInput,
        operation: OPERATIONS.LAUNCH_NOTIFICATIONS.ADD_TO_WAITLIST,
      },
      async () => {
        await LaunchNotificationFacade.addToWaitlistAsync(input, ctx.db);

        // Same message regardless of duplicate status (privacy - prevents email enumeration)
        return actionSuccess(undefined, 'Check your email for confirmation!');
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
