'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { ACTION_NAMES } from '@/lib/constants';
import { featuredContent } from '@/lib/db/schema';
import { invalidateFeaturedContentCaches } from '@/lib/utils/cache.utils';
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
  .action(async ({ ctx }) => {
    const { id, isActive } = toggleActiveSchema.parse(ctx.sanitizedInput);

    // update the featured content status
    await ctx.db
      .update(featuredContent)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(featuredContent.id, id));

    // invalidate all caches (Redis and Next.js)
    invalidateFeaturedContentCaches(id);

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
  .action(async ({ ctx }) => {
    const { id } = deleteFeaturedContentSchema.parse(ctx.sanitizedInput);

    // delete the featured content
    const [deletedFeatureContent] = await ctx.db
      .delete(featuredContent)
      .where(eq(featuredContent.id, id))
      .returning();

    // invalidate all caches if the content was active
    if (deletedFeatureContent?.isActive) {
      invalidateFeaturedContentCaches(id);
    }

    return {
      message: 'Featured content deleted successfully',
      success: true,
    };
  });
