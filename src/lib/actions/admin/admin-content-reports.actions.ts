'use server';

import 'server-only';

import type { ReportsStatsResult } from '@/lib/queries/content-reports/content-reports.query';
import type { ActionResponse } from '@/lib/utils/action-response';

import { ACTION_NAMES, ERROR_CODES, OPERATIONS, SENTRY_CONTEXTS } from '@/lib/constants';
import { ContentReportsFacade } from '@/lib/facades/content-reports/content-reports.facade';
import { actionSuccess } from '@/lib/utils/action-response';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { adminActionClient } from '@/lib/utils/next-safe-action';
import { withActionBreadcrumbs, withActionErrorHandling } from '@/lib/utils/sentry-server/breadcrumbs.server';
import {
  adminBulkUpdateReportsSchema,
  adminReportsFilterSchema,
  adminUpdateReportSchema,
  type SelectContentReport,
  type SelectContentReportWithSlugs,
} from '@/lib/validations/moderation.validation';

const BULK_OPERATION_LIMITS = {
  MAX_REPORTS: 100,
} as const;

/**
 * Get reports for the admin dashboard with filtering and pagination
 */
export const getAdminReportsAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.GET_ADMIN_REPORTS,
    isTransactionRequired: false,
  })
  .inputSchema(adminReportsFilterSchema)
  .action(
    async ({
      ctx,
    }): Promise<
      ActionResponse<{ reports: Array<SelectContentReportWithSlugs>; stats: ReportsStatsResult }>
    > => {
      const { isAdmin, isModerator, userId } = ctx;
      const input = adminReportsFilterSchema.parse(ctx.sanitizedInput);
      const dbInstance = ctx.db;

      return withActionBreadcrumbs(
        {
          actionName: ACTION_NAMES.ADMIN.GET_ADMIN_REPORTS,
          contextData: {
            filters: {
              dateFrom: input.dateFrom?.toISOString(),
              dateTo: input.dateTo?.toISOString(),
              limit: input.limit,
              moderatorId: input.moderatorId,
              offset: input.offset,
              reason: input.reason,
              reporterId: input.reporterId,
              status: input.status,
              targetType: input.targetType,
            },
            isAdmin,
            isModerator,
            userId,
          },
          contextType: SENTRY_CONTEXTS.CONTENT_REPORT,
          operation: OPERATIONS.ADMIN.GET_ADMIN_REPORTS,
          userId,
        },
        async () => {
          const { reports, stats } = await ContentReportsFacade.getAllReportsWithSlugsForAdminAsync(
            input,
            userId,
            dbInstance,
          );

          return actionSuccess(
            {
              reports,
              stats,
            },
            `Retrieved ${reports.length} reports`,
          );
        },
        {
          includeResultSummary: (result) =>
            result.wasSuccess ?
              { reportCount: result.data.reports.length, statsTotal: result.data.stats.total }
            : {},
        },
      );
    },
  );

/**
 * Update individual report status (admin only)
 */
export const updateReportStatusAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.UPDATE_REPORT_STATUS,
    isTransactionRequired: true,
  })
  .inputSchema(adminUpdateReportSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<SelectContentReport>> => {
    const { isAdmin, isModerator, userId } = ctx;
    const { moderatorNotes, reportId, status } = adminUpdateReportSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    // Ensure the user has proper permissions for status changes
    // Some status changes may require full admin privileges
    if (status === 'dismissed' && !isAdmin) {
      throw new ActionError(
        ErrorType.AUTHORIZATION,
        ERROR_CODES.ADMIN.INSUFFICIENT_PRIVILEGES,
        'Admin privileges required to dismiss reports',
        { operation: OPERATIONS.ADMIN.UPDATE_REPORT_STATUS },
        true,
        403,
      );
    }

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.ADMIN.UPDATE_REPORT_STATUS,
        contextData: {
          hasModeratorNotes: Boolean(moderatorNotes),
          isAdmin,
          isModerator,
          reportId,
          status,
          userId,
        },
        contextType: SENTRY_CONTEXTS.CONTENT_REPORT,
        input: parsedInput,
        operation: OPERATIONS.ADMIN.UPDATE_REPORT_STATUS,
        userId,
      },
      async () => {
        const updatedReport = await ContentReportsFacade.updateReportStatusAsync(
          { moderatorNotes, reportId, status },
          userId,
          dbInstance,
        );

        return actionSuccess(updatedReport, `Report status updated to ${status}`);
      },
      {
        includeResultSummary: (result) =>
          result.wasSuccess ?
            {
              newStatus: status,
              reportId,
              updatedBy: userId,
            }
          : {},
      },
    );
  });

/**
 * Bulk update multiple reports status (admin only)
 */
export const bulkUpdateReportsAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.BULK_UPDATE_REPORTS,
    isTransactionRequired: true,
  })
  .inputSchema(adminBulkUpdateReportsSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<Array<SelectContentReport>>> => {
    const { isAdmin, isModerator, userId } = ctx;
    const { moderatorNotes, reportIds, status } = adminBulkUpdateReportsSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    // Ensure user has admin privileges for bulk operations
    if (!isAdmin) {
      throw new ActionError(
        ErrorType.AUTHORIZATION,
        ERROR_CODES.ADMIN.INSUFFICIENT_PRIVILEGES,
        'Admin privileges required for bulk operations',
        { operation: OPERATIONS.ADMIN.BULK_UPDATE_REPORTS },
        true,
        403,
      );
    }

    // Validate bulk operation limits
    if (reportIds.length === 0) {
      throw new ActionError(
        ErrorType.VALIDATION,
        ERROR_CODES.CONTENT_REPORTS.INVALID_TARGET,
        'No reports selected for bulk update',
        { operation: OPERATIONS.ADMIN.BULK_UPDATE_REPORTS },
        true,
        400,
      );
    }

    if (reportIds.length > BULK_OPERATION_LIMITS.MAX_REPORTS) {
      throw new ActionError(
        ErrorType.VALIDATION,
        ERROR_CODES.CONTENT_REPORTS.INVALID_TARGET,
        `Cannot update more than ${BULK_OPERATION_LIMITS.MAX_REPORTS} reports at once`,
        { operation: OPERATIONS.ADMIN.BULK_UPDATE_REPORTS },
        true,
        400,
      );
    }

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.ADMIN.BULK_UPDATE_REPORTS,
        contextData: {
          hasModeratorNotes: Boolean(moderatorNotes),
          isAdmin,
          isModerator,
          reportCount: reportIds.length,
          status,
          userId,
        },
        contextType: SENTRY_CONTEXTS.CONTENT_REPORT,
        input: parsedInput,
        operation: OPERATIONS.ADMIN.BULK_UPDATE_REPORTS,
        userId,
      },
      async () => {
        const updatedReports = await ContentReportsFacade.bulkUpdateReportsStatusAsync(
          { moderatorNotes, reportIds, status },
          userId,
          dbInstance,
        );

        return actionSuccess(updatedReports, `Bulk updated ${updatedReports.length} reports to ${status}`);
      },
      {
        includeResultSummary: (result) =>
          result.wasSuccess ?
            {
              newStatus: status,
              reportCount: reportIds.length,
              updatedBy: userId,
              updatedCount: result.data.length,
            }
          : {},
      },
    );
  });
