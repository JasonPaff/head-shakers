import { and, count, desc, eq, gte, inArray, lte, sql, type SQL } from 'drizzle-orm';

import type { ContentReportReason, ContentReportStatus } from '@/lib/constants/enums';
import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';
import type {
  InsertContentReport,
  SelectContentReport,
  SelectContentReportWithSlugs,
} from '@/lib/validations/moderation.validation';

import { bobbleheads, collections, comments, contentReports, users } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export type AdminReportsFilterOptions = FindOptions & {
  dateFrom?: Date;
  dateTo?: Date;
  moderatorId?: string;
  reason?: Array<ContentReportReason> | ContentReportReason;
  reporterId?: string;
  status?: Array<ContentReportStatus> | ContentReportStatus;
  targetType?: 'bobblehead' | 'collection' | 'comment' | Array<'bobblehead' | 'collection' | 'comment'>;
};

export type ContentReportRecord = typeof contentReports.$inferSelect;

export type ContentReportTargetInfo = {
  isExists: boolean;
  ownerId: null | string;
};

export type ReportsStatsResult = {
  dismissed: number;
  pending: number;
  resolved: number;
  reviewed: number;
  total: number;
};

export class ContentReportsQuery extends BaseQuery {
  /**
   * Bulk update report statuses for admin operations
   * @param reportIds - Array of report IDs to update (max 100)
   * @param status - New status to set for all reports
   * @param moderatorId - ID of the moderator performing the action
   * @param context - Query context for database access
   * @param moderatorNotes - Optional notes from the moderator
   * @returns Promise<SelectContentReport[]> - Updated reports
   */
  static async bulkUpdateReportsStatusAsync(
    reportIds: Array<string>,
    status: ContentReportStatus,
    moderatorId: string,
    context: QueryContext,
    moderatorNotes?: string,
  ): Promise<Array<SelectContentReport>> {
    if (reportIds.length === 0) {
      return [];
    }

    if (reportIds.length > 100) {
      throw new Error('Cannot update more than 100 reports at once');
    }

    return this.executeWithRetry(async () => {
      const dbInstance = this.getDbInstance(context);

      const updateData: {
        moderatorId: string;
        moderatorNotes?: string;
        resolvedAt?: Date | null;
        status: ContentReportStatus;
        updatedAt: Date;
      } = {
        moderatorId,
        status,
        updatedAt: new Date(),
      };

      if (moderatorNotes) {
        updateData.moderatorNotes = moderatorNotes;
      }

      if (status === 'resolved' || status === 'dismissed') {
        updateData.resolvedAt = new Date();
      } else {
        updateData.resolvedAt = null;
      }

      const updatedReports = await dbInstance
        .update(contentReports)
        .set(updateData)
        .where(inArray(contentReports.id, reportIds))
        .returning();

      return updatedReports;
    }, 'bulkUpdateReportsStatus');
  }

  /**
   * Check if a user has already reported a specific target
   */
  static async checkExistingReportAsync(
    userId: string,
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'comment',
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
    targetType: 'bobblehead' | 'collection' | 'comment',
    context: QueryContext,
  ): Promise<number> {
    const dbInstance = this.getDbInstance(context);
    const [result] = await dbInstance
      .select({ count: count() })
      .from(contentReports)
      .where(and(eq(contentReports.targetId, targetId), eq(contentReports.targetType, targetType)));
    return result?.count ?? 0;
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
   * Get all reports for admin with comprehensive filtering and pagination
   * @param options - Filter and pagination options
   * @param context - Query context for database access
   * @returns Promise<SelectContentReport[]> - Filtered and paginated reports
   */
  static async getAllReportsForAdminAsync(
    options: AdminReportsFilterOptions = {},
    context: QueryContext,
  ): Promise<Array<SelectContentReport>> {
    return this.executeWithRetry(async () => {
      const dbInstance = this.getDbInstance(context);
      const pagination = this.applyPagination(options);

      const filters: Array<SQL | undefined> = [];

      if (options.status) {
        if (Array.isArray(options.status)) {
          filters.push(inArray(contentReports.status, options.status));
        } else {
          filters.push(eq(contentReports.status, options.status));
        }
      }

      if (options.targetType) {
        if (Array.isArray(options.targetType)) {
          filters.push(inArray(contentReports.targetType, options.targetType));
        } else {
          filters.push(eq(contentReports.targetType, options.targetType));
        }
      }

      if (options.reason) {
        if (Array.isArray(options.reason)) {
          filters.push(inArray(contentReports.reason, options.reason));
        } else {
          filters.push(eq(contentReports.reason, options.reason));
        }
      }

      if (options.reporterId) {
        filters.push(eq(contentReports.reporterId, options.reporterId));
      }

      if (options.moderatorId) {
        filters.push(eq(contentReports.moderatorId, options.moderatorId));
      }

      if (options.dateFrom) {
        filters.push(gte(contentReports.createdAt, options.dateFrom));
      }

      if (options.dateTo) {
        filters.push(lte(contentReports.createdAt, options.dateTo));
      }

      let query = dbInstance
        .select()
        .from(contentReports)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(contentReports.createdAt))
        .$dynamic();

      if (pagination.limit) {
        query = query.limit(pagination.limit);
      }

      if (pagination.offset) {
        query = query.offset(pagination.offset);
      }

      return query;
    }, 'getAllReportsForAdmin');
  }

