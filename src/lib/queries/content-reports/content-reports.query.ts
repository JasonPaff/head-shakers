import { and, desc, eq, gte } from 'drizzle-orm';

import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';
import type { InsertContentReport, SelectContentReport } from '@/lib/validations/moderation.validation';

import { bobbleheads, collections, contentReports, subCollections } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export type ContentReportRecord = typeof contentReports.$inferSelect;

export type ContentReportTargetInfo = {
  isExists: boolean;
  ownerId: null | string;
};

export class ContentReportsQuery extends BaseQuery {
  /**
   * Check if a user has already reported a specific target
   */
  static async checkExistingReportAsync(
    userId: string,
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'subcollection',
    context: QueryContext,
  ): Promise<null | SelectContentReport> {
    const dbInstance = this.getDbInstance(context);

    const existingReport = await dbInstance.query.contentReports.findFirst({
      where: and(
        eq(contentReports.reporterId, userId),
        eq(contentReports.targetId, targetId),
        eq(contentReports.targetType, targetType),
      ),
    });

    return existingReport ?? null;
  }

  /**
   * Count total reports for a target
   */
  static async countReportsForTargetAsync(
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'subcollection',
    context: QueryContext,
  ): Promise<number> {
    const reports = await this.getReportsByTargetAsync(targetId, targetType, {}, context);
    return reports.length;
  }

  /**
   * Create a new content report
   */
  static async createContentReportAsync(
    report: InsertContentReport,
    context: QueryContext,
  ): Promise<SelectContentReport> {
    return this.executeWithRetry(async () => {
      const dbInstance = this.getDbInstance(context);
      const [newReport] = await dbInstance
        .insert(contentReports)
        .values({
          ...report,
          status: 'pending',
        })
        .returning();

      if (!newReport) {
        throw new Error('Failed to create content report');
      }

      return newReport;
    }, 'createContentReport');
  }

  /**
   * Get recent reports by a specific user (for rate limiting checks)
   */
  static async getRecentReportsByUserAsync(
    userId: string,
    hoursAgo: number = 24,
    context: QueryContext,
  ): Promise<SelectContentReport[]> {
    const dbInstance = this.getDbInstance(context);
    const timeThreshold = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    return dbInstance.query.contentReports.findMany({
      orderBy: [desc(contentReports.createdAt)],
      where: and(eq(contentReports.reporterId, userId), gte(contentReports.createdAt, timeThreshold)),
    });
  }

  /**
   * Get all reports for a specific target
   */
  static async getReportsByTargetAsync(
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'subcollection',
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<SelectContentReport[]> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    let query = dbInstance
      .select()
      .from(contentReports)
      .where(and(eq(contentReports.targetId, targetId), eq(contentReports.targetType, targetType)))
      .orderBy(desc(contentReports.createdAt))
      .$dynamic();

    if (pagination.limit) {
      query = query.limit(pagination.limit);
    }

    if (pagination.offset) {
      query = query.offset(pagination.offset);
    }

    return query;
  }

  /**
   * Get report status for a specific target and user
   */
  static async getReportStatusAsync(
    userId: string,
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'subcollection',
    context: QueryContext,
  ): Promise<{ hasReported: boolean; report: null | SelectContentReport }> {
    const report = await this.checkExistingReportAsync(userId, targetId, targetType, context);

    return {
      hasReported: !!report,
      report,
    };
  }

  /**
   * Update the report status (for admin use later)
   */
  static async updateReportStatusAsync(
    reportId: string,
    status: 'dismissed' | 'pending' | 'resolved' | 'reviewed',
    moderatorId: string | undefined,
    moderatorNotes: string | undefined,
    context: QueryContext,
  ): Promise<SelectContentReport> {
    return this.executeWithRetry(async () => {
      const dbInstance = this.getDbInstance(context);
      const [updatedReport] = await dbInstance
        .update(contentReports)
        .set({
          moderatorId,
          moderatorNotes,
          resolvedAt: status === 'resolved' || status === 'dismissed' ? new Date() : null,
          status,
          updatedAt: new Date(),
        })
        .where(eq(contentReports.id, reportId))
        .returning();

      if (!updatedReport) {
        throw new Error('Failed to update content report');
      }

      return updatedReport;
    }, 'updateReportStatus');
  }

  /**
   * Validate target exists and fetches the owner info
   */
  static async validateTargetAsync(
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'subcollection',
    context: QueryContext,
  ): Promise<ContentReportTargetInfo> {
    const dbInstance = this.getDbInstance(context);

    switch (targetType) {
      case 'bobblehead': {
        const bobblehead = await dbInstance.query.bobbleheads.findFirst({
          columns: {
            id: true,
            userId: true,
          },
          where: eq(bobbleheads.id, targetId),
        });

        return {
          isExists: !!bobblehead,
          ownerId: bobblehead?.userId || null,
        };
      }

      case 'collection': {
        const collection = await dbInstance.query.collections.findFirst({
          columns: {
            id: true,
            userId: true,
          },
          where: eq(collections.id, targetId),
        });

        return {
          isExists: !!collection,
          ownerId: collection?.userId || null,
        };
      }

      case 'subcollection': {
        const subcollection = await dbInstance.query.subCollections.findFirst({
          columns: {
            id: true,
          },
          where: eq(subCollections.id, targetId),
          with: {
            collection: {
              columns: {
                userId: true,
              },
            },
          },
        });

        return {
          isExists: !!(subcollection && subcollection.collection),
          ownerId: subcollection?.collection?.userId || null,
        };
      }

      default:
        return { isExists: false, ownerId: null };
    }
  }
}
