import * as Sentry from '@sentry/nextjs';

import type { FindOptions } from '@/lib/queries/base/query-context';
import type {
  InsertNewsletterSend,
  InsertNewsletterTemplate,
  NewsletterSendRecord,
  NewsletterSendStats,
  NewsletterSignupRecord,
  NewsletterTemplateRecord,
  SubscriberCounts,
  SubscriberWithActivity,
} from '@/lib/queries/newsletter/newsletter.queries';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { OPERATIONS, SENTRY_BREADCRUMB_CATEGORIES, SENTRY_LEVELS } from '@/lib/constants';
import { db } from '@/lib/db';
import { createProtectedQueryContext, createPublicQueryContext } from '@/lib/queries/base/query-context';
import { NewsletterQuery } from '@/lib/queries/newsletter/newsletter.queries';
import { ResendService } from '@/lib/services/resend.service';
import { createFacadeError } from '@/lib/utils/error-builders';

const facadeName = 'NewsletterFacade';

/**
 * Result type for newsletter send operations
 */
export interface NewsletterSendResult {
  /** Error message if operation failed */
  error?: string;
  /** Number of emails that failed to send */
  failedCount: number;
  /** Whether the operation was successful */
  isSuccessful: boolean;
  /** Send record (null if operation failed) */
  sendRecord: NewsletterSendRecord | null;
  /** Number of emails sent successfully */
  successCount: number;
}

/**
 * Newsletter statistics for admin dashboard
 */
export interface NewsletterStats {
  recentActivity: Array<SubscriberWithActivity>;
  sendHistory: Array<NewsletterSendRecord>;
  sendStats: NewsletterSendStats;
  subscriberCounts: SubscriberCounts;
}

/**
 * Result type for newsletter subscription operations
 */
export interface NewsletterSubscriptionResult {
  /** Error message if operation failed */
  error?: string;
  /** Whether the email was already subscribed */
  isAlreadySubscribed: boolean;
  /** Whether the operation was successful */
  isSuccessful: boolean;
  /** The signup record (null if operation failed) */
  signup: NewsletterSignupRecord | null;
}

/**
 * NewsletterFacade handles business logic for newsletter operations
 * Provides methods for subscribing, unsubscribing, and checking subscription status
 */
export class NewsletterFacade {
  /**
   * Create a new newsletter template
   * Stores reusable email templates for newsletter campaigns
   *
   * @param data - Template data (subject, content, created by admin)
   * @param adminUserId - Admin user ID creating the template
   * @param dbInstance - Optional database instance for transactions
   * @returns The created template record, or null if creation failed
   */
  static async createTemplateAsync(
    data: InsertNewsletterTemplate,
    adminUserId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<NewsletterTemplateRecord | null> {
    try {
      const context = createProtectedQueryContext(adminUserId, { dbInstance });

      const template = await NewsletterQuery.createTemplateAsync(data, context);

      if (template) {
        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            subject: data.subject,
            templateId: template.id,
          },
          level: SENTRY_LEVELS.INFO,
          message: 'Admin created newsletter template',
        });
      }

      return template;
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { subject: data.subject },
        facade: facadeName,
        method: 'createTemplateAsync',
        operation: OPERATIONS.NEWSLETTER_ADMIN.CREATE_NEWSLETTER_TEMPLATE,
        userId: adminUserId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Delete a newsletter template
   * Hard deletes template as they are admin-only content
   *
   * @param templateId - ID of template to delete
   * @param adminUserId - Admin user ID deleting the template
   * @param dbInstance - Optional database instance for transactions
   * @returns The deleted template record, or null if deletion failed
   */
  static async deleteTemplateAsync(
    templateId: string,
    adminUserId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<NewsletterTemplateRecord | null> {
    try {
      const context = createProtectedQueryContext(adminUserId, { dbInstance });

      // Verify template exists
      const existingTemplate = await NewsletterQuery.getTemplateByIdAsync(templateId, context);

      if (!existingTemplate) {
        return null;
      }

      const deletedTemplate = await NewsletterQuery.deleteTemplateAsync(templateId, context);

      if (deletedTemplate) {
        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            subject: deletedTemplate.subject,
            templateId,
          },
          level: SENTRY_LEVELS.INFO,
          message: 'Admin deleted newsletter template',
        });
      }

