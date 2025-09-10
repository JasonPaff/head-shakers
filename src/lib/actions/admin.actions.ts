'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { $path } from 'next-typesafe-url';
import { revalidatePath } from 'next/cache';

import {
  ACTION_NAMES,
  ERROR_CODES,
  ERROR_MESSAGES,
  OPERATIONS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { AdminFacade } from '@/lib/facades/admin/admin.facade';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { adminActionClient } from '@/lib/utils/next-safe-action';
import {
  adminCreateFeaturedContentSchema,
  adminDeleteFeaturedContentSchema,
  adminGetFeaturedContentByIdSchema,
  adminToggleFeaturedContentStatusSchema,
  adminUpdateFeaturedContentSchema,
} from '@/lib/validations/admin.validation';

/**
 * create featured content (admin only)
 */
export const createFeaturedContentAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.CREATE_FEATURED_CONTENT,
    isTransactionRequired: true,
  })
  .inputSchema(adminCreateFeaturedContentSchema)
  .action(async ({ ctx, parsedInput }) => {
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
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURED_CONTENT_DATA, featuredContentData);

    try {
      const newFeaturedContent = await AdminFacade.createFeaturedContentAsync(
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

      revalidatePath($path({ route: '/admin/featured-content' }));

      return {
        data: newFeaturedContent,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
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
  .action(async ({ ctx, parsedInput }) => {
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
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURED_CONTENT_DATA, featuredContentData);

    try {
      const updatedFeaturedContent = await AdminFacade.updateFeaturedContentAsync(
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

      revalidatePath($path({ route: '/admin/featured-content' }));

      return {
        data: updatedFeaturedContent,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
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
 * delete featured content (admin only)
 */
export const deleteFeaturedContentAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.DELETE_FEATURED_CONTENT,
    isTransactionRequired: true,
  })
  .inputSchema(adminDeleteFeaturedContentSchema)
  .action(async ({ ctx, parsedInput }) => {
    if (!ctx.isAdmin) {
      throw new ActionError(
        ErrorType.BUSINESS_RULE,
        ERROR_CODES.ADMIN.INSUFFICIENT_PRIVILEGES,
        ERROR_MESSAGES.SYSTEM.ADMIN_PRIVILEGES_REQUIRED_DELETE,
        { ctx, operation: OPERATIONS.ADMIN.DELETE_FEATURED_CONTENT },
        false,
        403,
      );
    }

    const featuredContentData = adminDeleteFeaturedContentSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURED_CONTENT_DATA, featuredContentData);

    try {
      const deletedFeaturedContent = await AdminFacade.deleteFeaturedContentAsync(
        featuredContentData.id,
        dbInstance,
      );

      if (!deletedFeaturedContent) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.ADMIN.FEATURED_CONTENT_NOT_FOUND,
          ERROR_MESSAGES.SYSTEM.FEATURED_CONTENT_NOT_FOUND,
          { ctx, operation: OPERATIONS.ADMIN.DELETE_FEATURED_CONTENT },
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

      revalidatePath($path({ route: '/admin/featured-content' }));

      return {
        data: null,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.ADMIN.DELETE_FEATURED_CONTENT,
        },
        operation: OPERATIONS.ADMIN.DELETE_FEATURED_CONTENT,
        userId: ctx.userId,
      });
    }
  });

/**
 * toggle featured content active status (moderators can use this)
 */
export const toggleFeaturedContentStatusAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.TOGGLE_FEATURED_CONTENT_STATUS,
    isTransactionRequired: true,
  })
  .inputSchema(adminToggleFeaturedContentStatusSchema)
  .action(async ({ ctx, parsedInput }) => {
    const featuredContentData = adminToggleFeaturedContentStatusSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURED_CONTENT_DATA, featuredContentData);

    try {
      // moderators can toggle the status but not create/delete
      const updatedFeaturedContent = await AdminFacade.toggleFeaturedContentStatusAsync(
        featuredContentData.id,
        featuredContentData.isActive,
        dbInstance,
      );

      if (!updatedFeaturedContent) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.ADMIN.FEATURED_CONTENT_NOT_FOUND,
          ERROR_MESSAGES.SYSTEM.FEATURED_CONTENT_NOT_FOUND,
          { ctx, operation: OPERATIONS.ADMIN.TOGGLE_FEATURED_CONTENT_STATUS },
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
        message: `Featured content ${featuredContentData.isActive ? 'activated' : 'deactivated'}: ${updatedFeaturedContent.title}`,
      });

      revalidatePath($path({ route: '/admin/featured-content' }));

      return {
        data: updatedFeaturedContent,
        message: `Featured content ${featuredContentData.isActive ? 'activated' : 'deactivated'} successfully`,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.ADMIN.TOGGLE_FEATURED_CONTENT_STATUS,
        },
        operation: OPERATIONS.ADMIN.TOGGLE_FEATURED_CONTENT_STATUS,
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
  .action(async ({ ctx, parsedInput }) => {
    const featuredContentData = adminGetFeaturedContentByIdSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.FEATURED_CONTENT_DATA, featuredContentData);

    try {
      const featuredContent = await AdminFacade.getFeaturedContentByIdForAdmin(
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

      return {
        data: featuredContent,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.ADMIN.GET_FEATURED_CONTENT_BY_ID,
        },
        operation: OPERATIONS.ADMIN.GET_FEATURED_CONTENT_BY_ID,
        userId: ctx.userId,
      });
    }
  });
