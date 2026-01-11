'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';

import type { ReportsStatsResult } from '@/lib/queries/content-reports/content-reports.query';
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
import { ContentReportsFacade } from '@/lib/facades/content-reports/content-reports.facade';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { actionSuccess } from '@/lib/utils/action-response';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { adminActionClient } from '@/lib/utils/next-safe-action';
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
      parsedInput,
    }): Promise<
      ActionResponse<{ reports: Array<SelectContentReportWithSlugs>; stats: ReportsStatsResult }>
    > => {
      const { isAdmin, isModerator, userId } = ctx;
      const input = adminReportsFilterSchema.parse(ctx.sanitizedInput);
      const dbInstance = ctx.db;

      Sentry.setContext(SENTRY_CONTEXTS.CONTENT_REPORT, {
        isAdmin,
        isModerator,
        operation: 'get_admin_reports',
        userId,
      });

      try {
        const { reports, stats } = await ContentReportsFacade.getAllReportsWithSlugsForAdminAsync(
          input,
          userId,
          dbInstance,
        );

        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            reportCount: reports.length,
            statsTotal: stats.total,
          },
          level: SENTRY_LEVELS.INFO,
          message: `Admin retrieved ${reports.length} reports`,
        });

        return actionSuccess({
          reports,
          stats,
        });
      } catch (error) {
        return handleActionError(error, {
          input: parsedInput,
          metadata: {
            actionName: ACTION_NAMES.ADMIN.GET_ADMIN_REPORTS,
            userId,
          },
          operation: OPERATIONS.ADMIN.GET_ADMIN_REPORTS,
        });
      }
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

    // ensure the user has proper permissions for status changes
    // some status changes may require full admin privileges
    if (status === 'dismissed' && !isAdmin) {
      throw new ActionError(
        ErrorType.AUTHORIZATION,
        ERROR_CODES.ADMIN.INSUFFICIENT_PRIVILEGES,
        'Admin privileges required to dismiss reports',
        { ctx, operation: OPERATIONS.ADMIN.UPDATE_REPORT_STATUS },
        true,
        403,
      );
    }

    Sentry.setContext(SENTRY_CONTEXTS.CONTENT_REPORT, {
      isAdmin,
      isModerator,
      operation: 'update_report_status',
      reportId,
      status,
      userId,
    });

    try {
      // update the report status
      const updatedReport = await ContentReportsFacade.updateReportStatusAsync(
        { moderatorNotes, reportId, status },
        userId,
        dbInstance,
      );

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          newStatus: status,
          reportId,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Report status updated to ${status}`,
      });

      return actionSuccess(updatedReport);
    } catch (error) {
      // handle specific errors
      if (error instanceof Error && error.message.includes('Failed to update')) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.CONTENT_REPORTS.NOT_FOUND,
          ERROR_MESSAGES.CONTENT_REPORTS.NOT_FOUND,
          { ctx, operation: OPERATIONS.ADMIN.UPDATE_REPORT_STATUS },
          true,
          404,
        );
      }

      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.ADMIN.UPDATE_REPORT_STATUS,
          reportId,
        },
        operation: OPERATIONS.ADMIN.UPDATE_REPORT_STATUS,
      });
    }
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

    // ensure user has admin privileges for bulk operations
    if (!isAdmin) {
      throw new ActionError(
        ErrorType.AUTHORIZATION,
        ERROR_CODES.ADMIN.INSUFFICIENT_PRIVILEGES,
        'Admin privileges required for bulk operations',
        { ctx, operation: OPERATIONS.ADMIN.BULK_UPDATE_REPORTS },
        true,
        403,
      );
    }

    // validate bulk operation limits
    if (reportIds.length === 0) {
      throw new ActionError(
        ErrorType.VALIDATION,
        ERROR_CODES.CONTENT_REPORTS.INVALID_TARGET,
        'No reports selected for bulk update',
        { ctx, operation: OPERATIONS.ADMIN.BULK_UPDATE_REPORTS },
        true,
        400,
      );
    }

    if (reportIds.length > BULK_OPERATION_LIMITS.MAX_REPORTS) {
      throw new ActionError(
        ErrorType.VALIDATION,
        ERROR_CODES.CONTENT_REPORTS.INVALID_TARGET,
        `Cannot update more than ${BULK_OPERATION_LIMITS.MAX_REPORTS} reports at once`,
        { ctx, operation: OPERATIONS.ADMIN.BULK_UPDATE_REPORTS },
        true,
        400,
      );
    }

    Sentry.setContext(SENTRY_CONTEXTS.CONTENT_REPORT, {
      isAdmin,
      isModerator,
      operation: 'bulk_update_reports',
      reportCount: reportIds.length,
      status,
      userId,
    });

    try {
      // bulk update reports
      const updatedReports = await ContentReportsFacade.bulkUpdateReportsStatusAsync(
        { moderatorNotes, reportIds, status },
        userId,
        dbInstance,
      );

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          newStatus: status,
          reportCount: reportIds.length,
          updatedCount: updatedReports.length,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Bulk updated ${updatedReports.length} reports to ${status}`,
      });

      return actionSuccess(updatedReports);
    } catch (error) {
      // handle specific bulk operation errors
      if (error instanceof Error && error.message.includes('more than 100')) {
        throw new ActionError(
          ErrorType.VALIDATION,
          ERROR_CODES.CONTENT_REPORTS.INVALID_TARGET,
          ERROR_MESSAGES.CONTENT_REPORTS.INVALID_TARGET,
          { ctx, operation: OPERATIONS.ADMIN.BULK_UPDATE_REPORTS },
          true,
          400,
        );
      }

      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.ADMIN.BULK_UPDATE_REPORTS,
          reportCount: reportIds.length,
        },
        operation: OPERATIONS.ADMIN.BULK_UPDATE_REPORTS,
      });
    }
  });
