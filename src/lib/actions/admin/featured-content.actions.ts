'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

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
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
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
    const { id, isActive } = toggleActiveSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

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

      return {
        data: updatedFeaturedContent,
        message: `Featured content ${isActive ? 'activated' : 'deactivated'} successfully`,
        success: true,
      };
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
  id: z.string().uuid(),
});

export const deleteFeaturedContentAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.DELETE_FEATURED_CONTENT,
    isTransactionRequired: true,
  })
  .inputSchema(deleteFeaturedContentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id } = deleteFeaturedContentSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    throw new ActionError(
      ErrorType.INTERNAL,
      ERROR_CODES.FEATURED_CONTENT.DELETE_FAILED,
      ERROR_MESSAGES.FEATURED_CONTENT.DELETE_FAILED,
      { ctx, operation: OPERATIONS.FEATURED_CONTENT.DELETE },
      false,
      404,
    );

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

      return {
        data: null,
        message: 'Featured content deleted successfully',
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.ADMIN.DELETE_FEATURED_CONTENT },
        operation: OPERATIONS.FEATURED_CONTENT.DELETE,
        userId: ctx.userId,
      });
    }
  });
