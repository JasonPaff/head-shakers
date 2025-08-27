'use server';

import * as Sentry from '@sentry/nextjs';
import { $path } from 'next-typesafe-url';
import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { bobbleheads } from '@/lib/db/schema';
import { authActionClient } from '@/lib/utils/next-safe-action';
import { insertBobbleheadSchema } from '@/lib/validations/bobbleheads.validation';

export const createBobbleheadAction = authActionClient
  .metadata({ actionName: 'createBobblehead' })
  .inputSchema(insertBobbleheadSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { userId } = ctx;

    Sentry.setContext('bobblehead_data', parsedInput);

    try {
      // create bobblehead
      const [newBobblehead] = await db
        .insert(bobbleheads)
        .values({
          ...parsedInput,
          userId,
        })
        .returning();

      if (!newBobblehead) {
        throw new Error('Failed to create bobblehead');
      }

      // add business logic breadcrumb
      Sentry.addBreadcrumb({
        category: 'business_logic',
        data: {
          bobbleheadId: newBobblehead.id,
          collectionId: newBobblehead.collectionId,
        },
        level: 'info',
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
      Sentry.setContext('error_details', {
        operation: 'create_bobblehead',
        parsedInput,
        userId,
      });

      console.error('Error creating bobblehead:', error);
      throw new Error('Failed to create bobblehead');
    }
  });
