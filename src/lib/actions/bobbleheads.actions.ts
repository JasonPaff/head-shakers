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
        throw new Error(ERROR_MESSAGES.BOBBLEHEAD.CREATE_FAILED);
      }

      // add business logic breadcrumb
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: newBobblehead,
        level: SENTRY_LEVELS.INFO,
        message: `Created bobblehead: ${newBobblehead.name}`,
      });

      // revalidate cache
      if (parsedInput.collectionId) {
        revalidatePath(
          $path({
            route: '/collections/[collectionId]',
            routeParams: {
              collectionId: parsedInput.collectionId,
            },
          }),
        );
      }

      return {
        data: newBobblehead,
        success: true,
      };
    } catch (error) {
      Sentry.setContext(SENTRY_CONTEXTS.ERROR_DETAILS, {
        operation: 'create_bobblehead',
        parsedInput,
        userId,
      });

      console.error('Error creating bobblehead:', error);
      throw new Error(ERROR_MESSAGES.BOBBLEHEAD.CREATE_FAILED);
    }
  });
