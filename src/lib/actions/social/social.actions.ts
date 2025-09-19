'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

import {
  ACTION_NAMES,
  ENUMS,
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

      CacheRevalidationService.social.onLikeChange(
        likeData.targetType === 'subcollection' ? 'collection' : likeData.targetType,
        likeData.targetId,
        ctx.userId,
        result.isLiked ? 'like' : 'unlike',
      );

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

export const getPublicBatchLikeCountsAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.SOCIAL.LIKE,
  })
  .inputSchema(getBatchLikeDataSchema)
  .action(async ({ ctx, parsedInput }) => {
    const batchData = getBatchLikeDataSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    try {
      const results = await SocialFacade.getBatchContentLikeData(batchData.targets, undefined, dbInstance);

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

export const getTrendingContentAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.SOCIAL.LIKE,
  })
  .inputSchema(
    z.object({
      limit: z.number().min(1).max(50).default(10),
      targetType: z.enum(ENUMS.LIKE.TARGET_TYPE),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    const trendingData = parsedInput;
    const dbInstance = ctx.db;

    try {
      const results = await SocialFacade.getTrendingContent(
        trendingData.targetType,
        { limit: trendingData.limit },
        undefined,
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
