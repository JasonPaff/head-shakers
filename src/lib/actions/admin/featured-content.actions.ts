'use server';

import { eq } from 'drizzle-orm';
import { $path } from 'next-typesafe-url';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { ACTION_NAMES } from '@/lib/constants';
import { featuredContent } from '@/lib/db/schema';
import { authActionClient } from '@/lib/utils/next-safe-action';

const toggleActiveSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
});

export const toggleFeaturedContentActiveAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.TOGGLE_FEATURED_CONTENT,
    isTransactionRequired: true,
  })
  .inputSchema(toggleActiveSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, isActive } = parsedInput;

    // update the featured content status
    await ctx.db
      .update(featuredContent)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(featuredContent.id, id));

    // revalidate pages
    revalidatePath($path({ route: '/admin/featured-content' }));
    revalidatePath($path({ route: '/browse/featured' }));

    return {
      message: `Featured content ${isActive ? 'activated' : 'deactivated'} successfully`,
      success: true,
    };
  });

const deleteFeaturedContentSchema = z.object({
  id: z.string().uuid(),
});

export const deleteFeaturedContentAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.DELETE_FEATURED_CONTENT,
    isTransactionRequired: true,
  })
  .inputSchema(deleteFeaturedContentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id } = parsedInput;

    // delete the featured content
    const [deletedFeatureContent] = await ctx.db
      .delete(featuredContent)
      .where(eq(featuredContent.id, id))
      .returning();

    // revalidate the pages
    revalidatePath($path({ route: '/admin/featured-content' }));

    if (deletedFeatureContent?.isActive) {
      revalidatePath($path({ route: '/browse/featured' }));
    }

    return {
      message: 'Featured content deleted successfully',
      success: true,
    };
  });
