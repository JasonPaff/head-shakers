import type { z } from 'zod';

import type { FacadeErrorContext } from '@/lib/utils/error-types';
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

import { ENUMS, OPERATIONS } from '@/lib/constants';
import { createProtectedQueryContext, createUserQueryContext } from '@/lib/queries/base/query-context';
import { BobbleheadsQuery } from '@/lib/queries/bobbleheads/bobbleheads-query';
import { CollectionsQuery } from '@/lib/queries/collections/collections.query';
import {
  ContentReportsQuery,
  type ReportsStatsResult,
} from '@/lib/queries/content-reports/content-reports.query';
import { SocialQuery } from '@/lib/queries/social/social.query';
import { createFacadeError } from '@/lib/utils/error-builders';

const facadeName = 'ContentReportsFacade';

export interface RateLimitStatus {
  dailyLimit: number;
  isAllowed: boolean;
  nextAllowedTime?: Date;
  reportsToday: number;
}

export interface ReportValidationResult {
  canReport: boolean;
  isTargetExists: boolean;
  isValid: boolean;
  reason?: string;
}

export class ContentReportsFacade {
  private static readonly DAILY_REPORT_LIMIT = 10;

  /**
   * Bulk update multiple reports status (admin only)
   */
  static async bulkUpdateReportsStatusAsync(
    bulkUpdateData: AdminBulkUpdateReportsInput,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<SelectContentReport>> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });

      return await ContentReportsQuery.bulkUpdateReportsStatusAsync(
        bulkUpdateData.reportIds,
        bulkUpdateData.status,
        userId,
        context,
        bulkUpdateData.moderatorNotes,
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { reportCount: bulkUpdateData.reportIds.length, status: bulkUpdateData.status },
        facade: facadeName,
        method: 'bulkUpdateReportsStatusAsync',
        operation: OPERATIONS.ADMIN.BULK_UPDATE_REPORTS,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Check if the user can create new reports (rate-limiting)
   * Uses actual database query to count reports from last 24 hours
   */
  static async checkRateLimitAsync(userId: string, dbInstance?: DatabaseExecutor): Promise<RateLimitStatus> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

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
    } catch (error) {
      const context: FacadeErrorContext = {
        facade: facadeName,
        method: 'checkRateLimitAsync',
        operation: OPERATIONS.MODERATION.CHECK_RATE_LIMIT,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * check rate limiting for user reports
   */
  static async checkReportRateLimitAsync(
    userId: string,
    hoursWindow: number = 1,
    maxReports: number = 3,
    dbInstance?: DatabaseExecutor,
  ): Promise<{ canReport: boolean; recentReportCount: number }> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      const recentReports = await ContentReportsQuery.getRecentReportsByUserAsync(
        userId,
        hoursWindow,
        context,
      );

      return {
        canReport: recentReports.length < maxReports,
        recentReportCount: recentReports.length,
      };
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { hoursWindow, maxReports },
        facade: facadeName,
        method: 'checkReportRateLimitAsync',
        operation: OPERATIONS.MODERATION.CHECK_RATE_LIMIT,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Create a new content report with validation
   */
  static async createReportAsync(
    reportData: CreateContentReportInput,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<SelectContentReport> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });

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
      return ContentReportsQuery.createContentReportAsync(
        {
          ...reportData,
          reporterId: userId,
        },
        context,
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { targetId: reportData.targetId, targetType: reportData.targetType },
        facade: facadeName,
        method: 'createReportAsync',
        operation: OPERATIONS.MODERATION.CREATE_REPORT,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get all reports for the admin dashboard with filtering and pagination
   */
  static async getAllReportsForAdminAsync(
    filterOptions: AdminReportsFilterInput,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<{ reports: Array<SelectContentReport>; stats: ReportsStatsResult }> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });

      const reports = await ContentReportsQuery.getAllReportsForAdminAsync(filterOptions, context);
      const stats = await ContentReportsQuery.getReportsStatsAsync(context);

      return { reports, stats };
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { filterOptions },
        facade: facadeName,
        method: 'getAllReportsForAdminAsync',
        operation: OPERATIONS.ADMIN.GET_ADMIN_REPORTS,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get all reports for the admin dashboard with filtering, pagination, and slug data for routing
   */
  static async getAllReportsWithSlugsForAdminAsync(
    filterOptions: AdminReportsFilterInput,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<{ reports: Array<SelectContentReportWithSlugs>; stats: ReportsStatsResult }> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });

      const reports = await ContentReportsQuery.getAllReportsWithSlugsForAdminAsync(filterOptions, context);
      const stats = await ContentReportsQuery.getReportsStatsAsync(context);

      return { reports, stats };
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { filterOptions },
        facade: facadeName,
        method: 'getAllReportsWithSlugsForAdminAsync',
        operation: OPERATIONS.ADMIN.GET_ADMIN_REPORTS,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get reports statistics for the admin dashboard
   */
  static async getReportsStatsAsync(
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<ReportsStatsResult> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });
      return await ContentReportsQuery.getReportsStatsAsync(context);
    } catch (error) {
      const context: FacadeErrorContext = {
        facade: facadeName,
        method: 'getReportsStatsAsync',
        operation: OPERATIONS.ADMIN.GET_REPORTS_STATS,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * get report status for a target (for UI display)
   */
  static getReportStatus(
    targetId: string,
    targetType: string,
    userId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<{ hasUserReported: boolean; reportCount: number }> {
    try {
      if (userId) {
        createUserQueryContext(userId, { dbInstance });
      } else {
        createUserQueryContext('anonymous', { dbInstance });
      }

      // this will be implemented when we create the queries
      return Promise.resolve({
        hasUserReported: false,
        reportCount: 0,
      });
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { targetId, targetType },
        facade: facadeName,
        method: 'getReportStatus',
        operation: OPERATIONS.MODERATION.GET_REPORT_STATUS,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * check if the user has already reported content
   */
  static async getReportStatusAsync(
    userId: string,
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'comment',
    dbInstance?: DatabaseExecutor,
  ): Promise<{ hasReported: boolean; report: null | SelectContentReport }> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });
      return ContentReportsQuery.getReportStatusAsync(userId, targetId, targetType, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { targetId, targetType },
        facade: facadeName,
        method: 'getReportStatusAsync',
        operation: OPERATIONS.MODERATION.GET_REPORT_STATUS,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Update individual report status (admin only)
   */
  static async updateReportStatusAsync(
    updateData: AdminUpdateReportInput,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<SelectContentReport> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });

      return await ContentReportsQuery.updateReportStatusAsync(
        updateData.reportId,
        updateData.status,
        userId,
        updateData.moderatorNotes,
        context,
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { reportId: updateData.reportId, status: updateData.status },
        facade: facadeName,
        method: 'updateReportStatusAsync',
        operation: OPERATIONS.ADMIN.UPDATE_REPORT_STATUS,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * validate that the target exists and can be reported
   */
  static async validateReportTarget(
    targetId: string,
    targetType: string,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<ReportValidationResult> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      // validate target type
      const validTargetTypes = ENUMS.CONTENT_REPORT.TARGET_TYPE;
      if (!validTargetTypes.includes(targetType as (typeof validTargetTypes)[number])) {
        return {
          canReport: false,
          isTargetExists: false,
          isValid: false,
          reason: 'Invalid target type',
        };
      }

      // check if the target exists based on type
      let isTargetExists = false;
      let canReport = true;
      let reason: string | undefined;

      switch (targetType) {
        case 'bobblehead': {
          const bobblehead = await BobbleheadsQuery.findByIdAsync(targetId, context);
          isTargetExists = !!bobblehead;

          // prevent self-reporting
          if (bobblehead?.userId === userId) {
            canReport = false;
            reason = 'Cannot report your own content';
          }
          break;
        }
        case 'collection': {
          const collection = await CollectionsQuery.getByIdAsync(targetId, context);
          isTargetExists = !!collection;

          // prevent self-reporting
          if (collection?.userId === userId) {
            canReport = false;
            reason = 'Cannot report your own content';
          }
          break;
        }
        case 'comment': {
          const comment = await SocialQuery.getCommentByIdAsync(targetId, context);
          isTargetExists = !!comment;

          // prevent self-reporting
          if (comment?.userId === userId) {
            canReport = false;
            reason = 'Cannot report your own content';
          }
          break;
        }
        case 'user':
          // these will be implemented in future phases
          isTargetExists = false;
          canReport = false;
          reason = 'Target type not yet supported';
          break;
        default:
          isTargetExists = false;
          canReport = false;
          reason = 'Unknown target type';
      }

      return {
        canReport,
        isTargetExists,
        isValid: isTargetExists && canReport,
        reason,
      };
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { targetId, targetType },
        facade: facadeName,
        method: 'validateReportTarget',
        operation: OPERATIONS.MODERATION.VALIDATE_REPORT_TARGET,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Validate that target exists and can be reported
   */
  static async validateReportTargetAsync(
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'comment',
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<{ canReport: boolean; reason?: string }> {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });
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
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { targetId, targetType },
        facade: facadeName,
        method: 'validateReportTargetAsync',
        operation: OPERATIONS.MODERATION.VALIDATE_REPORT_TARGET,
      };
      throw createFacadeError(context, error);
    }
  }
}
