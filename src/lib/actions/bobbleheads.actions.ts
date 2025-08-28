'use server';

import * as Sentry from '@sentry/nextjs';
import { $path } from 'next-typesafe-url';
import { revalidatePath } from 'next/cache';

import {
  ACTION_NAMES,
  ERROR_MESSAGES,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { BobbleheadService } from '@/lib/services/bobbleheads.service';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient } from '@/lib/utils/next-safe-action';
import { insertBobbleheadSchema } from '@/lib/validations/bobbleheads.validation';

export const createBobbleheadAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.CREATE,
    isTransactionRequired: true,
  })
  .inputSchema(insertBobbleheadSchema)
  .action(async ({ ctx, parsedInput }) => {
    const sanitizedData = ctx.sanitizedInput as typeof parsedInput;
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.BOBBLEHEAD_DATA, sanitizedData);

    try {
      // create bobblehead
      const newBobblehead = await BobbleheadService.createWithPhotosAsync(
        {
          ...sanitizedData,
          userId,
        },
        [],
        ctx.db,
      );

      if (!newBobblehead) {
        throw new ActionError(
          ErrorType.INTERNAL,
          'BOBBLEHEAD_CREATE_FAILED',
          ERROR_MESSAGES.BOBBLEHEAD.CREATE_FAILED,
          { operation: 'create_bobblehead', userId },
          false,
          500,
        );
      }

      // add business logic breadcrumb
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: newBobblehead,
        level: SENTRY_LEVELS.INFO,
        message: `Created bobblehead: ${newBobblehead.name}`,
      });

      // revalidate cache
      revalidatePath(
        $path({
          route: '/collections/[collectionId]',
          routeParams: {
            collectionId: parsedInput.collectionId,
          },
        }),
      );

      return {
        data: newBobblehead,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.BOBBLEHEADS.CREATE,
        },
        operation: 'create_bobblehead',
        userId,
      });
    }
  });
