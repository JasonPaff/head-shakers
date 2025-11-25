import { count, desc, eq, gte, ilike, isNull, lte, sql } from 'drizzle-orm';

import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';

import { newsletterSends } from '@/lib/db/schema/newsletter-sends.schema';
import { newsletterSignups } from '@/lib/db/schema/newsletter-signups.schema';
import { newsletterTemplates } from '@/lib/db/schema/newsletter-templates.schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

/**
 * Type for inserting a new newsletter send record
 */
export type InsertNewsletterSend = typeof newsletterSends.$inferInsert;

/**
 * Type for inserting a new newsletter signup
 */
export type InsertNewsletterSignup = typeof newsletterSignups.$inferInsert;

/**
 * Type for inserting a new newsletter template
 */
export type InsertNewsletterTemplate = typeof newsletterTemplates.$inferInsert;

/**
 * Type for newsletter send record from database
 */
export type NewsletterSendRecord = typeof newsletterSends.$inferSelect;

/**
 * Type for newsletter send statistics
 */
export type NewsletterSendStats = {
  averageFailureRate: number;
  averageSuccessRate: number;
  totalFailed: number;
  totalRecipients: number;
  totalSends: number;
  totalSucceeded: number;
};

/**
 * Type for newsletter signup record from database
 */
export type NewsletterSignupRecord = typeof newsletterSignups.$inferSelect;

/**
 * Type for newsletter template record from database
 */
export type NewsletterTemplateRecord = typeof newsletterTemplates.$inferSelect;

/**
 * Type for subscriber counts
 */
export type SubscriberCounts = {
  activeCount: number;
  totalCount: number;
  unsubscribedCount: number;
};

/**
 * Type for subscriber with activity information
 */
export type SubscriberWithActivity = NewsletterSignupRecord & {
  activityType: 'subscribe' | 'unsubscribe';
};

/**
 * Newsletter query class for database operations
 */
export class NewsletterQuery extends BaseQuery {
  /**
   * Create a newsletter send record to log newsletter sends
   */
  static async createSendRecordAsync(
    data: InsertNewsletterSend,
    context: QueryContext,
  ): Promise<NewsletterSendRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.insert(newsletterSends).values(data).returning();

