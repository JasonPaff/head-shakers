import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { InsertContentReport, SelectContentReport } from '@/lib/validations/moderation.validation';

import { ENUMS, OPERATIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { createProtectedQueryContext, createUserQueryContext } from '@/lib/queries/base/query-context';
import { BobbleheadsQuery } from '@/lib/queries/bobbleheads/bobbleheads-query';
import { CollectionsQuery } from '@/lib/queries/collections/collections.query';
// import { SubcollectionsQuery } from '@/lib/queries/collections/subcollections.query';
import { createFacadeError } from '@/lib/utils/error-builders';

const facadeName = 'ContentReportsFacade';

export interface RateLimitStatus {
  dailyLimit: number;
  isAllowed: boolean;
  nextAllowedTime?: Date;
  reportsToday: number;
}

export interface ReportCreationResult {
  report: SelectContentReport;
  wasCreated: boolean;
}

export interface ReportExistenceResult {
  existingReportId?: string;
  isAlreadyReported: boolean;
}

export interface ReportValidationResult {
  canReport: boolean;
  isTargetExists: boolean;
  isValid: boolean;
  reason?: string;
}

export class ContentReportsFacade {
  // rate limiting constants
  private static readonly DAILY_REPORT_LIMIT = 10;

  /**
   * check if the user has already reported this target
   */
  static checkExistingReport(
    targetId: string,
    targetType: string,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<ReportExistenceResult> {
    try {
      createUserQueryContext(userId, { dbInstance });

      // this will be implemented when we create the queries
      // for now, return default values
      return Promise.resolve({
        isAlreadyReported: false,
      });
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { targetId, targetType },
        facade: facadeName,
        method: 'checkExistingReport',
        operation: OPERATIONS.MODERATION.CHECK_EXISTING_REPORT,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * check if the user can create new reports (rate-limiting)
   */
  static checkRateLimit(userId: string, dbInstance?: DatabaseExecutor): Promise<RateLimitStatus> {
    try {
      createUserQueryContext(userId, { dbInstance });

      // get reports from last 24 hours
      const today = new Date();

      // this will be implemented when we create the queries
      // for now, return allowing reports
      const reportsToday = 0;

      if (reportsToday >= this.DAILY_REPORT_LIMIT) {
        return Promise.resolve({
          dailyLimit: this.DAILY_REPORT_LIMIT,
          isAllowed: false,
          nextAllowedTime: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          reportsToday,
        });
      }

      return Promise.resolve({
        dailyLimit: this.DAILY_REPORT_LIMIT,
        isAllowed: true,
        reportsToday,
      });
    } catch (error) {
      const context: FacadeErrorContext = {
        facade: facadeName,
        method: 'checkRateLimit',
        operation: OPERATIONS.MODERATION.CHECK_RATE_LIMIT,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * create a new content report with comprehensive validation
   */
  static async createReport(
    data: InsertContentReport,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<ReportCreationResult> {
    try {
      return await (dbInstance ?? db).transaction(async (tx) => {
        createProtectedQueryContext(userId, { dbInstance: tx });

        // validate rate limiting
        const rateLimitStatus = await this.checkRateLimit(userId, tx);
        if (!rateLimitStatus.isAllowed) {
          throw new Error(
            `Daily report limit exceeded. You can create ${rateLimitStatus.dailyLimit} reports per day.`,
          );
        }

        // validate target exists and can be reported
        const validation = await this.validateReportTarget(data.targetId, data.targetType, userId, tx);

        if (!validation.isValid) {
          throw new Error(validation.reason || 'Invalid report target');
        }

        // check for an existing report
        const existingReport = await this.checkExistingReport(data.targetId, data.targetType, userId, tx);

        if (existingReport.isAlreadyReported) {
          throw new Error('You have already reported this content');
        }

        // create the report - this will be implemented when we create the queries
        // for now, throw an error indicating the query layer is needed
        throw new Error('ContentReportsQuery not yet implemented');
      });
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { reason: data.reason, targetId: data.targetId, targetType: data.targetType },
        facade: facadeName,
        method: 'createReport',
        operation: OPERATIONS.MODERATION.CREATE_REPORT,
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
          const collection = await CollectionsQuery.findByIdAsync(targetId, context);
          isTargetExists = !!collection;

          // prevent self-reporting
          if (collection?.userId === userId) {
            canReport = false;
            reason = 'Cannot report your own content';
          }
          break;
        }
        case 'comment':
        case 'user':
          // these will be implemented in future phases
          isTargetExists = false;
          canReport = false;
          reason = 'Target type not yet supported';
          break;
        case 'subcollection': {
          // TODO: Implement subcollection validation when findByIdAsync method is available
          // const subcollection = await SubcollectionsQuery.findByIdAsync(targetId, context);
          // isTargetExists = !!subcollection;
          // if (subcollection?.userId === userId) {
          //   canReport = false;
          //   reason = 'Cannot report your own content';
          // }
          isTargetExists = true; // temporarily allow for implementation
          break;
        }
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
}
