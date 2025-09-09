'use server';

import 'server-only';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import type { AdminActionContext } from '@/lib/utils/next-safe-action';

import { ACTION_NAMES } from '@/lib/constants';
import { featuredContent } from '@/lib/db/schema';
import { getFeaturedContentByIdForAdmin } from '@/lib/queries/admin/featured-content.queries';
import { invalidateFeaturedContentCaches } from '@/lib/utils/cache.utils';
import { adminActionClient } from '@/lib/utils/next-safe-action';
import {
  insertFeaturedContentSchema,
  updateFeaturedContentSchema,
} from '@/lib/validations/system.validation';

const adminCreateFeaturedContentSchema = insertFeaturedContentSchema.extend({
  curatorNotes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  priority: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      return isNaN(num) ? 0 : num;
    })
    .pipe(z.number().int().min(0))
    .default(0),
  sortOrder: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      return isNaN(num) ? 0 : num;
    })
    .pipe(z.number().int().min(0)),
  viewCount: z.number().int().min(0).default(0),
});

const adminUpdateFeaturedContentSchema = updateFeaturedContentSchema.extend({
  curatorNotes: z.string().optional(),
  id: z.string().uuid('ID must be a valid UUID'),
  metadata: z.record(z.string(), z.unknown()).optional(),
  priority: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      return isNaN(num) ? 0 : num;
    })
    .pipe(z.number().int().min(0))
    .optional(),
  sortOrder: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      return isNaN(num) ? 0 : num;
    })
    .pipe(z.number().int().min(0))
    .optional(),
  viewCount: z.number().int().min(0).optional(),
});

/**
 * Create featured content (admin only)
 */
export const createFeaturedContentAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.SYSTEM.CREATE_FEATURED_CONTENT,
    isTransactionRequired: true,
  })
  .inputSchema(adminCreateFeaturedContentSchema)
  .action(
    async ({
      ctx,
      parsedInput,
    }: {
      ctx: AdminActionContext;
      parsedInput: z.infer<typeof adminCreateFeaturedContentSchema>;
    }) => {
      // ensure the user has admin privileges (moderators cannot create featured content)
      if (!ctx.isAdmin) {
        throw new Error('Admin privileges required to create featured content');
      }

      const [newFeaturedContent] = await ctx.db
        .insert(featuredContent)
        .values({
          ...parsedInput,
          curatorId: ctx.userId,
          metadata: parsedInput.metadata ? JSON.stringify(parsedInput.metadata) : null,
        })
        .returning();

      // invalidate featured content caches
      await invalidateFeaturedContentCaches();

      return {
        featuredContent: newFeaturedContent,
        message: 'Featured content created successfully',
      };
    },
  );

/**
 * Update featured content (admin only)
 */
export const updateFeaturedContentAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.SYSTEM.UPDATE_FEATURED_CONTENT,
    isTransactionRequired: true,
  })
  .inputSchema(adminUpdateFeaturedContentSchema)
  .action(
    async ({
      ctx,
      parsedInput,
    }: {
      ctx: AdminActionContext;
      parsedInput: z.infer<typeof adminUpdateFeaturedContentSchema>;
    }) => {
      // ensure user has admin privileges
      if (!ctx.isAdmin) {
        throw new Error('Admin privileges required to update featured content');
      }

      const { id, ...updateData } = parsedInput;

      const [updatedFeaturedContent] = await ctx.db
        .update(featuredContent)
        .set({
          ...updateData,
          metadata: updateData.metadata ? JSON.stringify(updateData.metadata) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(featuredContent.id, id))
        .returning();

      if (!updatedFeaturedContent) {
        throw new Error('Featured content not found');
      }

      // invalidate featured content caches
      await invalidateFeaturedContentCaches(id);

      return {
        featuredContent: updatedFeaturedContent,
        message: 'Featured content updated successfully',
      };
    },
  );

/**
 * Delete featured content (admin only)
 */
export const deleteFeaturedContentAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.SYSTEM.DELETE_FEATURED_CONTENT,
    isTransactionRequired: true,
  })
  .inputSchema(
    z.object({
      id: z.string().uuid('ID must be a valid UUID'),
    }),
  )
  .action(async ({ ctx, parsedInput }: { ctx: AdminActionContext; parsedInput: { id: string } }) => {
    // ensure user has admin privileges
    if (!ctx.isAdmin) {
      throw new Error('Admin privileges required to delete featured content');
    }

    const [deletedFeaturedContent] = await ctx.db
      .delete(featuredContent)
      .where(eq(featuredContent.id, parsedInput.id))
      .returning();

    if (!deletedFeaturedContent) {
      throw new Error('Featured content not found');
    }

    // invalidate featured content caches
    await invalidateFeaturedContentCaches(parsedInput.id);

    return {
      message: 'Featured content deleted successfully',
    };
  });

/**
 * Toggle featured content active status (moderators can use this)
 */
export const toggleFeaturedContentStatusAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.SYSTEM.TOGGLE_FEATURED_CONTENT_STATUS,
    isTransactionRequired: true,
  })
  .inputSchema(
    z.object({
      id: z.string().uuid('ID must be a valid UUID'),
      isActive: z.boolean(),
    }),
  )
  .action(
    async ({
      ctx,
      parsedInput,
    }: {
      ctx: AdminActionContext;
      parsedInput: { id: string; isActive: boolean };
    }) => {
      // moderators can toggle status, but not create/delete
      const [updatedFeaturedContent] = await ctx.db
        .update(featuredContent)
        .set({
          isActive: parsedInput.isActive,
          updatedAt: new Date(),
        })
        .where(eq(featuredContent.id, parsedInput.id))
        .returning();

      if (!updatedFeaturedContent) {
        throw new Error('Featured content not found');
      }

      // invalidate featured content caches
      await invalidateFeaturedContentCaches(parsedInput.id);

      return {
        featuredContent: updatedFeaturedContent,
        message: `Featured content ${parsedInput.isActive ? 'activated' : 'deactivated'} successfully`,
      };
    },
  );

/**
 * Get featured content by ID (admin only)
 */
export const getFeaturedContentByIdAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.SYSTEM.GET_FEATURED_CONTENT,
  })
  .inputSchema(
    z.object({
      id: z.string().uuid('ID must be a valid UUID'),
    }),
  )
  .action(async ({ parsedInput }: { parsedInput: { id: string } }) => {
    const featuredContentData = await getFeaturedContentByIdForAdmin(parsedInput.id);

    if (!featuredContentData) {
      throw new Error('Featured content not found');
    }

    return {
      featuredContent: featuredContentData,
    };
  });