      return deletedTemplate;
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { templateId },
        facade: facadeName,
        method: 'deleteTemplateAsync',
        operation: OPERATIONS.NEWSLETTER_ADMIN.DELETE_NEWSLETTER_TEMPLATE,
        userId: adminUserId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Get newsletter statistics for admin dashboard
   * Aggregates subscriber counts, recent activity, and send history
   *
   * @param adminUserId - Admin user ID performing the operation
   * @param dbInstance - Optional database instance for transactions
   * @returns Newsletter statistics including subscriber counts, activity, and send history
   */
  static async getNewsletterStatsAsync(
    adminUserId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<NewsletterStats> {
    try {
      const context = createProtectedQueryContext(adminUserId, { dbInstance });

      // Fetch all stats in parallel for efficiency
      const [subscriberCounts, recentActivity, sendHistory, sendStats] = await Promise.all([
        NewsletterQuery.getSubscriberCountAsync(context),
        NewsletterQuery.getRecentActivityAsync({ limit: 10 }, context),
        NewsletterQuery.getSendHistoryAsync({ limit: 5 }, context),
        NewsletterQuery.getSendStatsAsync(context),
      ]);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          activeCount: subscriberCounts.activeCount,
          recentActivityCount: recentActivity.length,
          sendCount: sendHistory.length,
          totalCount: subscriberCounts.totalCount,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Admin fetched newsletter statistics',
      });

      return {
        recentActivity,
        sendHistory,
        sendStats,
        subscriberCounts,
      };
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        facade: facadeName,
        method: 'getNewsletterStatsAsync',
        operation: OPERATIONS.NEWSLETTER_ADMIN.GET_NEWSLETTER_STATS,
        userId: adminUserId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  // ==================== Admin Methods ====================

  /**
   * Get newsletter send history with pagination
   *
   * @param options - Pagination options
   * @param adminUserId - Admin user ID fetching send history
   * @param dbInstance - Optional database instance for transactions
   * @returns Array of send records sorted by date descending
   */
  static async getSendHistoryAsync(
    options: FindOptions = {},
    adminUserId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<NewsletterSendRecord>> {
    try {
      const context = createProtectedQueryContext(adminUserId, { dbInstance });

      const sendHistory = await NewsletterQuery.getSendHistoryAsync(options, context);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          count: sendHistory.length,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Admin fetched newsletter send history',
      });

      return sendHistory;
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { options },
        facade: facadeName,
        method: 'getSendHistoryAsync',
        operation: OPERATIONS.NEWSLETTER_ADMIN.GET_NEWSLETTER_SEND_HISTORY,
        userId: adminUserId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Get subscribers for admin management with filtering, sorting, and pagination
   * Supports search by email, filter by status, and date range filtering
   *
   * @param filters - Search and filter criteria (email search, subscription status, date range)
   * @param options - Pagination and sorting options
   * @param adminUserId - Admin user ID performing the operation
   * @param dbInstance - Optional database instance for transactions
   * @returns Array of subscriber records matching the criteria
   */
  static async getSubscribersForAdminAsync(
    filters: {
      dateRange?: {
        from?: Date | null;
        to?: Date | null;
      };
      search?: null | string;
      status?: 'all' | 'subscribed' | 'unsubscribed';
    } = {},
    options: FindOptions = {},
    adminUserId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<NewsletterSignupRecord>> {
    try {
      const context = createProtectedQueryContext(adminUserId, { dbInstance });

      const subscribers = await NewsletterQuery.getSubscribersAsync(filters, options, context);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          count: subscribers.length,
          hasDateRange: Boolean(filters.dateRange),
          hasSearch: Boolean(filters.search),
          status: filters.status || 'all',
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Admin fetched subscriber list',
      });

      return subscribers;
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { filters, options },
        facade: facadeName,
        method: 'getSubscribersForAdminAsync',
        operation: OPERATIONS.NEWSLETTER_ADMIN.GET_NEWSLETTER_SUBSCRIBERS,
        userId: adminUserId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Get a specific newsletter template by ID
   *
   * @param templateId - ID of template to retrieve
   * @param adminUserId - Admin user ID fetching the template
   * @param dbInstance - Optional database instance for transactions
   * @returns The template record, or null if not found
   */
  static async getTemplateByIdAsync(
    templateId: string,
    adminUserId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<NewsletterTemplateRecord | null> {
    try {
      const context = createProtectedQueryContext(adminUserId, { dbInstance });

      const template = await NewsletterQuery.getTemplateByIdAsync(templateId, context);

      if (template) {
        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            subject: template.subject,
            templateId,
          },
          level: SENTRY_LEVELS.INFO,
          message: 'Admin fetched newsletter template',
        });
      }

      return template;
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { templateId },
        facade: facadeName,
        method: 'getTemplateByIdAsync',
        operation: OPERATIONS.NEWSLETTER_ADMIN.GET_NEWSLETTER_TEMPLATES,
        userId: adminUserId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Get all newsletter templates with pagination
   *
   * @param options - Pagination options
   * @param adminUserId - Admin user ID fetching templates
   * @param dbInstance - Optional database instance for transactions
   * @returns Array of template records
   */
  static async getTemplatesAsync(
    options: FindOptions = {},
    adminUserId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<NewsletterTemplateRecord>> {
    try {
      const context = createProtectedQueryContext(adminUserId, { dbInstance });

      const templates = await NewsletterQuery.getTemplatesAsync(options, context);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          count: templates.length,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Admin fetched newsletter templates',
      });

      return templates;
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { options },
        facade: facadeName,
        method: 'getTemplatesAsync',
        operation: OPERATIONS.NEWSLETTER_ADMIN.GET_NEWSLETTER_TEMPLATES,
        userId: adminUserId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Check if an email is currently subscribed to the newsletter
   * Returns true only if email exists AND is not unsubscribed
   *
   * @param email - Email address to check
   * @param dbInstance - Optional database instance for transactions
   * @returns Boolean indicating if email is actively subscribed
   */
  static async isEmailSubscribedAsync(email: string, dbInstance?: DatabaseExecutor): Promise<boolean> {
    try {
      const context = createPublicQueryContext({ dbInstance });
      return NewsletterQuery.isActiveSubscriberAsync(email, context);
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { email: email.substring(0, 3) + '***' },
        facade: facadeName,
        method: 'isEmailSubscribedAsync',
        operation: OPERATIONS.NEWSLETTER.CHECK_SUBSCRIPTION,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Send newsletter to all active subscribers
   * Fetches active subscribers, sends via ResendService bulk send, creates send record
   *
   * @param subject - Email subject line
   * @param bodyHtml - Email HTML content
   * @param adminUserId - Admin user ID sending the newsletter
   * @param dbInstance - Optional database instance for transactions
   * @returns Send result with success/failure counts and send record
   */
  static async sendNewsletterAsync(
    subject: string,
    bodyHtml: string,
    adminUserId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<NewsletterSendResult> {
    try {
      return await (dbInstance ?? db).transaction(async (tx) => {
        const context = createProtectedQueryContext(adminUserId, { dbInstance: tx });

        // Fetch all active subscribers
        const subscribers = await NewsletterQuery.getSubscribersAsync(
          { status: 'subscribed' },
          { limit: 10000 }, // Large limit to get all active subscribers
          context,
        );

        if (subscribers.length === 0) {
          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
            data: {
              subject,
            },
            level: SENTRY_LEVELS.WARNING,
            message: 'Newsletter send attempted with no active subscribers',
          });

          return {
            error: 'No active subscribers to send to',
            failedCount: 0,
            isSuccessful: false,
            sendRecord: null,
            successCount: 0,
          };
        }

        const emails = subscribers.map((sub) => sub.email);

        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            recipientCount: emails.length,
            subject,
          },
          level: SENTRY_LEVELS.INFO,
          message: 'Starting newsletter bulk send',
        });

        // Send emails via ResendService
        // Note: ResendService.sendLaunchNotificationsAsync handles batching and rate limiting
        const { failedEmails, sentCount } = await ResendService.sendLaunchNotificationsAsync(emails);

        const failedCount = failedEmails.length;

        // Log any failures
        if (failedCount > 0) {
          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
            data: {
              failedCount,
              subject,
            },
            level: SENTRY_LEVELS.WARNING,
            message: 'Newsletter bulk send had failures',
          });
        }

        // Create send record for audit trail
        const sendData: InsertNewsletterSend = {
          bodyHtml,
          failureCount: failedCount,
          recipientCount: emails.length,
          sentAt: new Date(),
          sentBy: adminUserId,
          status: sentCount > 0 ? 'completed' : 'failed',
          subject,
          successCount: sentCount,
        };

        const sendRecord = await NewsletterQuery.createSendRecordAsync(sendData, context);

        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            failedCount,
            recipientCount: emails.length,
            sendRecordId: sendRecord?.id,
            subject,
            successCount: sentCount,
          },
          level: SENTRY_LEVELS.INFO,
          message: 'Newsletter bulk send completed',
        });

        return {
          failedCount,
          isSuccessful: sentCount > 0,
          sendRecord,
          successCount: sentCount,
        };
      });
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { subject },
        facade: facadeName,
        method: 'sendNewsletterAsync',
        operation: OPERATIONS.NEWSLETTER_ADMIN.SEND_NEWSLETTER_BULK,
        userId: adminUserId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Subscribe an email to the newsletter
   * Handles the following cases:
   * - New subscription: Creates a new signup record
   * - Existing active subscription: Returns success with isAlreadySubscribed=true
   * - Previously unsubscribed: Resubscribes the email
   *
   * @param email - Email address to subscribe
   * @param userId - Optional Clerk user ID to associate with subscription
   * @param dbInstance - Optional database instance for transactions
   * @returns Result object with subscription status and signup record
   */
  static async subscribeAsync(
    email: string,
    userId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<NewsletterSubscriptionResult> {
    try {
      return await (dbInstance ?? db).transaction(async (tx) => {
        const context = createPublicQueryContext({ dbInstance: tx });
        const normalizedEmail = email.toLowerCase().trim();

        // Check if email already exists
        const existingSignup = await NewsletterQuery.findByEmailAsync(normalizedEmail, context);

        if (existingSignup) {
          // Check if previously unsubscribed
          if (existingSignup.unsubscribedAt !== null) {
            // Resubscribe
            const resubscribed = await NewsletterQuery.resubscribeAsync(normalizedEmail, context);

            // Update userId if provided and different
            if (userId && resubscribed && resubscribed.userId !== userId) {
              await NewsletterQuery.updateUserIdAsync(normalizedEmail, userId, context);
            }

            Sentry.addBreadcrumb({
              category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
              data: {
                hasUserId: Boolean(userId),
                signupId: resubscribed?.id,
              },
              level: SENTRY_LEVELS.INFO,
              message: 'Newsletter email resubscribed',
            });

            return {
              isAlreadySubscribed: false,
              isSuccessful: true,
              signup: resubscribed,
            };
          }

          // Already actively subscribed - return success for privacy
          // Don't expose whether email exists to prevent enumeration
          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
            data: {
              hasUserId: Boolean(userId),
              signupId: existingSignup.id,
            },
            level: SENTRY_LEVELS.INFO,
            message: 'Newsletter signup attempted for existing subscriber',
          });

          // Update userId if provided and not already set
          if (userId && !existingSignup.userId) {
            await NewsletterQuery.updateUserIdAsync(normalizedEmail, userId, context);
          }

          return {
            isAlreadySubscribed: true,
            isSuccessful: true,
            signup: existingSignup,
          };
        }

        // New subscription
        const newSignup = await NewsletterQuery.createSignupAsync(normalizedEmail, userId ?? null, context);

        if (!newSignup) {
          // Race condition - email was created between check and insert
          // This shouldn't happen with transaction, but handle gracefully
          const existingAfterRace = await NewsletterQuery.findByEmailAsync(normalizedEmail, context);
          return {
            isAlreadySubscribed: true,
            isSuccessful: true,
            signup: existingAfterRace,
          };
        }

        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            hasUserId: Boolean(userId),
            signupId: newSignup.id,
          },
          level: SENTRY_LEVELS.INFO,
          message: 'New newsletter subscription created',
        });

        // Send welcome email asynchronously for new subscribers
        // Wrapped in try-catch to ensure email failures don't affect subscription
        try {
          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
            data: {
              email: normalizedEmail.substring(0, 3) + '***',
              operation: OPERATIONS.NEWSLETTER.SEND_WELCOME_EMAIL,
            },
            level: SENTRY_LEVELS.INFO,
            message: 'Sending newsletter welcome email',
          });

          // Fire and forget - don't await to avoid blocking subscription
          void ResendService.sendNewsletterWelcomeAsync(normalizedEmail).catch((emailError) => {
            Sentry.captureException(emailError, {
              extra: {
                email: normalizedEmail.substring(0, 3) + '***',
                signupId: newSignup.id,
              },
              tags: {
                component: facadeName,
                operation: OPERATIONS.NEWSLETTER.SEND_WELCOME_EMAIL,
              },
            });
          });
        } catch (emailError) {
          // Log but don't throw - subscription should succeed even if email fails
          Sentry.captureException(emailError, {
            extra: {
              email: normalizedEmail.substring(0, 3) + '***',
              signupId: newSignup.id,
            },
            tags: {
              component: facadeName,
              operation: OPERATIONS.NEWSLETTER.SEND_WELCOME_EMAIL,
            },
          });
        }

        return {
          isAlreadySubscribed: false,
          isSuccessful: true,
          signup: newSignup,
        };
      });
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { hasUserId: Boolean(userId) },
        facade: facadeName,
        method: 'subscribeAsync',
        operation: OPERATIONS.NEWSLETTER.SUBSCRIBE,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Unsubscribe an email from the newsletter
   * Uses soft delete pattern - sets unsubscribedAt timestamp
   *
   * @param email - Email address to unsubscribe
   * @param dbInstance - Optional database instance for transactions
   * @returns The unsubscribed signup record, or null if email not found
   */
  static async unsubscribeAsync(
    email: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<NewsletterSignupRecord | null> {
    try {
      const context = createPublicQueryContext({ dbInstance });
      const normalizedEmail = email.toLowerCase().trim();

      // Check if email exists first
      const existingSignup = await NewsletterQuery.findByEmailAsync(normalizedEmail, context);

      if (!existingSignup) {
        // Email not found - return null but don't error
        // This prevents email enumeration attacks
        return null;
      }

      if (existingSignup.unsubscribedAt !== null) {
        // Already unsubscribed - return existing record
        return existingSignup;
      }

      const unsubscribed = await NewsletterQuery.unsubscribeAsync(normalizedEmail, context);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          signupId: unsubscribed?.id,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Newsletter email unsubscribed',
      });

      return unsubscribed;
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { email: email.substring(0, 3) + '***' },
        facade: facadeName,
        method: 'unsubscribeAsync',
        operation: OPERATIONS.NEWSLETTER.UNSUBSCRIBE,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Unsubscribe a user by admin action
   * Admin can unsubscribe any email, with operation logged for audit trail
   *
   * @param email - Email address to unsubscribe
   * @param adminUserId - Admin user ID performing the operation
   * @param dbInstance - Optional database instance for transactions
   * @returns The unsubscribed signup record, or null if email not found
   */
  static async unsubscribeByAdminAsync(
    email: string,
    adminUserId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<NewsletterSignupRecord | null> {
    try {
      const context = createProtectedQueryContext(adminUserId, { dbInstance });
      const normalizedEmail = email.toLowerCase().trim();

      // Check if email exists first
      const existingSignup = await NewsletterQuery.findByEmailAsync(normalizedEmail, context);

      if (!existingSignup) {
        return null;
      }

      if (existingSignup.unsubscribedAt !== null) {
        // Already unsubscribed - return existing record
        return existingSignup;
      }

      const unsubscribed = await NewsletterQuery.unsubscribeAsync(normalizedEmail, context);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          adminUserId,
          signupId: unsubscribed?.id,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Admin unsubscribed newsletter email',
      });

      return unsubscribed;
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { email: email.substring(0, 3) + '***' },
        facade: facadeName,
        method: 'unsubscribeByAdminAsync',
        operation: OPERATIONS.NEWSLETTER.UNSUBSCRIBE,
        userId: adminUserId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Update an existing newsletter template
   * Allows admins to modify template subject and content
   *
   * @param templateId - ID of template to update
   * @param data - Updated template data (subject, bodyHtml, bodyMarkdown, title)
   * @param adminUserId - Admin user ID updating the template
   * @param dbInstance - Optional database instance for transactions
   * @returns The updated template record, or null if update failed
   */
  static async updateTemplateAsync(
    templateId: string,
    data: Partial<Omit<InsertNewsletterTemplate, 'createdBy'>>,
    adminUserId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<NewsletterTemplateRecord | null> {
    try {
      const context = createProtectedQueryContext(adminUserId, { dbInstance });

      // Verify template exists
      const existingTemplate = await NewsletterQuery.getTemplateByIdAsync(templateId, context);

      if (!existingTemplate) {
        return null;
      }

      const updatedTemplate = await NewsletterQuery.updateTemplateAsync(templateId, data, context);

      if (updatedTemplate) {
        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            hasBodyHtmlUpdate: Boolean(data.bodyHtml),
            hasSubjectUpdate: Boolean(data.subject),
            hasTitleUpdate: Boolean(data.title),
            templateId,
          },
          level: SENTRY_LEVELS.INFO,
          message: 'Admin updated newsletter template',
        });
      }

      return updatedTemplate;
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { templateId },
        facade: facadeName,
        method: 'updateTemplateAsync',
        operation: OPERATIONS.NEWSLETTER_ADMIN.UPDATE_NEWSLETTER_TEMPLATE,
        userId: adminUserId,
      };
      throw createFacadeError(errorContext, error);
    }
  }
}
