'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';

import type { ActionResponse } from '@/lib/utils/action-response';

import {
  ACTION_NAMES,
  ERROR_CODES,
  ERROR_MESSAGES,
  OPERATIONS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { AnalyticsFacade } from '@/lib/facades/analytics/analytics.facade';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { actionSuccess } from '@/lib/utils/action-response';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient, publicActionClient } from '@/lib/utils/next-safe-action';
import {
  aggregateViewsSchema,
  batchRecordViewsSchema,
  recordViewSchema,
  trendingContentSchema,
  viewStatsSchema,
} from '@/lib/validations/analytics.validation';

/**
 * Records a single content view with rate limiting and deduplication
 */
export const recordViewAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.ANALYTICS.TRACK_VIEW,
  })
  .inputSchema(recordViewSchema)
  .action(
    async ({
      ctx,
      parsedInput,
    }): Promise<
      ActionResponse<{
        isDuplicate: boolean;
        totalViews: number;
        viewId: string;
      }>
    > => {
      const viewData = recordViewSchema.parse(ctx.sanitizedInput || parsedInput);

      // convert Clerk ID to internal UUID if needed
      let resolvedViewerId: null | string = null;
      if (viewData.viewerId) {
        // check if it's already a UUID (36 chars with hyphens) or a Clerk ID (starts with user_)
        if (viewData.viewerId.startsWith('user_')) {
          const user = await UsersFacade.getUserByClerkIdAsync(viewData.viewerId, ctx.db);
          if (user) resolvedViewerId = user.id;
        } else {
          // assume it's already a UUID
          resolvedViewerId = viewData.viewerId;
        }
      }

      const processedViewData = {
        ...viewData,
        viewerId: resolvedViewerId ?? undefined,
      };

      Sentry.setContext(SENTRY_CONTEXTS.VIEW_DATA, {
        ipAddress: processedViewData.ipAddress,
        sessionId: processedViewData.sessionId,
        targetId: processedViewData.targetId,
        targetType: processedViewData.targetType,
        viewerId: processedViewData.viewerId,
      });

      try {
        const result = await AnalyticsFacade.recordView(processedViewData, ctx.db, {
          deduplicationWindow: 600,
          shouldRespectPrivacySettings: true,
        });

        if (!result.isSuccessful) {
          throw new ActionError(
            ErrorType.BUSINESS_RULE,
            ERROR_CODES.ANALYTICS.VIEW_RECORD_FAILED,
            ERROR_MESSAGES.ANALYTICS.VIEW_RECORD_FAILED,
            { ctx, operation: OPERATIONS.ANALYTICS.RECORD_VIEW },
            true,
            400,
          );
        }

        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            isDuplicate: result.isDuplicate,
            targetId: processedViewData.targetId,
            targetType: processedViewData.targetType,
            viewerId: processedViewData.viewerId,
            viewId: result.viewId,
          },
          level: SENTRY_LEVELS.INFO,
          message: `View recorded for ${processedViewData.targetType} ${processedViewData.targetId}${result.isDuplicate ? ' (duplicate)' : ''}`,
        });

        if (processedViewData.targetType === 'bobblehead' || processedViewData.targetType === 'collection') {
          CacheRevalidationService.analytics.onViewRecord(
            processedViewData.targetType,
            processedViewData.targetId,
            processedViewData.viewerId ?? undefined,
          );
        }

        return actionSuccess(
          {
            isDuplicate: result.isDuplicate,
            totalViews: result.totalViews,
            viewId: result.viewId,
          },
          result.isDuplicate ? 'View already recorded recently' : 'View recorded successfully',
        );
      } catch (error) {
        return handleActionError(error, {
          input: parsedInput,
          metadata: {
            actionName: ACTION_NAMES.ANALYTICS.TRACK_VIEW,
          },
          operation: OPERATIONS.ANALYTICS.RECORD_VIEW,
          userId: processedViewData.viewerId ?? undefined,
        });
      }
    },
  );

/**
 * Records multiple views in a batch for efficient processing
 */
export const batchRecordViewsAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.ANALYTICS.BATCH_RECORD_VIEWS,
    isTransactionRequired: true,
  })
  .inputSchema(batchRecordViewsSchema)
  .action(
    async ({
      ctx,
      parsedInput,
    }): Promise<
      ActionResponse<{
        batchId: string;
        duplicateViews: number;
        recordedViews: number;
        totalRequested: number;
      }>
    > => {
      const batchData = batchRecordViewsSchema.parse(ctx.sanitizedInput || parsedInput);
      const dbInstance = ctx.db;

      Sentry.setContext(SENTRY_CONTEXTS.BATCH_VIEW_DATA, {
        batchId: batchData.batchId,
        userId: ctx.userId,
        viewCount: batchData.views.length,
      });

      try {
        const result = await AnalyticsFacade.batchRecordViews(batchData.views, dbInstance, {
          batchId: batchData.batchId,
          deduplicationWindow: 600,
          shouldRespectPrivacySettings: true,
        });

        if (!result.isSuccessful) {
          throw new ActionError(
            ErrorType.BUSINESS_RULE,
            ERROR_CODES.ANALYTICS.BATCH_VIEW_RECORD_FAILED,
            ERROR_MESSAGES.ANALYTICS.BATCH_VIEW_RECORD_FAILED,
            { ctx, operation: OPERATIONS.ANALYTICS.BATCH_RECORD_VIEWS },
            true,
            400,
          );
        }

        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            batchId: batchData.batchId,
            duplicateViews: result.duplicateViews,
            recordedViews: result.recordedViews,
            requestedViews: batchData.views.length,
          },
          level: SENTRY_LEVELS.INFO,
          message: `Batch recorded ${result.recordedViews}/${batchData.views.length} views`,
        });

        return actionSuccess(
          {
            batchId: result.batchId,
            duplicateViews: result.duplicateViews,
            recordedViews: result.recordedViews,
            totalRequested: batchData.views.length,
          },
          `Successfully recorded ${result.recordedViews} views`,
        );
      } catch (error) {
        return handleActionError(error, {
          input: parsedInput,
          metadata: {
            actionName: ACTION_NAMES.ANALYTICS.BATCH_RECORD_VIEWS,
          },
          operation: OPERATIONS.ANALYTICS.BATCH_RECORD_VIEWS,
          userId: ctx.userId,
        });
      }
    },
  );

