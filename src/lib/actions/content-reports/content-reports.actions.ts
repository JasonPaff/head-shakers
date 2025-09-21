'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { and, eq } from 'drizzle-orm';

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
import { bobbleheads, collections, contentReports, subCollections } from '@/lib/db/schema';
import { createRateLimitMiddleware } from '@/lib/middleware/rate-limit.middleware';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient } from '@/lib/utils/next-safe-action';
import { checkReportStatusSchema, createContentReportSchema } from '@/lib/validations/moderation.validation';

// apply hourly rate limiting (3 reports per hour)
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
  .action(async ({ ctx, parsedInput }) => {
    const reportData = createContentReportSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.CONTENT_REPORT, {
      input: parsedInput,
      reason: reportData.reason,
      targetId: reportData.targetId,
      targetType: reportData.targetType,
      userId: ctx.userId,
    });

    try {
      // check for duplicate reports
      const existingReport = await dbInstance.query.contentReports.findFirst({
        where: and(
          eq(contentReports.reporterId, ctx.userId),
          eq(contentReports.targetId, reportData.targetId),
          eq(contentReports.targetType, reportData.targetType),
          eq(contentReports.status, 'pending'),
        ),
      });

      if (existingReport) {
        throw new ActionError(
          ErrorType.BUSINESS_RULE,
          ERROR_CODES.CONTENT_REPORTS.DUPLICATE_REPORT,
          ERROR_MESSAGES.CONTENT_REPORTS.DUPLICATE_REPORT,
          { ctx, operation: OPERATIONS.MODERATION.CHECK_EXISTING_REPORT },
          true,
          409,
        );
      }

      // validate target exists and check for self-reporting
      let targetOwnerId: null | string = null;

      switch (reportData.targetType) {
        case 'bobblehead': {
          const bobblehead = await dbInstance.query.bobbleheads.findFirst({
            columns: {
              id: true,
              userId: true,
            },
            where: eq(bobbleheads.id, reportData.targetId),
          });

          if (!bobblehead) {
            throw new ActionError(
              ErrorType.NOT_FOUND,
              ERROR_CODES.CONTENT_REPORTS.TARGET_NOT_FOUND,
              ERROR_MESSAGES.CONTENT_REPORTS.TARGET_NOT_FOUND,
              { ctx, operation: OPERATIONS.MODERATION.VALIDATE_REPORT_TARGET },
              true,
              404,
            );
          }

          targetOwnerId = bobblehead.userId;
          break;
        }

        case 'collection': {
          const collection = await dbInstance.query.collections.findFirst({
            columns: {
              id: true,
              userId: true,
            },
            where: eq(collections.id, reportData.targetId),
          });

          if (!collection) {
            throw new ActionError(
              ErrorType.NOT_FOUND,
              ERROR_CODES.CONTENT_REPORTS.TARGET_NOT_FOUND,
              ERROR_MESSAGES.CONTENT_REPORTS.TARGET_NOT_FOUND,
              { ctx, operation: OPERATIONS.MODERATION.VALIDATE_REPORT_TARGET },
              true,
              404,
            );
          }

          targetOwnerId = collection.userId;
          break;
        }

        case 'subcollection': {
          const subcollection = await dbInstance.query.subCollections.findFirst({
            columns: {
              id: true,
            },
            where: eq(subCollections.id, reportData.targetId),
            with: {
              collection: {
                columns: {
                  userId: true,
                },
              },
            },
          });

          if (!subcollection || !subcollection.collection) {
            throw new ActionError(
              ErrorType.NOT_FOUND,
              ERROR_CODES.CONTENT_REPORTS.TARGET_NOT_FOUND,
              ERROR_MESSAGES.CONTENT_REPORTS.TARGET_NOT_FOUND,
              { ctx, operation: OPERATIONS.MODERATION.VALIDATE_REPORT_TARGET },
              true,
              404,
            );
          }

          targetOwnerId = subcollection.collection.userId;
          break;
        }

        default:
          throw new ActionError(
            ErrorType.VALIDATION,
            ERROR_CODES.CONTENT_REPORTS.INVALID_TARGET,
            ERROR_MESSAGES.CONTENT_REPORTS.INVALID_TARGET,
            { ctx, operation: OPERATIONS.MODERATION.VALIDATE_REPORT_TARGET },
            true,
            400,
          );
      }

      // check for self-reporting
      if (targetOwnerId === ctx.userId) {
        throw new ActionError(
          ErrorType.BUSINESS_RULE,
          ERROR_CODES.CONTENT_REPORTS.SELF_REPORT,
          ERROR_MESSAGES.CONTENT_REPORTS.SELF_REPORT,
          { ctx, operation: OPERATIONS.MODERATION.VALIDATE_REPORT_TARGET },
          true,
          400,
        );
      }

      // create the report
      const [newReport] = await dbInstance
        .insert(contentReports)
        .values({
          description: reportData.description,
          reason: reportData.reason,
          reporterId: ctx.userId,
          status: 'pending',
          targetId: reportData.targetId,
          targetType: reportData.targetType,
        })
        .returning();

      if (!newReport) {
        throw new ActionError(
          ErrorType.DATABASE,
          ERROR_CODES.CONTENT_REPORTS.CREATE_FAILED,
          ERROR_MESSAGES.CONTENT_REPORTS.CREATE_FAILED,
          { ctx, operation: OPERATIONS.MODERATION.CREATE_REPORT },
          false,
          500,
        );
      }

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
      handleActionError(error, {
        input: parsedInput,
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

// check if the user has already reported content
export const checkReportStatusAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.MODERATION.CHECK_REPORT_STATUS,
    isTransactionRequired: false,
  })
  .inputSchema(checkReportStatusSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { targetId, targetType } = checkReportStatusSchema.parse(ctx.sanitizedInput);

    try {
      const existingReport = await ctx.db.query.contentReports.findFirst({
        columns: {
          createdAt: true,
          id: true,
          status: true,
        },
        where: and(
          eq(contentReports.reporterId, ctx.userId),
          eq(contentReports.targetId, targetId),
          eq(contentReports.targetType, targetType),
        ),
      });

      return {
        data: {
          hasReported: !!existingReport,
          report: existingReport,
        },
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.MODERATION.CHECK_REPORT_STATUS,
        },
        operation: OPERATIONS.MODERATION.GET_REPORT_STATUS,
      });
    }
  });
