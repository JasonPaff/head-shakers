'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';

import type { ActionResponse } from '@/lib/utils/action-response';

import {
  ACTION_NAMES,
  OPERATIONS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { LaunchNotificationFacade } from '@/lib/facades/launch-notifications/launch-notification.facade';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { actionSuccess } from '@/lib/utils/action-response';
import { publicActionClient } from '@/lib/utils/next-safe-action';
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
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<null>> => {
    const input = addToWaitlistSchema.parse(ctx.sanitizedInput);

    Sentry.setContext(SENTRY_CONTEXTS.INPUT_INFO, {
      email: input.email,
    });

    try {
      await LaunchNotificationFacade.addToWaitlistAsync(input, ctx.db);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          email: input.email,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Email added to launch waitlist',
      });

      return actionSuccess(null, 'Check your email for confirmation!');
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.PUBLIC.ADD_TO_LAUNCH_WAITLIST },
        operation: OPERATIONS.FEATURED_CONTENT.CREATE,
      });
    }
  });
