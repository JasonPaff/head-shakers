'use server';

import 'server-only';

import type { ActionResponse } from '@/lib/utils/action-response';

import { ACTION_NAMES, ERROR_MESSAGES, OPERATIONS, SENTRY_CONTEXTS } from '@/lib/constants';
import { AnalyticsFacade } from '@/lib/facades/analytics/analytics.facade';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { actionFailure, actionSuccess } from '@/lib/utils/action-response';
import { authActionClient, publicActionClient } from '@/lib/utils/next-safe-action';
import {
  trackCacheInvalidation,
  withActionBreadcrumbs,
  withActionErrorHandling,
} from '@/lib/utils/sentry-server/breadcrumbs.server';
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
    isTransactionRequired: true,
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
      const viewData = recordViewSchema.parse(ctx.sanitizedInput);

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

      return withActionErrorHandling(
        {
          actionName: ACTION_NAMES.ANALYTICS.TRACK_VIEW,
          contextData: {
            ipAddress: processedViewData.ipAddress,
            sessionId: processedViewData.sessionId,
            targetId: processedViewData.targetId,
            targetType: processedViewData.targetType,
            viewerId: processedViewData.viewerId,
          },
          contextType: SENTRY_CONTEXTS.VIEW_DATA,
          input: parsedInput,
          operation: OPERATIONS.ANALYTICS.RECORD_VIEW,
          userId: processedViewData.viewerId,
        },
        async () => {
          const result = await AnalyticsFacade.recordViewAsync(processedViewData, {
            deduplicationWindow: 600,
            shouldRespectPrivacySettings: true,
          });

          if (!result.isSuccessful) {
            return actionFailure(ERROR_MESSAGES.ANALYTICS.VIEW_RECORD_FAILED);
          }

          if (
            processedViewData.targetType === 'bobblehead' ||
            processedViewData.targetType === 'collection'
          ) {
            const cacheResult = CacheRevalidationService.analytics.onViewRecord(
              processedViewData.targetType,
              processedViewData.targetId,
              processedViewData.viewerId ?? undefined,
            );
            trackCacheInvalidation(
              {
                entityId: processedViewData.targetId,
                entityType: processedViewData.targetType,
                operation: 'view-record',
                userId: processedViewData.viewerId,
              },
              cacheResult,
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
        },
        {
          includeResultSummary: (r) =>
            r.wasSuccess ?
              { isDuplicate: r.data.isDuplicate, targetId: processedViewData.targetId, viewId: r.data.viewId }
            : {},
        },
      );
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
      const batchData = batchRecordViewsSchema.parse(ctx.sanitizedInput);

      return withActionErrorHandling(
        {
          actionName: ACTION_NAMES.ANALYTICS.BATCH_RECORD_VIEWS,
          contextData: {
            batchId: batchData.batchId,
            userId: ctx.userId,
            viewCount: batchData.views.length,
          },
          contextType: SENTRY_CONTEXTS.BATCH_VIEW_DATA,
          input: parsedInput,
          operation: OPERATIONS.ANALYTICS.BATCH_RECORD_VIEWS,
          userId: ctx.userId,
        },
        async () => {
          const result = await AnalyticsFacade.batchRecordViewsAsync(batchData.views, {
            batchId: batchData.batchId,
            deduplicationWindow: 600,
            shouldRespectPrivacySettings: true,
          });

          if (!result.isSuccessful) {
            return actionFailure(ERROR_MESSAGES.ANALYTICS.BATCH_VIEW_RECORD_FAILED);
          }

          return actionSuccess(
            {
              batchId: result.batchId,
              duplicateViews: result.duplicateViews,
              recordedViews: result.recordedViews,
              totalRequested: batchData.views.length,
            },
            `Successfully recorded ${result.recordedViews} views`,
          );
        },
        {
          includeResultSummary: (r) =>
            r.wasSuccess ?
              {
                batchId: r.data.batchId,
                duplicateViews: r.data.duplicateViews,
                recordedViews: r.data.recordedViews,
              }
            : {},
        },
      );
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
    }): Promise<
      ActionResponse<{
        averageViewDuration?: number;
        totalViews: number;
        uniqueViewers: number;
      }>
    > => {
      const statsData = viewStatsSchema.parse(ctx.sanitizedInput);

      return withActionBreadcrumbs(
        {
          actionName: ACTION_NAMES.ANALYTICS.GET_VIEW_STATS,
          contextData: { targetId: statsData.targetId, targetType: statsData.targetType },
          contextType: SENTRY_CONTEXTS.VIEW_DATA,
          operation: OPERATIONS.ANALYTICS.GET_VIEW_STATS,
        },
        async () => {
          const result = await AnalyticsFacade.getViewStatsAsync(statsData.targetId, statsData.targetType, {
            shouldIncludeAnonymous: statsData.includeAnonymous,
            timeframe: statsData.timeframe,
          });

          return actionSuccess(result);
        },
      );
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
      const trendingData = trendingContentSchema.parse(ctx.sanitizedInput);

      return withActionBreadcrumbs(
        {
          actionName: ACTION_NAMES.ANALYTICS.GET_TRENDING_CONTENT,
          contextData: { limit: trendingData.limit, targetType: trendingData.targetType },
          contextType: SENTRY_CONTEXTS.VIEW_DATA,
          operation: OPERATIONS.ANALYTICS.GET_TRENDING_CONTENT,
        },
        async () => {
          const result = await AnalyticsFacade.getTrendingContentAsync(trendingData.targetType, {
            isIncludingAnonymous: trendingData.includeAnonymous,
            limit: trendingData.limit,
            timeframe: trendingData.timeframe,
          });

          return actionSuccess(result);
        },
      );
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
      const aggregateData = aggregateViewsSchema.parse(ctx.sanitizedInput);

      return withActionErrorHandling(
        {
          actionName: ACTION_NAMES.ANALYTICS.AGGREGATE_VIEWS,
          contextData: {
            force: aggregateData.force,
            targetCount: aggregateData.targetIds.length,
            targetType: aggregateData.targetType,
            userId: ctx.userId,
          },
          contextType: SENTRY_CONTEXTS.AGGREGATE_DATA,
          input: parsedInput,
          operation: OPERATIONS.ANALYTICS.AGGREGATE_VIEWS,
          userId: ctx.userId,
        },
        async () => {
          const result = await AnalyticsFacade.aggregateViewsAsync(
            aggregateData.targetIds,
            aggregateData.targetType,
            {
              batchSize: 100,
              isForced: aggregateData.force,
            },
          );

          if (!result.isSuccessful) {
            return actionFailure(ERROR_MESSAGES.ANALYTICS.VIEW_AGGREGATION_FAILED);
          }

          if (aggregateData.targetType === 'bobblehead' || aggregateData.targetType === 'collection') {
            const cacheResult = CacheRevalidationService.analytics.onViewAggregation(
              aggregateData.targetType,
              result.processedTargets,
            );
            trackCacheInvalidation(
              {
                entityId: aggregateData.targetIds.join(','),
                entityType: aggregateData.targetType,
                operation: 'view-aggregation',
                userId: ctx.userId,
              },
              cacheResult,
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
        },
        {
          includeResultSummary: (r) =>
            r.wasSuccess ?
              {
                duration: r.data.duration,
                processedTargets: r.data.processedTargets,
                totalTargets: r.data.totalTargets,
              }
            : {},
        },
      );
    },
  );