/**
 * Gets view statistics for a specific content item
 */
export const getViewStatsAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.ANALYTICS.GET_VIEW_STATS,
  })
  .inputSchema(viewStatsSchema)
  .action(
    async ({
      ctx,
      parsedInput,
    }): Promise<
      ActionResponse<{
        averageViewDuration?: number;
        totalViews: number;
        uniqueViewers: number;
      }>
    > => {
      const statsData = viewStatsSchema.parse(ctx.sanitizedInput);

      try {
        const result = await AnalyticsFacade.getViewStats(
          statsData.targetId,
          statsData.targetType,
          {
            shouldIncludeAnonymous: statsData.includeAnonymous,
            timeframe: statsData.timeframe,
          },
          ctx.db,
        );

        return actionSuccess(result);
      } catch (error) {
        return handleActionError(error, {
          input: parsedInput,
          metadata: {
            actionName: ACTION_NAMES.ANALYTICS.GET_VIEW_STATS,
          },
          operation: OPERATIONS.ANALYTICS.GET_VIEW_STATS,
        });
      }
    },
  );

/**
 * Gets trending content based on view metrics
 */
export const getTrendingContentAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.ANALYTICS.GET_TRENDING_CONTENT,
  })
  .inputSchema(trendingContentSchema)
  .action(
    async ({
      ctx,
      parsedInput,
    }): Promise<
      ActionResponse<
        Array<{
          averageViewDuration?: number;
          rank: number;
          targetId: string;
          targetType: string;
          totalViews: number;
          uniqueViewers: number;
        }>
      >
    > => {
      const trendingData = trendingContentSchema.parse(ctx.sanitizedInput || parsedInput);

      try {
        const result = await AnalyticsFacade.getTrendingContent(
          trendingData.targetType,
          {
            isIncludingAnonymous: trendingData.includeAnonymous,
            limit: trendingData.limit,
            timeframe: trendingData.timeframe,
          },
          ctx.db,
        );

        return actionSuccess(result);
      } catch (error) {
        return handleActionError(error, {
          input: parsedInput,
          metadata: {
            actionName: ACTION_NAMES.ANALYTICS.GET_TRENDING_CONTENT,
          },
          operation: OPERATIONS.ANALYTICS.GET_TRENDING_CONTENT,
        });
      }
    },
  );

/**
 * Aggregates view data for background processing
 */
export const aggregateViewsAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.ANALYTICS.AGGREGATE_VIEWS,
    isTransactionRequired: true,
  })
  .inputSchema(aggregateViewsSchema)
  .action(
    async ({
      ctx,
      parsedInput,
    }): Promise<
      ActionResponse<{
        duration: number;
        errors: Array<string>;
        processedTargets: number;
        totalTargets: number;
      }>
    > => {
      const aggregateData = aggregateViewsSchema.parse(ctx.sanitizedInput || parsedInput);

      Sentry.setContext(SENTRY_CONTEXTS.AGGREGATE_DATA, {
        force: aggregateData.force,
        targetCount: aggregateData.targetIds.length,
        targetType: aggregateData.targetType,
        userId: ctx.userId,
      });

      try {
        const result = await AnalyticsFacade.aggregateViews(
          aggregateData.targetIds,
          aggregateData.targetType,
          {
            batchSize: 100,
            isForced: aggregateData.force,
          },
        );

        if (!result.isSuccessful) {
          throw new ActionError(
            ErrorType.BUSINESS_RULE,
            ERROR_CODES.ANALYTICS.VIEW_AGGREGATION_FAILED,
            ERROR_MESSAGES.ANALYTICS.VIEW_AGGREGATION_FAILED,
            { ctx, operation: OPERATIONS.ANALYTICS.AGGREGATE_VIEWS },
            true,
            500,
          );
        }

        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            errors: result.errors,
            processedTargets: result.processedTargets,
            requestedTargets: aggregateData.targetIds.length,
            targetType: aggregateData.targetType,
          },
          level: SENTRY_LEVELS.INFO,
          message: `Aggregated views for ${result.processedTargets}/${aggregateData.targetIds.length} targets`,
        });

        if (aggregateData.targetType === 'bobblehead' || aggregateData.targetType === 'collection') {
          CacheRevalidationService.analytics.onViewAggregation(
            aggregateData.targetType,
            result.processedTargets,
          );
        }

        return actionSuccess(
          {
            duration: result.duration,
            errors: result.errors,
            processedTargets: result.processedTargets,
            totalTargets: aggregateData.targetIds.length,
          },
          `Successfully aggregated views for ${result.processedTargets} items`,
        );
      } catch (error) {
        return handleActionError(error, {
          input: parsedInput,
          metadata: {
            actionName: ACTION_NAMES.ANALYTICS.AGGREGATE_VIEWS,
          },
          operation: OPERATIONS.ANALYTICS.AGGREGATE_VIEWS,
          userId: ctx.userId,
        });
      }
    },
  );
