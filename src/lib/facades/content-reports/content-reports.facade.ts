import type { z } from 'zod';

import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type {
  SelectContentReport,
  SelectContentReportWithSlugs,
} from '@/lib/validations/moderation.validation';
import type {
  adminBulkUpdateReportsSchema,
  adminReportsFilterSchema,
  adminUpdateReportSchema,
  createContentReportSchema,
} from '@/lib/validations/moderation.validation';

type AdminBulkUpdateReportsInput = z.infer<typeof adminBulkUpdateReportsSchema>;
type AdminReportsFilterInput = z.infer<typeof adminReportsFilterSchema>;
type AdminUpdateReportInput = z.infer<typeof adminUpdateReportSchema>;
type CreateContentReportInput = z.infer<typeof createContentReportSchema>;

import { OPERATIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import {
  ContentReportsQuery,
  type ReportsStatsResult,
} from '@/lib/queries/content-reports/content-reports.query';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';

const facadeName = 'CONTENT_REPORTS_FACADE';

export interface RateLimitStatus {
  dailyLimit: number;
  isAllowed: boolean;
  nextAllowedTime?: Date;
  reportsToday: number;
}

export class ContentReportsFacade extends BaseFacade {
  private static readonly DAILY_REPORT_LIMIT = 10;

  /**
   * Bulk update multiple reports status (admin only).
   *
   * @param bulkUpdateData - The bulk update data containing report IDs, status, and optional notes
   * @param userId - The admin user ID performing the update
   * @param dbInstance - Optional database executor for transaction support
   * @returns Array of updated content reports
   */
  static async bulkUpdateReportsStatusAsync(
    bulkUpdateData: AdminBulkUpdateReportsInput,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<SelectContentReport>> {
    return executeFacadeOperation(
      {
        data: { reportCount: bulkUpdateData.reportIds.length, status: bulkUpdateData.status },
        facade: facadeName,
        method: 'bulkUpdateReportsStatusAsync',
        operation: OPERATIONS.ADMIN.BULK_UPDATE_REPORTS,
        userId,
      },
      async () => {
        const context = this.getProtectedContext(userId, dbInstance);

        return ContentReportsQuery.bulkUpdateReportsStatusAsync(
          bulkUpdateData.reportIds,
          bulkUpdateData.status,
          userId,
          context,
          bulkUpdateData.moderatorNotes,
        );
      },
    );
  }

  /**
   * Check if the user can create new reports (rate-limiting).
   * Uses actual database query to count reports from last 24 hours.
   *
   * @param userId - The user ID to check rate limit for
   * @param dbInstance - Optional database executor for transaction support
   * @returns Rate limit status including whether user can report and counts
   */
  static async checkRateLimitAsync(
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<RateLimitStatus> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'checkRateLimitAsync',
        operation: OPERATIONS.MODERATION.CHECK_RATE_LIMIT,
        userId,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance);

        // Get reports from last 24 hours using the query layer
        const recentReports = await ContentReportsQuery.getRecentReportsByUserAsync(userId, 24, context);
        const reportsToday = recentReports.length;

        if (reportsToday >= this.DAILY_REPORT_LIMIT) {
          // Calculate next allowed time based on oldest report in window
          const oldestReport = recentReports[recentReports.length - 1];
          const oldestReportTime = oldestReport?.createdAt ?? new Date();
          const nextAllowedTime = new Date(oldestReportTime.getTime() + 24 * 60 * 60 * 1000);

          return {
            dailyLimit: this.DAILY_REPORT_LIMIT,
            isAllowed: false,
            nextAllowedTime,
            reportsToday,
          };
        }

        return {
          dailyLimit: this.DAILY_REPORT_LIMIT,
          isAllowed: true,
          reportsToday,
        };
      },
      {
        includeResultSummary: (result) => ({
          isAllowed: result.isAllowed,
          reportsToday: result.reportsToday,
        }),
      },
    );
  }

  /**
   * Create a new content report with validation.
   *
   * @param reportData - The report data including target and reason
   * @param userId - The reporting user's ID
   * @param dbInstance - Optional database executor for transaction support
   * @returns The created content report
   * @throws Error if target doesn't exist, user owns target, or already reported
   */
  static async createReportAsync(
    reportData: CreateContentReportInput,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<SelectContentReport> {
    return executeFacadeOperation(
      {
        data: { targetId: reportData.targetId, targetType: reportData.targetType },
        facade: facadeName,
        method: 'createReportAsync',
        operation: OPERATIONS.MODERATION.CREATE_REPORT,
        userId,
      },
      async () => {
        const context = this.getProtectedContext(userId, dbInstance);

        // validate target exists and gets owner info
        const targetInfo = await ContentReportsQuery.validateTargetAsync(
          reportData.targetId,
          reportData.targetType,
          context,
        );

        if (!targetInfo.isExists) {
          throw new Error('Target content does not exist');
        }

        if (targetInfo.ownerId === userId) {
          throw new Error('Cannot report your own content');
        }

        // check for an existing report
        const existingReport = await ContentReportsQuery.checkExistingReportAsync(
          userId,
          reportData.targetId,
          reportData.targetType,
          context,
        );

        if (existingReport) {
          throw new Error('You have already reported this content');
        }

        // create the report
        const report = await ContentReportsQuery.createContentReportAsync(
          {
            ...reportData,
            reporterId: userId,
          },
          context,
        );

        if (!report) {
          throw new Error('Failed to create content report');
        }

        return report;
      },
      {
        includeResultSummary: (result) => ({
          reportId: result.id,
          targetType: result.targetType,
        }),
      },
    );
  }

  /**
   * Get all reports for the admin dashboard with filtering and pagination.
   *
   * @param filterOptions - Filter options for status, type, date range, and pagination
   * @param userId - The admin user ID requesting reports
   * @param dbInstance - Optional database executor for transaction support
   * @returns Object containing reports array and statistics
   */
  static async getAllReportsForAdminAsync(
    filterOptions: AdminReportsFilterInput,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<{ reports: Array<SelectContentReport>; stats: ReportsStatsResult }> {
    return executeFacadeOperation(
      {
        data: { filterOptions },
        facade: facadeName,
        method: 'getAllReportsForAdminAsync',
        operation: OPERATIONS.ADMIN.GET_ADMIN_REPORTS,
        userId,
      },
      async () => {
        const context = this.getProtectedContext(userId, dbInstance);

        const [reports, stats] = await Promise.all([
          ContentReportsQuery.getAllReportsForAdminAsync(filterOptions, context),
          ContentReportsQuery.getReportsStatsAsync(context),
        ]);

        return { reports, stats };
      },
      {
        includeResultSummary: (result) => ({
          reportsCount: result.reports.length,
          totalPending: result.stats.pending,
        }),
      },
    );
  }

  /**
   * Get all reports for the admin dashboard with filtering, pagination, and slug data for routing.
   *
   * @param filterOptions - Filter options for status, type, date range, and pagination
   * @param userId - The admin user ID requesting reports
   * @param dbInstance - Optional database executor for transaction support
   * @returns Object containing reports with slugs array and statistics
   */
  static async getAllReportsWithSlugsForAdminAsync(
    filterOptions: AdminReportsFilterInput,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<{ reports: Array<SelectContentReportWithSlugs>; stats: ReportsStatsResult }> {
    return executeFacadeOperation(
      {
        data: { filterOptions },
        facade: facadeName,
        method: 'getAllReportsWithSlugsForAdminAsync',
        operation: OPERATIONS.ADMIN.GET_ADMIN_REPORTS,
        userId,
      },
      async () => {
        const context = this.getProtectedContext(userId, dbInstance);

        const [reports, stats] = await Promise.all([
          ContentReportsQuery.getAllReportsWithSlugsForAdminAsync(filterOptions, context),
          ContentReportsQuery.getReportsStatsAsync(context),
        ]);

        return { reports, stats };
      },
      {
        includeResultSummary: (result) => ({
          reportsCount: result.reports.length,
          totalPending: result.stats.pending,
        }),
      },
    );
  }

  /**
   * Get reports statistics for the admin dashboard.
   *
   * @param userId - The admin user ID requesting stats
   * @param dbInstance - Optional database executor for transaction support
   * @returns Statistics object with counts by status
   */
  static async getReportsStatsAsync(
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<ReportsStatsResult> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getReportsStatsAsync',
        operation: OPERATIONS.ADMIN.GET_REPORTS_STATS,
        userId,
      },
      async () => {
        const context = this.getProtectedContext(userId, dbInstance);
        return ContentReportsQuery.getReportsStatsAsync(context);
      },
      {
        includeResultSummary: (result) => ({
          dismissed: result.dismissed,
          pending: result.pending,
          resolved: result.resolved,
          total: result.total,
        }),
      },
    );
  }

  /**
   * Check if the user has already reported content.
   *
   * @param userId - The user ID to check
   * @param targetId - The target content ID
   * @param targetType - The type of content (bobblehead, collection, comment)
   * @param dbInstance - Optional database executor for transaction support
   * @returns Object with hasReported flag and report if exists, null otherwise
   */
  static async getReportStatusAsync(
    userId: string,
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'comment',
    dbInstance: DatabaseExecutor = db,
  ): Promise<{ hasReported: boolean; report: null | SelectContentReport }> {
    return executeFacadeOperation(
      {
        data: { targetId, targetType },
        facade: facadeName,
        method: 'getReportStatusAsync',
        operation: OPERATIONS.MODERATION.GET_REPORT_STATUS,
        userId,
      },
      async () => {
        const context = this.getProtectedContext(userId, dbInstance);
        return ContentReportsQuery.getReportStatusAsync(userId, targetId, targetType, context);
      },
      {
        includeResultSummary: (result) => ({
          hasReported: result.hasReported,
        }),
      },
    );
  }

  /**
   * Update individual report status (admin only).
   *
   * @param updateData - The update data containing report ID, status, and optional notes
   * @param userId - The admin user ID performing the update
   * @param dbInstance - Optional database executor for transaction support
   * @returns The updated content report
   */
  static async updateReportStatusAsync(
    updateData: AdminUpdateReportInput,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<SelectContentReport> {
    return executeFacadeOperation(
      {
        data: { reportId: updateData.reportId, status: updateData.status },
        facade: facadeName,
        method: 'updateReportStatusAsync',
        operation: OPERATIONS.ADMIN.UPDATE_REPORT_STATUS,
        userId,
      },
      async () => {
        const context = this.getProtectedContext(userId, dbInstance);

        const report = await ContentReportsQuery.updateReportStatusAsync(
          updateData.reportId,
          updateData.status,
          userId,
          updateData.moderatorNotes,
          context,
        );

        if (!report) {
          throw new Error('Failed to update content report');
        }

        return report;
      },
      {
        includeResultSummary: (result) => ({
          reportId: result.id,
          status: result.status,
        }),
      },
    );
  }

  /**
   * Validate that target exists and can be reported.
   *
   * @param targetId - The target content ID to validate
   * @param targetType - The type of content (bobblehead, collection, comment)
   * @param userId - The user ID attempting to report
   * @param dbInstance - Optional database executor for transaction support
   * @returns Object with canReport flag and reason if not allowed
   */
  static async validateReportTargetAsync(
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'comment',
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<{ canReport: boolean; reason?: string }> {
    return executeFacadeOperation(
      {
        data: { targetId, targetType },
        facade: facadeName,
        method: 'validateReportTargetAsync',
        operation: OPERATIONS.MODERATION.VALIDATE_REPORT_TARGET,
        userId,
      },
      async () => {
        const context = this.getProtectedContext(userId, dbInstance);
        const targetInfo = await ContentReportsQuery.validateTargetAsync(targetId, targetType, context);

        if (!targetInfo.isExists) {
          return { canReport: false, reason: 'Target content does not exist' };
        }

        if (targetInfo.ownerId === userId) {
          return { canReport: false, reason: 'Cannot report your own content' };
        }

        // Check for an existing report
        const existingReport = await ContentReportsQuery.checkExistingReportAsync(
          userId,
          targetId,
          targetType,
          context,
        );

        if (existingReport) {
          return { canReport: false, reason: 'You have already reported this content' };
        }

        return { canReport: true };
      },
      {
        includeResultSummary: (result) => ({
          canReport: result.canReport,
        }),
      },
    );
  }
}
