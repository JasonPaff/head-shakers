'use server';

import 'server-only';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { ACTION_NAMES, ERROR_MESSAGES } from '@/lib/constants';
import { featuredContent } from '@/lib/db/schema';
import { AdminFacade } from '@/lib/facades/admin/admin.facade';
import { invalidateFeaturedContentCaches } from '@/lib/utils/cache.utils';
import { adminActionClient } from '@/lib/utils/next-safe-action';
import {
  adminCreateFeaturedContentSchema,
  adminUpdateFeaturedContentSchema,
} from '@/lib/validations/admin.validation';

/**
 * create featured content (admin only)
 */
export const createFeaturedContentAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.SYSTEM.CREATE_FEATURED_CONTENT,
    isTransactionRequired: true,
  })
  .inputSchema(adminCreateFeaturedContentSchema)
  .action(async ({ ctx }) => {
    // ensure the user has admin privileges (moderators cannot create featured content)
    if (!ctx.isAdmin) {
      throw new Error(ERROR_MESSAGES.SYSTEM.ADMIN_PRIVILEGES_REQUIRED_CREATE);
    }

    const input = adminCreateFeaturedContentSchema.parse(ctx.sanitizedInput);

    const [newFeaturedContent] = await ctx.db
      .insert(featuredContent)
      .values({
        ...input,
        curatorId: ctx.userId,
      })
      .returning();

    // invalidate featured content caches
    invalidateFeaturedContentCaches();

    return {
      featuredContent: newFeaturedContent,
      message: 'Featured content created successfully',
    };
  });

/**
 * update featured content (admin only)
 */
export const updateFeaturedContentAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.SYSTEM.UPDATE_FEATURED_CONTENT,
    isTransactionRequired: true,
  })
  .inputSchema(adminUpdateFeaturedContentSchema)
  .action(async ({ ctx }) => {
    // ensure user has admin privileges
    if (!ctx.isAdmin) {
      throw new Error(ERROR_MESSAGES.SYSTEM.ADMIN_PRIVILEGES_REQUIRED_UPDATE);
    }

    const { id, ...updateData } = adminUpdateFeaturedContentSchema.parse(ctx.sanitizedInput);

    const [updatedFeaturedContent] = await ctx.db
      .update(featuredContent)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(featuredContent.id, id))
      .returning();

    if (!updatedFeaturedContent) {
      throw new Error(ERROR_MESSAGES.SYSTEM.FEATURED_CONTENT_NOT_FOUND);
    }

    // invalidate featured content caches
    invalidateFeaturedContentCaches(id);

    return {
      featuredContent: updatedFeaturedContent,
      message: 'Featured content updated successfully',
    };
  });

const deleteFeaturedContentInputSchema = z.object({
  id: z.string().uuid('ID must be a valid UUID'),
});

/**
 * delete featured content (admin only)
 */
export const deleteFeaturedContentAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.SYSTEM.DELETE_FEATURED_CONTENT,
    isTransactionRequired: true,
  })
  .inputSchema(deleteFeaturedContentInputSchema)
  .action(async ({ ctx }) => {
    // ensure user has admin privileges
    if (!ctx.isAdmin) {
      throw new Error(ERROR_MESSAGES.SYSTEM.ADMIN_PRIVILEGES_REQUIRED_DELETE);
    }

    const input = deleteFeaturedContentInputSchema.parse(ctx.sanitizedInput);

    const [deletedFeaturedContent] = await ctx.db
      .delete(featuredContent)
      .where(eq(featuredContent.id, input.id))
      .returning();

    if (!deletedFeaturedContent) {
      throw new Error(ERROR_MESSAGES.SYSTEM.FEATURED_CONTENT_NOT_FOUND);
    }

    // invalidate featured content caches
    invalidateFeaturedContentCaches(input.id);

    return {
      message: 'Featured content deleted successfully',
    };
  });

const toggleFeaturedContentStatusInputSchema = z.object({
  id: z.string().uuid('ID must be a valid UUID'),
  isActive: z.boolean(),
});

/**
 * goggle featured content active status (moderators can use this)
 */
export const toggleFeaturedContentStatusAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.SYSTEM.TOGGLE_FEATURED_CONTENT_STATUS,
    isTransactionRequired: true,
  })
  .inputSchema(toggleFeaturedContentStatusInputSchema)
  .action(async ({ ctx }) => {
    const input = toggleFeaturedContentStatusInputSchema.parse(ctx.sanitizedInput);

    // moderators can toggle the status but not create/delete
    const [updatedFeaturedContent] = await ctx.db
      .update(featuredContent)
      .set({
        isActive: input.isActive,
        updatedAt: new Date(),
      })
      .where(eq(featuredContent.id, input.id))
      .returning();

    if (!updatedFeaturedContent) {
      throw new Error(ERROR_MESSAGES.SYSTEM.FEATURED_CONTENT_NOT_FOUND);
    }

    // invalidate featured content caches
    invalidateFeaturedContentCaches(input.id);

    return {
      featuredContent: updatedFeaturedContent,
      message: `Featured content ${input.isActive ? 'activated' : 'deactivated'} successfully`,
    };
  });

const getFeaturedContentByIdInputSchema = z.object({
  id: z.string().uuid('ID must be a valid UUID'),
});

/**
 * get featured content by ID (admin only)
 */
export const getFeaturedContentByIdAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.SYSTEM.GET_FEATURED_CONTENT,
  })
  .inputSchema(getFeaturedContentByIdInputSchema)
  .action(async ({ ctx }) => {
    const input = getFeaturedContentByIdInputSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;
    const featuredContentData = await AdminFacade.getFeaturedContentByIdForAdmin(input.id, dbInstance);

    if (!featuredContentData) {
      throw new Error(ERROR_MESSAGES.SYSTEM.FEATURED_CONTENT_NOT_FOUND);
    }

    return {
      featuredContent: featuredContentData,
    };
  });