    return result?.[0] || null;
  }

  /**
   * Create a new newsletter subscription
   * Uses onConflictDoNothing to handle duplicate emails gracefully
   */
  static async createSignupAsync(
    email: string,
    userId: null | string,
    context: QueryContext,
  ): Promise<NewsletterSignupRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .insert(newsletterSignups)
      .values({
        email: email.toLowerCase().trim(),
        userId: userId ?? undefined,
      })
      .onConflictDoNothing()
      .returning();

    return result?.[0] || null;
  }

  /**
   * Create a new newsletter template
   */
  static async createTemplateAsync(
    data: InsertNewsletterTemplate,
    context: QueryContext,
  ): Promise<NewsletterTemplateRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.insert(newsletterTemplates).values(data).returning();

    return result?.[0] || null;
  }

  /**
   * Delete a newsletter template (hard delete)
   * Templates don't use soft delete since they're admin-only content
   */
  static async deleteTemplateAsync(
    templateId: string,
    context: QueryContext,
  ): Promise<NewsletterTemplateRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .delete(newsletterTemplates)
      .where(eq(newsletterTemplates.id, templateId))
      .returning();

    return result?.[0] || null;
  }

  /**
   * Check if email exists (regardless of subscription status)
   */
  static async emailExistsAsync(email: string, context: QueryContext): Promise<boolean> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ id: newsletterSignups.id })
      .from(newsletterSignups)
      .where(eq(newsletterSignups.email, email.toLowerCase().trim()))
      .limit(1);

    return result.length > 0;
  }

  /**
   * Find a newsletter signup by email address
   * Returns the signup record if found, null otherwise
   */
  static async findByEmailAsync(
    email: string,
    context: QueryContext,
  ): Promise<NewsletterSignupRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select()
      .from(newsletterSignups)
      .where(eq(newsletterSignups.email, email.toLowerCase().trim()))
      .limit(1);

    return result?.[0] || null;
  }

  /**
   * Get active subscriber by email (not unsubscribed)
   */
  static async getActiveSubscriberAsync(
    email: string,
    context: QueryContext,
  ): Promise<NewsletterSignupRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select()
      .from(newsletterSignups)
      .where(eq(newsletterSignups.email, email.toLowerCase().trim()))
      .limit(1);

    const signup = result?.[0];
    if (!signup || signup.unsubscribedAt !== null) {
      return null;
    }

    return signup;
  }

  /**
   * Get recent subscription activity (subscribes and unsubscribes)
   * Returns recent activity sorted by date descending
   */
  static async getRecentActivityAsync(
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<SubscriberWithActivity>> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    // Get recent subscriptions
    const subscriptions = await dbInstance
      .select()
      .from(newsletterSignups)
      .orderBy(desc(newsletterSignups.subscribedAt))
      .limit(pagination.limit || 50);

    // Get recent unsubscriptions
    const unsubscriptions = await dbInstance
      .select()
      .from(newsletterSignups)
      .where(sql`${newsletterSignups.unsubscribedAt} IS NOT NULL`)
      .orderBy(desc(newsletterSignups.unsubscribedAt))
      .limit(pagination.limit || 50);

    // Combine and sort by most recent activity
    const combined: Array<SubscriberWithActivity> = [
      ...subscriptions.map((sub) => ({
        ...sub,
        activityType: 'subscribe' as const,
      })),
      ...unsubscriptions.map((sub) => ({
        ...sub,
        activityType: 'unsubscribe' as const,
      })),
    ];

    // Sort by most recent activity (subscribedAt for subscribes, unsubscribedAt for unsubscribes)
    combined.sort((a, b) => {
      const dateA = a.activityType === 'subscribe' ? a.subscribedAt : a.unsubscribedAt;
      const dateB = b.activityType === 'subscribe' ? b.subscribedAt : b.unsubscribedAt;
      return dateB && dateA ? dateB.getTime() - dateA.getTime() : 0;
    });

    // Apply pagination
    const start = pagination.offset || 0;
    const end = pagination.limit ? start + pagination.limit : undefined;

    return combined.slice(start, end);
  }

  // ============================================================================
  // Admin Subscriber Management Methods
  // ============================================================================

  /**
   * Get newsletter send history with pagination
   * Returns send records sorted by send date descending
   */
  static async getSendHistoryAsync(
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<NewsletterSendRecord>> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    const query = dbInstance.select().from(newsletterSends).orderBy(desc(newsletterSends.sentAt));

    if (pagination.limit) {
      query.limit(pagination.limit);
    }

    if (pagination.offset) {
      query.offset(pagination.offset);
    }

    return query;
  }

  /**
   * Get newsletter send statistics for analytics
   * Returns aggregated statistics about all newsletter sends
   */
  static async getSendStatsAsync(context: QueryContext): Promise<NewsletterSendStats> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({
        averageFailureRate: sql<number>`
          CASE
            WHEN SUM(${newsletterSends.recipientCount}) > 0
            THEN (SUM(${newsletterSends.failureCount})::float / SUM(${newsletterSends.recipientCount})::float) * 100
            ELSE 0
          END
        `,
        averageSuccessRate: sql<number>`
          CASE
            WHEN SUM(${newsletterSends.recipientCount}) > 0
            THEN (SUM(${newsletterSends.successCount})::float / SUM(${newsletterSends.recipientCount})::float) * 100
            ELSE 0
          END
        `,
        totalFailed: sql<number>`SUM(${newsletterSends.failureCount})`,
        totalRecipients: sql<number>`SUM(${newsletterSends.recipientCount})`,
        totalSends: count(),
        totalSucceeded: sql<number>`SUM(${newsletterSends.successCount})`,
      })
      .from(newsletterSends);

    const stats = result?.[0];

    return {
      averageFailureRate: stats?.averageFailureRate || 0,
      averageSuccessRate: stats?.averageSuccessRate || 0,
      totalFailed: stats?.totalFailed || 0,
      totalRecipients: stats?.totalRecipients || 0,
      totalSends: stats?.totalSends || 0,
      totalSucceeded: stats?.totalSucceeded || 0,
    };
  }

  /**
   * Get subscriber count statistics (total and active)
   */
  static async getSubscriberCountAsync(context: QueryContext): Promise<SubscriberCounts> {
    const dbInstance = this.getDbInstance(context);

    // Get total count
    const totalResult = await dbInstance.select({ count: count() }).from(newsletterSignups);

    // Get active count (not unsubscribed)
    const activeResult = await dbInstance
      .select({ count: count() })
      .from(newsletterSignups)
      .where(isNull(newsletterSignups.unsubscribedAt));

    const totalCount = totalResult[0]?.count || 0;
    const activeCount = activeResult[0]?.count || 0;
    const unsubscribedCount = totalCount - activeCount;

    return {
      activeCount,
      totalCount,
      unsubscribedCount,
    };
  }

  // ============================================================================
  // Admin Template Management Methods
  // ============================================================================

  /**
   * Get all subscribers with filtering, sorting, and pagination
   * Supports search by email, filter by status (subscribed/unsubscribed/all), and date range
   */
  static async getSubscribersAsync(
    filters: {
      dateRange?: {
        from?: Date | null;
        to?: Date | null;
      };
      search?: null | string;
      status?: 'all' | 'subscribed' | 'unsubscribed';
    } = {},
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<NewsletterSignupRecord>> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    const conditions = [];

    // Search by email
    if (filters.search) {
      const escapedSearch = filters.search.replace(/[%_]/g, '\\$&');
      conditions.push(ilike(newsletterSignups.email, `%${escapedSearch}%`));
    }

    // Filter by status
    if (filters.status === 'subscribed') {
      conditions.push(isNull(newsletterSignups.unsubscribedAt));
    } else if (filters.status === 'unsubscribed') {
      conditions.push(sql`${newsletterSignups.unsubscribedAt} IS NOT NULL`);
    }
    // 'all' status requires no additional filter

    // Date range filters
    if (filters.dateRange?.from) {
      conditions.push(gte(newsletterSignups.subscribedAt, filters.dateRange.from));
    }
    if (filters.dateRange?.to) {
      conditions.push(lte(newsletterSignups.subscribedAt, filters.dateRange.to));
    }

    const query = dbInstance.select().from(newsletterSignups).orderBy(desc(newsletterSignups.subscribedAt));

    if (conditions.length > 0) {
      query.where(this.combineFilters(...conditions));
    }

    if (pagination.limit) {
      query.limit(pagination.limit);
    }

    if (pagination.offset) {
      query.offset(pagination.offset);
    }

    return query;
  }

  /**
   * Get a specific newsletter template by ID
   */
  static async getTemplateByIdAsync(
    templateId: string,
    context: QueryContext,
  ): Promise<NewsletterTemplateRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select()
      .from(newsletterTemplates)
      .where(eq(newsletterTemplates.id, templateId))
      .limit(1);

    return result?.[0] || null;
  }

  /**
   * Get all newsletter templates
   * Returns templates sorted by creation date descending
   */
  static async getTemplatesAsync(
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<NewsletterTemplateRecord>> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    const query = dbInstance.select().from(newsletterTemplates).orderBy(desc(newsletterTemplates.createdAt));

    if (pagination.limit) {
      query.limit(pagination.limit);
    }

    if (pagination.offset) {
      query.offset(pagination.offset);
    }

    return query;
  }

  /**
   * Check if an email is actively subscribed (not unsubscribed)
   */
  static async isActiveSubscriberAsync(email: string, context: QueryContext): Promise<boolean> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ id: newsletterSignups.id })
      .from(newsletterSignups)
      .where(eq(newsletterSignups.email, email.toLowerCase().trim()))
      .limit(1);

    const signup = result?.[0];
    if (!signup) return false;

    // Check if unsubscribed
    const fullRecord = await dbInstance
      .select()
      .from(newsletterSignups)
      .where(eq(newsletterSignups.id, signup.id))
      .limit(1);

    return fullRecord?.[0]?.unsubscribedAt === null;
  }

  /**
   * Resubscribe an existing email (clear unsubscribedAt)
   */
  static async resubscribeAsync(
    email: string,
    context: QueryContext,
  ): Promise<NewsletterSignupRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(newsletterSignups)
      .set({
        subscribedAt: new Date(),
        unsubscribedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(newsletterSignups.email, email.toLowerCase().trim()))
      .returning();

    return result?.[0] || null;
  }

  // ============================================================================
  // Admin Newsletter Send Management Methods
  // ============================================================================

  /**
   * Soft delete (unsubscribe) a newsletter signup by email
   * Sets unsubscribedAt timestamp instead of hard delete
   */
  static async unsubscribeAsync(
    email: string,
    context: QueryContext,
  ): Promise<NewsletterSignupRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(newsletterSignups)
      .set({
        unsubscribedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(newsletterSignups.email, email.toLowerCase().trim()))
      .returning();

    return result?.[0] || null;
  }

  /**
   * Update an existing newsletter template
   */
  static async updateTemplateAsync(
    templateId: string,
    data: Partial<Omit<InsertNewsletterTemplate, 'createdBy'>>,
    context: QueryContext,
  ): Promise<NewsletterTemplateRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(newsletterTemplates)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(newsletterTemplates.id, templateId))
      .returning();

    return result?.[0] || null;
  }

  /**
   * Update user ID for an existing signup (for linking anonymous signup to user)
   */
  static async updateUserIdAsync(
    email: string,
    userId: string,
    context: QueryContext,
  ): Promise<NewsletterSignupRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(newsletterSignups)
      .set({
        updatedAt: new Date(),
        userId,
      })
      .where(eq(newsletterSignups.email, email.toLowerCase().trim()))
      .returning();

    return result?.[0] || null;
  }
}