  /**
   * Get all reports for admin with slug data for generating type-safe links
   * Uses LEFT JOINs to fetch slug information from related tables
   * @param options - Filter and pagination options
   * @param context - Query context for database access
   * @returns Promise<SelectContentReportWithSlugs[]> - Reports with slug data
   */
  static async getAllReportsWithSlugsForAdminAsync(
    options: AdminReportsFilterOptions = {},
    context: QueryContext,
  ): Promise<Array<SelectContentReportWithSlugs>> {
    return this.executeWithRetry(async () => {
      const dbInstance = this.getDbInstance(context);
      const pagination = this.applyPagination(options);

      const filters: Array<SQL | undefined> = [];

      if (options.status) {
        if (Array.isArray(options.status)) {
          filters.push(inArray(contentReports.status, options.status));
        } else {
          filters.push(eq(contentReports.status, options.status));
        }
      }

      if (options.targetType) {
        if (Array.isArray(options.targetType)) {
          filters.push(inArray(contentReports.targetType, options.targetType));
        } else {
          filters.push(eq(contentReports.targetType, options.targetType));
        }
      }

      if (options.reason) {
        if (Array.isArray(options.reason)) {
          filters.push(inArray(contentReports.reason, options.reason));
        } else {
          filters.push(eq(contentReports.reason, options.reason));
        }
      }

      if (options.reporterId) {
        filters.push(eq(contentReports.reporterId, options.reporterId));
      }

      if (options.moderatorId) {
        filters.push(eq(contentReports.moderatorId, options.moderatorId));
      }

      if (options.dateFrom) {
        filters.push(gte(contentReports.createdAt, options.dateFrom));
      }

      if (options.dateTo) {
        filters.push(lte(contentReports.createdAt, options.dateTo));
      }

      // Select all content report fields plus computed slug fields
      let query = dbInstance
        .select({
          collectionSlug: sql<null | string>`
            CASE
              WHEN ${contentReports.targetType} = 'bobblehead' THEN ${collections.slug}
              ELSE NULL
            END
          `.as('collection_slug'),
          commentContent: sql<null | string>`
            CASE
              WHEN ${contentReports.targetType} = 'comment' THEN ${comments.content}
              ELSE NULL
            END
          `.as('comment_content'),
          contentExists: sql<boolean>`
            CASE
              WHEN ${contentReports.targetType} = 'bobblehead' THEN ${bobbleheads.id} IS NOT NULL
              WHEN ${contentReports.targetType} = 'collection' THEN ${collections.id} IS NOT NULL
              WHEN ${contentReports.targetType} = 'comment' THEN ${comments.id} IS NOT NULL
              ELSE false
            END
          `.as('content_exists'),
          createdAt: contentReports.createdAt,
          description: contentReports.description,
          id: contentReports.id,
          moderatorId: contentReports.moderatorId,
          moderatorNotes: contentReports.moderatorNotes,
          ownerUsername: sql<null | string>`
            CASE
              WHEN ${contentReports.targetType} = 'bobblehead' THEN ${users.username}
              ELSE NULL
            END
          `.as('owner_username'),
          reason: contentReports.reason,
          reporterId: contentReports.reporterId,
          resolvedAt: contentReports.resolvedAt,
          status: contentReports.status,
          targetId: contentReports.targetId,
          targetSlug: sql<null | string>`
            CASE
              WHEN ${contentReports.targetType} = 'bobblehead' THEN ${bobbleheads.slug}
              WHEN ${contentReports.targetType} = 'collection' THEN ${collections.slug}
              ELSE NULL
            END
          `.as('target_slug'),
          targetType: contentReports.targetType,
          updatedAt: contentReports.updatedAt,
        })
        .from(contentReports)
        // LEFT JOIN bobbleheads for bobblehead reports
        .leftJoin(
          bobbleheads,
          and(eq(contentReports.targetId, bobbleheads.id), eq(contentReports.targetType, 'bobblehead')),
        )
        // LEFT JOIN collections for bobblehead reports (to get collection slug) and collection reports
        .leftJoin(
          collections,
          sql`(${contentReports.targetType} = 'bobblehead' AND ${bobbleheads.collectionId} = ${collections.id})
              OR (${contentReports.targetType} = 'collection' AND ${contentReports.targetId} = ${collections.id})`,
        )
        // LEFT JOIN users for bobblehead reports (to get owner username)
        .leftJoin(users, and(eq(bobbleheads.userId, users.id), eq(contentReports.targetType, 'bobblehead')))
        // LEFT JOIN comments for comment reports (to check existence)
        .leftJoin(
          comments,
          and(eq(contentReports.targetId, comments.id), eq(contentReports.targetType, 'comment')),
        )
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(contentReports.createdAt))
        .$dynamic();

      if (pagination.limit) {
        query = query.limit(pagination.limit);
      }

      if (pagination.offset) {
        query = query.offset(pagination.offset);
      }

      return query;
    }, 'getAllReportsWithSlugsForAdmin');
  }

  /**
   * Get recent reports by a specific user (for rate limiting checks)
   */
  static async getRecentReportsByUserAsync(
    userId: string,
    hoursAgo: number = 24,
    context: QueryContext,
  ): Promise<Array<SelectContentReport>> {
    const dbInstance = this.getDbInstance(context);
    const timeThreshold = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    return dbInstance.query.contentReports.findMany({
      orderBy: [desc(contentReports.createdAt)],
      where: and(eq(contentReports.reporterId, userId), gte(contentReports.createdAt, timeThreshold)),
    });
  }

  /**
   * Get reports filtered by status for admin dashboard
   * @param status - Report status to filter by
   * @param options - Pagination options
   * @param context - Query context for database access
   * @returns Promise<SelectContentReport[]> - Reports with specified status
   */
  static async getReportsByStatusAsync(
    status: ContentReportStatus,
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<SelectContentReport>> {
    return this.executeWithRetry(async () => {
      const dbInstance = this.getDbInstance(context);
      const pagination = this.applyPagination(options);

      let query = dbInstance
        .select()
        .from(contentReports)
        .where(eq(contentReports.status, status))
        .orderBy(desc(contentReports.createdAt))
        .$dynamic();

      if (pagination.limit) {
        query = query.limit(pagination.limit);
      }

      if (pagination.offset) {
        query = query.offset(pagination.offset);
      }

      return query;
    }, 'getReportsByStatus');
  }

  /**
   * Get all reports for a specific target
   */
  static async getReportsByTargetAsync(
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'comment',
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<SelectContentReport>> {
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

  // Admin-specific methods

  /**
   * Get report statistics for admin dashboard
   * @param context - Query context for database access
   * @returns Promise<ReportsStatsResult> - Report statistics by status
   */
  static async getReportsStatsAsync(context: QueryContext): Promise<ReportsStatsResult> {
    return this.executeWithRetry(async () => {
      const dbInstance = this.getDbInstance(context);

      const [stats] = await dbInstance
        .select({
          dismissed: sql<number>`COUNT(CASE WHEN ${contentReports.status} = 'dismissed' THEN 1 END)`.as(
            'dismissed',
          ),
          pending: sql<number>`COUNT(CASE WHEN ${contentReports.status} = 'pending' THEN 1 END)`.as(
            'pending',
          ),
          resolved: sql<number>`COUNT(CASE WHEN ${contentReports.status} = 'resolved' THEN 1 END)`.as(
            'resolved',
          ),
          reviewed: sql<number>`COUNT(CASE WHEN ${contentReports.status} = 'reviewed' THEN 1 END)`.as(
            'reviewed',
          ),
          total: count(),
        })
        .from(contentReports);

      return {
        dismissed: parseInt(String(stats?.dismissed ?? 0), 10),
        pending: parseInt(String(stats?.pending ?? 0), 10),
        resolved: parseInt(String(stats?.resolved ?? 0), 10),
        reviewed: parseInt(String(stats?.reviewed ?? 0), 10),
        total: parseInt(String(stats?.total ?? 0), 10),
      };
    }, 'getReportsStats');
  }

  /**
   * Get report status for a specific target and user
   */
  static async getReportStatusAsync(
    userId: string,
    targetId: string,
    targetType: 'bobblehead' | 'collection' | 'comment',
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
    targetType: 'bobblehead' | 'collection' | 'comment',
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

      case 'comment': {
        const comment = await dbInstance.query.comments.findFirst({
          columns: {
            id: true,
            userId: true,
          },
          where: eq(comments.id, targetId),
        });

        return {
          isExists: !!comment,
          ownerId: comment?.userId || null,
        };
      }

      default:
        return { isExists: false, ownerId: null };
    }
  }
}
