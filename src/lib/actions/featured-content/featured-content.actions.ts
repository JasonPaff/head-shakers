'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

import type { FeaturedContentRecord } from '@/lib/queries/featured-content/featured-content.query';
import type { ActionResponse } from '@/lib/utils/action-response';
import type { SelectFeaturedContent } from '@/lib/validations/system.validation';

import {
  ACTION_NAMES,
  ERROR_CODES,
  ERROR_MESSAGES,
  OPERATIONS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { actionSuccess } from '@/lib/utils/action-response';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { adminActionClient, authActionClient, publicActionClient } from '@/lib/utils/next-safe-action';
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
      throw new ActionError(
        ErrorType.BUSINESS_RULE,
        ERROR_CODES.ADMIN.INSUFFICIENT_PRIVILEGES,
        ERROR_MESSAGES.SYSTEM.ADMIN_PRIVILEGES_REQUIRED_CREATE,
        { ctx, operation: OPERATIONS.ADMIN.CREATE_FEATURED_CONTENT },
        false,
        403,
      );
    }

    const featuredContentData = adminCreateFeaturedContentSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURED_CONTENT_DATA, featuredContentData);

    try {
      const newFeaturedContent = await FeaturedContentFacade.createAsync(
        featuredContentData,
        ctx.userId,
        dbInstance,
      );

      if (!newFeaturedContent) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.ADMIN.CREATE_FEATURED_CONTENT_FAILED,
          ERROR_MESSAGES.FEATURED_CONTENT.CREATE_FAILED,
          { ctx, operation: OPERATIONS.ADMIN.CREATE_FEATURED_CONTENT },
          false,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          featuredContent: newFeaturedContent,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Created featured content: ${newFeaturedContent.title}`,
      });

      CacheRevalidationService.featured.onContentChange();

      return actionSuccess(newFeaturedContent);
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.ADMIN.CREATE_FEATURED_CONTENT,
        },
        operation: OPERATIONS.ADMIN.CREATE_FEATURED_CONTENT,
        userId: ctx.userId,
      });
    }
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
      throw new ActionError(
        ErrorType.BUSINESS_RULE,
        ERROR_CODES.ADMIN.INSUFFICIENT_PRIVILEGES,
        ERROR_MESSAGES.SYSTEM.ADMIN_PRIVILEGES_REQUIRED_UPDATE,
        { ctx, operation: OPERATIONS.ADMIN.UPDATE_FEATURED_CONTENT },
        false,
        403,
      );
    }

    const featuredContentData = adminUpdateFeaturedContentSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURED_CONTENT_DATA, featuredContentData);

    try {
      const updatedFeaturedContent = await FeaturedContentFacade.updateAsync(
        featuredContentData.id,
        featuredContentData,
        dbInstance,
      );

      if (!updatedFeaturedContent) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.ADMIN.FEATURED_CONTENT_NOT_FOUND,
          ERROR_MESSAGES.SYSTEM.FEATURED_CONTENT_NOT_FOUND,
          { ctx, operation: OPERATIONS.ADMIN.UPDATE_FEATURED_CONTENT },
          false,
          404,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          featuredContent: updatedFeaturedContent,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Updated featured content: ${updatedFeaturedContent.title}`,
      });

      CacheRevalidationService.featured.onContentChange();

      return actionSuccess(updatedFeaturedContent);
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.ADMIN.UPDATE_FEATURED_CONTENT,
        },
        operation: OPERATIONS.ADMIN.UPDATE_FEATURED_CONTENT,
        userId: ctx.userId,
      });
    }
  });

/**
 * toggle featured content active status (admin and moderator)
 */
export const toggleFeaturedContentActiveAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.TOGGLE_FEATURED_CONTENT,
    isTransactionRequired: true,
  })
  .inputSchema(toggleActiveSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<SelectFeaturedContent>> => {
    const { id, isActive } = toggleActiveSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURED_CONTENT_DATA, { id, isActive });

    try {
      const updatedFeaturedContent = await FeaturedContentFacade.toggleActiveAsync(id, isActive, dbInstance);

      if (!updatedFeaturedContent) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.FEATURED_CONTENT.NOT_FOUND,
          ERROR_MESSAGES.FEATURED_CONTENT.NOT_FOUND,
          { ctx, operation: OPERATIONS.FEATURED_CONTENT.TOGGLE_ACTIVE },
          false,
          404,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          featuredContent: updatedFeaturedContent,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Featured content ${isActive ? 'activated' : 'deactivated'}: ${updatedFeaturedContent.title}`,
      });

      CacheRevalidationService.featured.onContentChange();

      return actionSuccess(
        updatedFeaturedContent,
        `Featured content ${isActive ? 'activated' : 'deactivated'} successfully`,
      );
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.ADMIN.TOGGLE_FEATURED_CONTENT },
        operation: OPERATIONS.FEATURED_CONTENT.TOGGLE_ACTIVE,
        userId: ctx.userId,
      });
    }
  });

const deleteFeaturedContentSchema = z.object({
  id: z.uuid(),
});

/**
 * delete featured content (admin only)
 */
export const deleteFeaturedContentAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.DELETE_FEATURED_CONTENT,
    isTransactionRequired: true,
  })
  .inputSchema(deleteFeaturedContentSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse> => {
    const { id } = deleteFeaturedContentSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURED_CONTENT_DATA, { id });

    try {
      const deletedFeaturedContent = await FeaturedContentFacade.deleteAsync(id, dbInstance);

      if (!deletedFeaturedContent) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.FEATURED_CONTENT.DELETE_FAILED,
          ERROR_MESSAGES.FEATURED_CONTENT.DELETE_FAILED,
          { ctx, operation: OPERATIONS.FEATURED_CONTENT.DELETE },
          false,
          404,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          featuredContent: deletedFeaturedContent,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Deleted featured content: ${deletedFeaturedContent.title}`,
      });

      CacheRevalidationService.featured.onContentChange();

      return actionSuccess(null, 'Featured content deleted successfully');
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.ADMIN.DELETE_FEATURED_CONTENT },
        operation: OPERATIONS.FEATURED_CONTENT.DELETE,
        userId: ctx.userId,
      });
    }
  });

/**
 * get featured content by ID (admin only)
 */
export const getFeaturedContentByIdAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.GET_FEATURED_CONTENT_BY_ID,
  })
  .inputSchema(adminGetFeaturedContentByIdSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<FeaturedContentRecord>> => {
    const featuredContentData = adminGetFeaturedContentByIdSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURED_CONTENT_DATA, featuredContentData);

    try {
      const featuredContent = await FeaturedContentFacade.getFeaturedContentByIdForAdminAsync(
        featuredContentData.id,
        dbInstance,
      );

      if (!featuredContent) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.ADMIN.FEATURED_CONTENT_NOT_FOUND,
          ERROR_MESSAGES.SYSTEM.FEATURED_CONTENT_NOT_FOUND,
          { ctx, operation: OPERATIONS.ADMIN.GET_FEATURED_CONTENT_BY_ID },
          false,
          404,
        );
      }

      return actionSuccess(featuredContent);
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.ADMIN.GET_FEATURED_CONTENT_BY_ID,
        },
        operation: OPERATIONS.ADMIN.GET_FEATURED_CONTENT_BY_ID,
        userId: ctx.userId,
      });
    }
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

    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.ACTION,
      data: { contentId },
      level: SENTRY_LEVELS.INFO,
      message: 'Incrementing featured content view count',
    });

    try {
      await FeaturedContentFacade.incrementViewCountAsync(contentId);
      return actionSuccess(null);
    } catch (error) {
      return handleActionError(error, {
        metadata: { contentId },
        operation: ACTION_NAMES.PUBLIC.INCREMENT_FEATURED_VIEW_COUNT,
      });
    }
  });
