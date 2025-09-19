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
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient, publicActionClient } from '@/lib/utils/next-safe-action';
import { insertContentViewSchema } from '@/lib/validations/analytics.validation';

interface AnalyticsFacadeInterface {
  aggregateViews: (
    targetIds: Array<string>,
    targetType: string,
    db: unknown,
    options: { batchSize: number; isForced: boolean },
  ) => Promise<ViewAggregationResult>;
  batchRecordViews: (
    views: Array<unknown>,
    db: unknown,
    options: { batchId?: string; deduplicationWindow: number; shouldRespectPrivacySettings: boolean },
  ) => Promise<BatchViewRecordResult>;
  getTrendingContent: (
    targetType: string,
    options: { limit: number; shouldIncludeAnonymous: boolean; timeframe: string },
    db: unknown,
  ) => Promise<Array<TrendingContentResult>>;
  getViewStats: (
    targetId: string,
    targetType: string,
    options: { shouldIncludeAnonymous: boolean; timeframe: string },
    db: unknown,
  ) => Promise<ViewStatsResult>;
  recordView: (
    viewData: unknown,
    db: unknown,
    options: { deduplicationWindow: number; shouldRespectPrivacySettings: boolean },
  ) => Promise<ViewRecordResult>;
}

interface BatchViewRecordResult {
  batchId: string;
  duplicateViews: number;
  isSuccessful: boolean;
  recordedViews: number;
}

interface TrendingContentResult {
  averageViewDuration?: number;
  rank: number;
  targetId: string;
  targetType: string;
  totalViews: number;
  uniqueViewers: number;
}

interface ViewAggregationResult {
  duration: number;
  errors: string[];
  isSuccessful: boolean;
  processedTargets: number;
}

// Types for facade responses (will be implemented in later steps)
interface ViewRecordResult {
  isDuplicate: boolean;
  isSuccessful: boolean;
  totalViews: number;
  viewId: string;
}

interface ViewStatsResult {
  averageViewDuration?: number;
  totalViews: number;
  uniqueViewers: number;
}

// Schemas for view tracking actions
const recordViewSchema = insertContentViewSchema.extend({
  metadata: z.record(z.string(), z.any()).optional(),
  sessionId: z.string().uuid().optional(),
});

const batchRecordViewsSchema = z.object({
  batchId: z.string().uuid().optional(),
  views: z.array(recordViewSchema),
});

const viewStatsSchema = z.object({
  includeAnonymous: z.boolean().default(true),
  targetId: z.string().uuid(),
  targetType: z.enum(ENUMS.CONTENT_VIEWS.TARGET_TYPE),
  timeframe: z.enum(['hour', 'day', 'week', 'month', 'year']).default('day'),
});

const trendingContentSchema = z.object({
  includeAnonymous: z.boolean().default(true),
  limit: z.number().min(1).max(100).default(10),
  targetType: z.enum(ENUMS.CONTENT_VIEWS.TARGET_TYPE),
  timeframe: z.enum(['hour', 'day', 'week', 'month']).default('day'),
});

const aggregateViewsSchema = z.object({
  force: z.boolean().default(false),
  targetIds: z.array(z.string().uuid()),
  targetType: z.enum(ENUMS.CONTENT_VIEWS.TARGET_TYPE),
});

/**
 * Records a single content view with rate limiting and deduplication
 */
export const recordViewAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.ANALYTICS.TRACK_VIEW,
  })
  .inputSchema(recordViewSchema)
  .action(async ({ ctx, parsedInput }) => {
    const viewData = recordViewSchema.parse(ctx.sanitizedInput);

    Sentry.setContext(SENTRY_CONTEXTS.VIEW_DATA, {
      ipAddress: viewData.ipAddress,
      sessionId: viewData.sessionId,
      targetId: viewData.targetId,
      targetType: viewData.targetType,
      viewerId: viewData.viewerId,
    });

    try {
      const { AnalyticsFacade } = (await import('@/lib/facades/analytics/analytics.facade')) as {
        AnalyticsFacade: AnalyticsFacadeInterface;
      };

      const result = await AnalyticsFacade.recordView(viewData, ctx.db, {
        deduplicationWindow: 300, // 5 minutes
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
          targetId: viewData.targetId,
          targetType: viewData.targetType,
          viewerId: viewData.viewerId,
          viewId: result.viewId,
        },
        level: SENTRY_LEVELS.INFO,
        message: `View recorded for ${viewData.targetType} ${viewData.targetId}${result.isDuplicate ? ' (duplicate)' : ''}`,
      });

      return {
        data: {
          isDuplicate: result.isDuplicate,
          totalViews: result.totalViews,
          viewId: result.viewId,
        },
        message: result.isDuplicate ? 'View already recorded recently' : 'View recorded successfully',
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.ANALYTICS.TRACK_VIEW,
        },
        operation: OPERATIONS.ANALYTICS.RECORD_VIEW,
        userId: viewData.viewerId ?? undefined,
      });
    }
  });

