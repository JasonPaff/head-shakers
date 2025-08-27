'use server';

import * as Sentry from '@sentry/nextjs';
import { $path } from 'next-typesafe-url';
import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { bobbleheads } from '@/lib/db/schema';
import { authActionClient } from '@/lib/utils/next-safe-action';
import { insertBobbleheadSchema } from '@/lib/validations/bobblehead';

export const createBobbleheadAction = authActionClient
  .metadata({ actionName: 'createBobblehead' })
  .inputSchema(insertBobbleheadSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { clerkUserId, userId } = ctx;

    // set user and business context (middleware handles the rest)
    Sentry.setUser({
      clerkId: clerkUserId,
      id: userId,
    });

    Sentry.setContext('bobblehead_data', {
      category: parsedInput.category,
      collectionId: parsedInput.collectionId,
      hasCustomFields: !!parsedInput.customFields,
      isPublic: parsedInput.isPublic,
      name: parsedInput.name,
    });

    try {
      // create bobblehead
      const [newBobblehead] = await db
        .insert(bobbleheads)
        .values({
          ...parsedInput,
          userId,
        })
        .returning();

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
        collectionId: parsedInput.collectionId,
        operation: 'create_bobblehead',
        userId,
      });

      console.error('Error creating bobblehead:', error);
      throw new Error('Failed to create bobblehead');
    }
  });
