'use server';

import { auth } from '@clerk/nextjs/server';
import { createSafeActionClient } from 'next-safe-action';
import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { bobbleheads } from '@/lib/db/schema';
import { insertBobbleheadSchema } from '@/lib/validations/bobblehead';

const action = createSafeActionClient();

export const createBobbleheadAction = action
  .inputSchema(insertBobbleheadSchema)
  .action(async ({ parsedInput }) => {
    const { userId } = await auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    try {
      // Insert the new bobblehead with the user ID
      const [newBobblehead] = await db
        .insert(bobbleheads)
        .values({
          ...parsedInput,
          userId,
        })
        .returning();

      // Revalidate relevant paths
      revalidatePath('/bobbleheads');
      revalidatePath(`/collections/${parsedInput.collectionId}`);

      return {
        data: newBobblehead,
        success: true,
      };
    } catch (error) {
      console.error('Error creating bobblehead:', error);
      throw new Error('Failed to create bobblehead');
    }
  });
