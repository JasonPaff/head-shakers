'use server';

import 'server-only';
import { z } from 'zod';

import type { FeaturedContentRecord } from '@/lib/queries/featured-content/featured-content.query';
import type { ActionResponse } from '@/lib/utils/action-response';
import type { SelectFeaturedContent } from '@/lib/validations/system.validation';

import { ACTION_NAMES, ERROR_MESSAGES, OPERATIONS, SENTRY_CONTEXTS } from '@/lib/constants';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { actionSuccess } from '@/lib/utils/action-response';
import { createForbiddenError, createInternalError, createNotFoundError } from '@/lib/utils/error-builders';
import { adminActionClient, publicActionClient } from '@/lib/utils/next-safe-action';
import {
  trackCacheInvalidation,
  withActionBreadcrumbs,
  withActionErrorHandling,
} from '@/lib/utils/sentry-server/breadcrumbs.server';
import {
  adminCreateFeaturedContentSchema,
  adminGetFeaturedContentByIdSchema,
  adminUpdateFeaturedContentSchema,
} from '@/lib/validations/admin.validation';

const toggleActiveSchema = z.object({
  id: z.uuid(),
  isActive: z.boolean(),
});

/**
 * create featured content (admin only)
 */
export const createFeaturedContentAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.CREATE_FEATURED_CONTENT,
    isTransactionRequired: true,
  })
  .inputSchema(adminCreateFeaturedContentSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<SelectFeaturedContent>> => {
    // ensure the user has admin privileges (moderators cannot create featured content)
    if (!ctx.isAdmin) {
      throw createForbiddenError(ERROR_MESSAGES.SYSTEM.ADMIN_PRIVILEGES_REQUIRED_CREATE, {
        ctx,
        operation: OPERATIONS.ADMIN.CREATE_FEATURED_CONTENT,
      });
    }

    const featuredContentData = adminCreateFeaturedContentSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.ADMIN.CREATE_FEATURED_CONTENT,
        contextData: featuredContentData,
        contextType: SENTRY_CONTEXTS.FEATURED_CONTENT_DATA,
        input: parsedInput,
        operation: OPERATIONS.ADMIN.CREATE_FEATURED_CONTENT,
        userId: ctx.userId,
      },
      async () => {
        const newFeaturedContent = await FeaturedContentFacade.createAsync(
          featuredContentData,
          ctx.userId,
          dbInstance,
        );

        if (!newFeaturedContent) {
          throw createInternalError(ERROR_MESSAGES.FEATURED_CONTENT.CREATE_FAILED, {
            ctx,
            operation: OPERATIONS.ADMIN.CREATE_FEATURED_CONTENT,
          });
        }

        trackCacheInvalidation(
          {
            entityId: newFeaturedContent.id,
            entityType: 'featured-content',
            operation: 'create',
            userId: ctx.userId,
          },
          CacheRevalidationService.featured.onContentChange(),
        );

        return actionSuccess(newFeaturedContent, 'Featured content created successfully');
      },
      {
        includeResultSummary: (result) => ({
          featuredContentId: result.data.id,
          title: result.data.title,
        }),
      },
    );
  });

/**
 * update featured content (admin only)
 */
export const updateFeaturedContentAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.UPDATE_FEATURED_CONTENT,
    isTransactionRequired: true,
  })
  .inputSchema(adminUpdateFeaturedContentSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<SelectFeaturedContent>> => {
    // ensure user has admin privileges
    if (!ctx.isAdmin) {
      throw createForbiddenError(ERROR_MESSAGES.SYSTEM.ADMIN_PRIVILEGES_REQUIRED_UPDATE, {
        ctx,
        operation: OPERATIONS.ADMIN.UPDATE_FEATURED_CONTENT,
      });
    }

    const featuredContentData = adminUpdateFeaturedContentSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.ADMIN.UPDATE_FEATURED_CONTENT,
        contextData: featuredContentData,
        contextType: SENTRY_CONTEXTS.FEATURED_CONTENT_DATA,
        input: parsedInput,
        operation: OPERATIONS.ADMIN.UPDATE_FEATURED_CONTENT,
        userId: ctx.userId,
      },
      async () => {
        const updatedFeaturedContent = await FeaturedContentFacade.updateAsync(
          featuredContentData.id,
          featuredContentData,
          dbInstance,
        );

        if (!updatedFeaturedContent) {
          throw createNotFoundError('Featured content', featuredContentData.id, {
            ctx,
            operation: OPERATIONS.ADMIN.UPDATE_FEATURED_CONTENT,
          });
        }

        trackCacheInvalidation(
          {
            entityId: updatedFeaturedContent.id,
            entityType: 'featured-content',
            operation: 'update',
            userId: ctx.userId,
          },
          CacheRevalidationService.featured.onContentChange(),
        );

        return actionSuccess(updatedFeaturedContent, 'Featured content updated successfully');
      },
      {
        includeResultSummary: (result) => ({
          featuredContentId: result.data.id,
          title: result.data.title,
        }),
      },
    );
  });

/**
 * toggle featured content active status (admin only)
 */
export const toggleFeaturedContentActiveAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.TOGGLE_FEATURED_CONTENT,
    isTransactionRequired: true,
  })
  .inputSchema(toggleActiveSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<SelectFeaturedContent>> => {
    // ensure user has admin privileges
    if (!ctx.isAdmin) {
      throw createForbiddenError(ERROR_MESSAGES.SYSTEM.ADMIN_PRIVILEGES_REQUIRED_UPDATE, {
        ctx,
        operation: OPERATIONS.FEATURED_CONTENT.TOGGLE_ACTIVE,
      });
    }

    const { id, isActive } = toggleActiveSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.ADMIN.TOGGLE_FEATURED_CONTENT,
        contextData: { id, isActive },
        contextType: SENTRY_CONTEXTS.FEATURED_CONTENT_DATA,
        input: parsedInput,
        operation: OPERATIONS.FEATURED_CONTENT.TOGGLE_ACTIVE,
        userId: ctx.userId,
      },
      async () => {
        const updatedFeaturedContent = await FeaturedContentFacade.toggleActiveAsync(
          id,
          isActive,
          dbInstance,
        );

        if (!updatedFeaturedContent) {
          throw createNotFoundError('Featured content', id, {
            ctx,
            operation: OPERATIONS.FEATURED_CONTENT.TOGGLE_ACTIVE,
          });
        }

        trackCacheInvalidation(
          {
            entityId: updatedFeaturedContent.id,
            entityType: 'featured-content',
            operation: 'toggle-active',
            userId: ctx.userId,
          },
          CacheRevalidationService.featured.onContentChange(),
        );

        return actionSuccess(
          updatedFeaturedContent,
          `Featured content ${isActive ? 'activated' : 'deactivated'} successfully`,
        );
      },
      {
        includeResultSummary: (result) => ({
          featuredContentId: result.data.id,
          isActive: result.data.isActive,
          title: result.data.title,
        }),
      },
    );
  });

const deleteFeaturedContentSchema = z.object({
  id: z.uuid(),
});

/**
 * delete featured content (admin only)
 */
export const deleteFeaturedContentAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.DELETE_FEATURED_CONTENT,
    isTransactionRequired: true,
  })
  .inputSchema(deleteFeaturedContentSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse> => {
    // ensure user has admin privileges
    if (!ctx.isAdmin) {
      throw createForbiddenError(ERROR_MESSAGES.SYSTEM.ADMIN_PRIVILEGES_REQUIRED_DELETE, {
        ctx,
        operation: OPERATIONS.FEATURED_CONTENT.DELETE,
      });
    }

    const { id } = deleteFeaturedContentSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.ADMIN.DELETE_FEATURED_CONTENT,
        contextData: { id },
        contextType: SENTRY_CONTEXTS.FEATURED_CONTENT_DATA,
        input: parsedInput,
        operation: OPERATIONS.FEATURED_CONTENT.DELETE,
        userId: ctx.userId,
      },
      async () => {
        const deletedFeaturedContent = await FeaturedContentFacade.deleteAsync(id, dbInstance);

        if (!deletedFeaturedContent) {
          throw createNotFoundError('Featured content', id, {
            ctx,
            operation: OPERATIONS.FEATURED_CONTENT.DELETE,
          });
        }

        trackCacheInvalidation(
          {
            entityId: id,
            entityType: 'featured-content',
            operation: 'delete',
            userId: ctx.userId,
          },
          CacheRevalidationService.featured.onContentChange(),
        );

        return actionSuccess(null, 'Featured content deleted successfully');
      },
    );
  });

/**
 * get featured content by ID (admin only)
 */
export const getFeaturedContentByIdAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.GET_FEATURED_CONTENT_BY_ID,
  })
  .inputSchema(adminGetFeaturedContentByIdSchema)
  .action(async ({ ctx }): Promise<ActionResponse<FeaturedContentRecord>> => {
    const featuredContentData = adminGetFeaturedContentByIdSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    return withActionBreadcrumbs(
      {
        actionName: ACTION_NAMES.ADMIN.GET_FEATURED_CONTENT_BY_ID,
        contextData: featuredContentData,
        contextType: SENTRY_CONTEXTS.FEATURED_CONTENT_DATA,
        operation: OPERATIONS.ADMIN.GET_FEATURED_CONTENT_BY_ID,
        userId: ctx.userId,
      },
      async () => {
        const featuredContent = await FeaturedContentFacade.getFeaturedContentByIdForAdminAsync(
          featuredContentData.id,
          dbInstance,
        );

        if (!featuredContent) {
          throw createNotFoundError('Featured content', featuredContentData.id, {
            ctx,
            operation: OPERATIONS.ADMIN.GET_FEATURED_CONTENT_BY_ID,
          });
        }

        return actionSuccess(featuredContent);
      },
      {
        includeResultSummary: (result) => ({
          featuredContentId: result.data.id,
          title: result.data.title,
        }),
      },
    );
  });

const incrementViewCountSchema = z.object({
  contentId: z.string().uuid(),
});

/**
 * increment view count for featured content (public - no auth required)
 */
export const incrementFeaturedViewCountAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.PUBLIC.INCREMENT_FEATURED_VIEW_COUNT,
  })
  .inputSchema(incrementViewCountSchema)
  .action(async ({ ctx }): Promise<ActionResponse<null>> => {
    const { contentId } = incrementViewCountSchema.parse(ctx.sanitizedInput);

    return withActionBreadcrumbs(
      {
        actionName: ACTION_NAMES.PUBLIC.INCREMENT_FEATURED_VIEW_COUNT,
        contextData: { contentId },
        contextType: SENTRY_CONTEXTS.VIEW_DATA,
        operation: ACTION_NAMES.PUBLIC.INCREMENT_FEATURED_VIEW_COUNT,
      },
      async () => {
        await FeaturedContentFacade.incrementViewCountAsync(contentId);
        return actionSuccess(null);
      },
    );
  });
