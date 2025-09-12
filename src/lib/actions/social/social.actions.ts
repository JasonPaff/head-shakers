'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { $path } from 'next-typesafe-url';
import { revalidatePath } from 'next/cache';
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
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient, publicActionClient } from '@/lib/utils/next-safe-action';
import {
  getBatchLikeDataSchema,
  getLikeStatusSchema,
  toggleLikeSchema,
} from '@/lib/validations/like.validation';

/**
 * toggle like status for content (like/unlike)
 * authenticated users only
 */
export const toggleLikeAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.SOCIAL.LIKE,
    isTransactionRequired: true,
  })
  .inputSchema(toggleLikeSchema)
  .action(async ({ ctx, parsedInput }) => {
    const likeData = toggleLikeSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.LIKE_DATA, {
      targetId: likeData.targetId,
      targetType: likeData.targetType,
      userId: ctx.userId,
    });

    try {
      const result = await SocialFacade.toggleLike(
        likeData.targetId,
        likeData.targetType,
        ctx.userId,
        dbInstance,
      );

      if (!result.isSuccessful) {
        throw new ActionError(
          ErrorType.BUSINESS_RULE,
          ERROR_CODES.SOCIAL.LIKE_FAILED,
          ERROR_MESSAGES.SOCIAL.LIKE_FAILED,
          { ctx, operation: OPERATIONS.SOCIAL.TOGGLE_LIKE },
          true, // recoverable
          400,
        );
      }

      const actionType = result.isLiked ? 'liked' : 'unliked';

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          actionType,
          likeCount: result.likeCount,
          targetId: likeData.targetId,
          targetType: likeData.targetType,
        },
        level: SENTRY_LEVELS.INFO,
        message: `User ${actionType} ${likeData.targetType} ${likeData.targetId}`,
      });

      // revalidate content pages that might show this data
      revalidatePath(`/bobbleheads/${likeData.targetId}`);
      revalidatePath(`/collections/${likeData.targetId}`);
      revalidatePath($path({ route: '/browse/featured' }));

      // revalidate cache for content-specific invalidation
      if (likeData.targetType === 'collection') {
        CacheRevalidationService.revalidateCollectionFeaturedContent(likeData.targetId);
      } else if (likeData.targetType === 'bobblehead') {
        CacheRevalidationService.revalidateBobbleheadFeaturedContent(likeData.targetId);
      }

      return {
        data: {
          isLiked: result.isLiked,
          likeCount: result.likeCount,
          likeId: result.likeId,
        },
        message:
          result.isLiked ?
            `Added to liked ${likeData.targetType}s`
          : `Removed from liked ${likeData.targetType}s`,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.SOCIAL.LIKE,
        },
        operation: OPERATIONS.SOCIAL.TOGGLE_LIKE,
        userId: ctx.userId,
      });
    }
  });

/**
 * get like data for content (like count and user's like status)
 * authenticated users only
 */
export const getContentLikeDataAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.SOCIAL.LIKE,
  })
  .inputSchema(getLikeStatusSchema)
  .action(async ({ ctx, parsedInput }) => {
    const likeData = getLikeStatusSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    try {
      const result = await SocialFacade.getContentLikeData(
        likeData.targetId,
        likeData.targetType,
        ctx.userId,
        dbInstance,
      );

      return {
        data: result,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.SOCIAL.LIKE,
        },
        operation: OPERATIONS.SOCIAL.GET_USER_LIKE_STATUS,
        userId: ctx.userId,
      });
    }
  });

/**
 * get like data for multiple content items (batch operation)
 * authenticated users only
 */
export const getBatchContentLikeDataAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.SOCIAL.LIKE,
  })
  .inputSchema(getBatchLikeDataSchema)
  .action(async ({ ctx, parsedInput }) => {
    const batchData = getBatchLikeDataSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    try {
      const results = await SocialFacade.getBatchContentLikeData(batchData.targets, ctx.userId, dbInstance);

      return {
        data: results,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.SOCIAL.LIKE,
        },
        operation: OPERATIONS.SOCIAL.GET_USER_LIKE_STATUSES,
        userId: ctx.userId,
      });
    }
  });

/**
 * get like count for content (public access)
 * no authentication required - used for displaying like counts to all users
 */
export const getPublicLikeCountAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.SOCIAL.LIKE,
  })
  .inputSchema(getLikeStatusSchema)
  .action(async ({ ctx, parsedInput }) => {
    const likeData = getLikeStatusSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    try {
      const likeCount = await SocialFacade.getLikeCount(likeData.targetId, likeData.targetType, dbInstance);

      return {
        data: {
          likeCount,
          targetId: likeData.targetId,
          targetType: likeData.targetType,
        },
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.SOCIAL.LIKE,
        },
        operation: OPERATIONS.SOCIAL.GET_LIKE_COUNT,
      });
    }
  });

/**
 * get public like data for multiple content items (batch operation)
 * no authentication required - used for displaying like counts to all users
 */
export const getPublicBatchLikeCountsAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.SOCIAL.LIKE,
  })
  .inputSchema(getBatchLikeDataSchema)
  .action(async ({ ctx, parsedInput }) => {
    const batchData = getBatchLikeDataSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    try {
      const results = await SocialFacade.getBatchContentLikeData(
        batchData.targets,
        undefined, // no user ID for public access
        dbInstance,
      );

      return {
        data: results,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.SOCIAL.LIKE,
        },
        operation: OPERATIONS.SOCIAL.GET_LIKE_COUNTS,
      });
    }
  });

/**
 * get trending content based on like activity
 * no authentication required - public trending data
 */
export const getTrendingContentAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.SOCIAL.LIKE,
  })
  .inputSchema(
    z.object({
      limit: z.number().min(1).max(50).default(10),
      targetType: z.enum(['bobblehead', 'collection', 'subcollection']),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    const trendingData = parsedInput;
    const dbInstance = ctx.db;

    try {
      const results = await SocialFacade.getTrendingContent(
        trendingData.targetType,
        { limit: trendingData.limit },
        undefined, // no user ID for public access
        dbInstance,
      );

      return {
        data: results,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.SOCIAL.LIKE,
        },
        operation: OPERATIONS.SOCIAL.GET_TRENDING_CONTENT,
      });
    }
  });
