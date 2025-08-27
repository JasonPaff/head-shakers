'use server';

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
    const { userId } = ctx;

    try {
      const [newBobblehead] = await db
        .insert(bobbleheads)
        .values({
          ...parsedInput,
          userId,
        })
        .returning();

      // revalidate relevant paths
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
      console.error('Error creating bobblehead:', error);
      throw new Error('Failed to create bobblehead');
    }
  });