/**
 * Records multiple views in a batch for efficient processing
 */
export const batchRecordViewsAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.ANALYTICS.BATCH_RECORD_VIEWS,
    isTransactionRequired: true,
  })
  .inputSchema(batchRecordViewsSchema)
  .action(async ({ ctx, parsedInput }) => {
    const batchData = batchRecordViewsSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.BATCH_VIEW_DATA, {
      batchId: batchData.batchId,
      userId: ctx.userId,
      viewCount: batchData.views.length,
    });

    try {
      const { AnalyticsFacade } = (await import('@/lib/facades/analytics/analytics.facade')) as {
        AnalyticsFacade: AnalyticsFacadeInterface;
      };

      const result = await AnalyticsFacade.batchRecordViews(batchData.views, dbInstance, {
        batchId: batchData.batchId,
        deduplicationWindow: 300, // 5 minutes
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

      return {
        data: {
          batchId: result.batchId,
          duplicateViews: result.duplicateViews,
          recordedViews: result.recordedViews,
          totalRequested: batchData.views.length,
        },
        message: `Successfully recorded ${result.recordedViews} views`,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.ANALYTICS.BATCH_RECORD_VIEWS,
        },
        operation: OPERATIONS.ANALYTICS.BATCH_RECORD_VIEWS,
        userId: ctx.userId,
      });
    }
  });

/**
 * Gets view statistics for a specific content item
 */
export const getViewStatsAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.ANALYTICS.GET_VIEW_STATS,
  })
  .inputSchema(viewStatsSchema)
  .action(async ({ ctx, parsedInput }) => {
    const statsData = viewStatsSchema.parse(ctx.sanitizedInput);

    try {
      const { AnalyticsFacade } = (await import('@/lib/facades/analytics/analytics.facade')) as {
        AnalyticsFacade: AnalyticsFacadeInterface;
      };

      const result = await AnalyticsFacade.getViewStats(
        statsData.targetId,
        statsData.targetType,
        {
          shouldIncludeAnonymous: statsData.includeAnonymous,
          timeframe: statsData.timeframe,
        },
        ctx.db,
      );

      return {
        data: result,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.ANALYTICS.GET_VIEW_STATS,
        },
        operation: OPERATIONS.ANALYTICS.GET_VIEW_STATS,
      });
    }
  });

/**
 * Gets trending content based on view metrics
 */
export const getTrendingContentAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.ANALYTICS.GET_TRENDING_CONTENT,
  })
  .inputSchema(trendingContentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const trendingData = trendingContentSchema.parse(ctx.sanitizedInput);

    try {
      const { AnalyticsFacade } = (await import('@/lib/facades/analytics/analytics.facade')) as {
        AnalyticsFacade: AnalyticsFacadeInterface;
      };

      const result = await AnalyticsFacade.getTrendingContent(
        trendingData.targetType,
        {
          limit: trendingData.limit,
          shouldIncludeAnonymous: trendingData.includeAnonymous,
          timeframe: trendingData.timeframe,
        },
        ctx.db,
      );

      return {
        data: result,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.ANALYTICS.GET_TRENDING_CONTENT,
        },
        operation: OPERATIONS.ANALYTICS.GET_TRENDING_CONTENT,
      });
    }
  });

/**
 * Aggregates view data for background processing
 */
export const aggregateViewsAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.ANALYTICS.AGGREGATE_VIEWS,
    isTransactionRequired: true,
  })
  .inputSchema(aggregateViewsSchema)
  .action(async ({ ctx, parsedInput }) => {
    const aggregateData = aggregateViewsSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.AGGREGATE_DATA, {
      force: aggregateData.force,
      targetCount: aggregateData.targetIds.length,
      targetType: aggregateData.targetType,
      userId: ctx.userId,
    });

    try {
      const { AnalyticsFacade } = (await import('@/lib/facades/analytics/analytics.facade')) as {
        AnalyticsFacade: AnalyticsFacadeInterface;
      };

      const result = await AnalyticsFacade.aggregateViews(
        aggregateData.targetIds,
        aggregateData.targetType,
        dbInstance,
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

      return {
        data: {
          duration: result.duration,
          errors: result.errors,
          processedTargets: result.processedTargets,
          totalTargets: aggregateData.targetIds.length,
        },
        message: `Successfully aggregated views for ${result.processedTargets} items`,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.ANALYTICS.AGGREGATE_VIEWS,
        },
        operation: OPERATIONS.ANALYTICS.AGGREGATE_VIEWS,
        userId: ctx.userId,
      });
    }
  });
