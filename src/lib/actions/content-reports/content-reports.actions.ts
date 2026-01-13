'use server';

import 'server-only';

import type { ActionResponse } from '@/lib/utils/action-response';

import {
  ACTION_NAMES,
  ERROR_CODES,
  ERROR_MESSAGES,
  OPERATIONS,
  REDIS_KEYS,
  SENTRY_CONTEXTS,
} from '@/lib/constants';
import { ContentReportsFacade } from '@/lib/facades/content-reports/content-reports.facade';
import { createRateLimitMiddleware } from '@/lib/middleware/rate-limit.middleware';
import { actionFailure, actionSuccess } from '@/lib/utils/action-response';
import { createBusinessRuleError, createNotFoundError } from '@/lib/utils/error-builders';
import { authActionClient } from '@/lib/utils/next-safe-action';
import {
  actionBreadcrumb,
  withActionBreadcrumbs,
  withActionErrorHandling,
} from '@/lib/utils/sentry-server/breadcrumbs.server';
import {
  checkReportStatusSchema,
  createContentReportSchema,
  type SelectContentReport,
} from '@/lib/validations/moderation.validation';

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
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<{ reportId: string; status: string }>> => {
    const reportData = createContentReportSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.MODERATION.CREATE_REPORT,
        contextData: {
          reason: reportData.reason,
          targetId: reportData.targetId,
          targetType: reportData.targetType,
          userId,
        },
        contextType: SENTRY_CONTEXTS.CONTENT_REPORT,
        input: parsedInput,
        operation: OPERATIONS.MODERATION.CREATE_REPORT,
        userId,
      },
      async () => {
        // First validate if the user can report this content
        const validationResult = await ContentReportsFacade.validateReportTargetAsync(
          reportData.targetId,
          reportData.targetType,
          userId,
          ctx.db,
        );

        if (!validationResult.canReport) {
          // Map validation reasons to appropriate error responses
          if (validationResult.reason?.includes('does not exist')) {
            throw createNotFoundError('Target content', reportData.targetId, {
              errorCode: ERROR_CODES.CONTENT_REPORTS.TARGET_NOT_FOUND,
              operation: OPERATIONS.MODERATION.VALIDATE_REPORT_TARGET,
            });
          }

          if (validationResult.reason?.includes('your own content')) {
            throw createBusinessRuleError(
              ERROR_CODES.CONTENT_REPORTS.SELF_REPORT,
              ERROR_MESSAGES.CONTENT_REPORTS.SELF_REPORT,
              { operation: OPERATIONS.MODERATION.VALIDATE_REPORT_TARGET },
            );
          }

          if (validationResult.reason?.includes('already reported')) {
            actionBreadcrumb(
              'Duplicate report attempt blocked',
              {
                operation: OPERATIONS.MODERATION.CHECK_EXISTING_REPORT,
                targetId: reportData.targetId,
                targetType: reportData.targetType,
              },
              'warning',
            );

            return actionFailure(ERROR_MESSAGES.CONTENT_REPORTS.DUPLICATE_REPORT);
          }

          // Generic validation failure
          return actionFailure(validationResult.reason ?? 'Unable to submit report');
        }

        // Create the report using facade
        const newReport = await ContentReportsFacade.createReportAsync(reportData, userId, ctx.db);

        return actionSuccess(
          {
            reportId: newReport.id,
            status: newReport.status,
          },
          'Thank you for your report. We will review it shortly.',
        );
      },
      {
        includeResultSummary: (result) =>
          result.wasSuccess ?
            {
              reportId: result.data?.reportId,
              targetId: reportData.targetId,
              targetType: reportData.targetType,
            }
          : {},
      },
    );
  });

// Check if the user has already reported content
export const checkReportStatusAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.MODERATION.CHECK_REPORT_STATUS,
    isTransactionRequired: false,
  })
  .inputSchema(checkReportStatusSchema)
  .action(
    async ({
      ctx,
    }): Promise<ActionResponse<{ hasReported: boolean; report: null | SelectContentReport }>> => {
      const statusInput = checkReportStatusSchema.parse(ctx.sanitizedInput);
      const { targetId, targetType } = statusInput;
      const userId = ctx.userId;

      return withActionBreadcrumbs(
        {
          actionName: ACTION_NAMES.MODERATION.CHECK_REPORT_STATUS,
          contextData: {
            targetId,
            targetType,
            userId,
          },
          contextType: SENTRY_CONTEXTS.CONTENT_REPORT,
          operation: OPERATIONS.MODERATION.GET_REPORT_STATUS,
          userId,
        },
        async () => {
          const reportStatus = await ContentReportsFacade.getReportStatusAsync(
            userId,
            targetId,
            targetType,
            ctx.db,
          );

          return actionSuccess(reportStatus);
        },
        {
          includeResultSummary: (result) => ({
            hasReported: result.data?.hasReported,
          }),
        },
      );
    },
  );
