'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';

import {
  ACTION_NAMES,
  ERROR_CODES,
  ERROR_MESSAGES,
  OPERATIONS,
  REDIS_KEYS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { ContentReportsFacade } from '@/lib/facades/content-reports/content-reports.facade';
import { createRateLimitMiddleware } from '@/lib/middleware/rate-limit.middleware';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient } from '@/lib/utils/next-safe-action';
import { checkReportStatusSchema, createContentReportSchema } from '@/lib/validations/moderation.validation';

// Apply hourly rate limiting (3 reports per hour)
const rateLimitedAuthClient = authActionClient.use(
  createRateLimitMiddleware(3, 3600, (ctx) =>
    REDIS_KEYS.RATE_LIMIT_ACTION(ctx.userId, 'content_report_hourly'),
  ),
);

export const createContentReportAction = rateLimitedAuthClient
  .metadata({
    actionName: ACTION_NAMES.MODERATION.CREATE_REPORT,
    isTransactionRequired: true,
  })
  .inputSchema(createContentReportSchema)
  .action(async ({ ctx }) => {
    const reportData = createContentReportSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.CONTENT_REPORT, {
      input: reportData,
      reason: reportData.reason,
      targetId: reportData.targetId,
      targetType: reportData.targetType,
      userId,
    });

    try {
      // Use facade to create report with all validation
      const newReport = await ContentReportsFacade.createReportAsync(reportData, userId, ctx.tx ?? ctx.db);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          reason: reportData.reason,
          reportId: newReport.id,
          targetId: reportData.targetId,
          targetType: reportData.targetType,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Content report created for ${reportData.targetType} ${reportData.targetId}`,
      });

      return {
        data: {
          reportId: newReport.id,
          status: newReport.status,
        },
        message: 'Thank you for your report. We will review it shortly.',
        success: true,
      };
    } catch (error) {
      // Handle specific facade errors
      if (error instanceof Error) {
        if (error.message.includes('already reported')) {
          throw new ActionError(
            ErrorType.BUSINESS_RULE,
            ERROR_CODES.CONTENT_REPORTS.DUPLICATE_REPORT,
            ERROR_MESSAGES.CONTENT_REPORTS.DUPLICATE_REPORT,
            { ctx, operation: OPERATIONS.MODERATION.CHECK_EXISTING_REPORT },
            true,
            409,
          );
        }

        if (error.message.includes('does not exist')) {
          throw new ActionError(
            ErrorType.NOT_FOUND,
            ERROR_CODES.CONTENT_REPORTS.TARGET_NOT_FOUND,
            ERROR_MESSAGES.CONTENT_REPORTS.TARGET_NOT_FOUND,
            { ctx, operation: OPERATIONS.MODERATION.VALIDATE_REPORT_TARGET },
            true,
            404,
          );
        }

        if (error.message.includes('your own content')) {
          throw new ActionError(
            ErrorType.BUSINESS_RULE,
            ERROR_CODES.CONTENT_REPORTS.SELF_REPORT,
            ERROR_MESSAGES.CONTENT_REPORTS.SELF_REPORT,
            { ctx, operation: OPERATIONS.MODERATION.VALIDATE_REPORT_TARGET },
            true,
            400,
          );
        }
      }

      return handleActionError(error, {
        input: reportData,
        metadata: {
          actionName: ACTION_NAMES.MODERATION.CREATE_REPORT,
          reason: reportData.reason,
          targetId: reportData.targetId,
          targetType: reportData.targetType,
        },
        operation: OPERATIONS.MODERATION.CREATE_REPORT,
      });
    }
  });

// Check if the user has already reported content
export const checkReportStatusAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.MODERATION.CHECK_REPORT_STATUS,
    isTransactionRequired: false,
  })
  .inputSchema(checkReportStatusSchema)
  .action(async ({ ctx }) => {
    const statusInput = checkReportStatusSchema.parse(ctx.sanitizedInput);
    const { targetId, targetType } = statusInput;
    const userId = ctx.userId;

    try {
      const reportStatus = await ContentReportsFacade.getReportStatusAsync(
        userId,
        targetId,
        targetType,
        ctx.db,
      );

      return {
        data: reportStatus,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: statusInput,
        metadata: {
          actionName: ACTION_NAMES.MODERATION.CHECK_REPORT_STATUS,
        },
        operation: OPERATIONS.MODERATION.GET_REPORT_STATUS,
      });
    }
  });
