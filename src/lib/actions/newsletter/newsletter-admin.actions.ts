'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';

import {
  ACTION_NAMES,
  ERROR_CODES,
  ERROR_MESSAGES,
  OPERATIONS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { NewsletterFacade } from '@/lib/facades/newsletter/newsletter.facade';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { adminActionClient } from '@/lib/utils/next-safe-action';
import {
  createNewsletterTemplateSchema,
  newsletterSubscriberFilterSchema,
  sendNewsletterSchema,
  unsubscribeByAdminSchema,
  updateNewsletterTemplateSchema,
} from '@/lib/validations/newsletter.validation';

/**
 * Helper function to mask email for privacy in Sentry context
 * Shows first 3 characters and domain only (e.g., "joh***@example.com")
 */
function maskEmail(email: string): string {
  const parts = email.split('@');
  const localPart = parts[0] ?? '';
  const domain = parts[1] ?? '';
  const visibleChars = Math.min(3, localPart.length);
  return localPart.substring(0, visibleChars) + '***@' + domain;
}

/**
 * Get all newsletter subscribers with filtering, sorting, and pagination (admin only)
 *
 * Features:
 * - Search by email
 * - Filter by subscription status (subscribed/unsubscribed/all)
 * - Filter by date range
 * - Pagination support
 *
 * Sentry integration:
 * - Sets NEWSLETTER_DATA context at action start
 * - Adds breadcrumbs for successful fetches
 * - Performance monitoring handled by sentryMiddleware via startSpan
 */
export const getNewsletterSubscribersAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.NEWSLETTER_ADMIN.GET_SUBSCRIBERS,
    isTransactionRequired: false,
  })
  .inputSchema(newsletterSubscriberFilterSchema)
  .action(async ({ ctx }) => {
    const data = newsletterSubscriberFilterSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    // 1. Set Sentry context at start of action
    Sentry.setContext(SENTRY_CONTEXTS.NEWSLETTER_DATA, {
      adminUserId: ctx.userId,
      hasDateRange: Boolean(data.dateRange),
      hasSearch: Boolean(data.search),
      limit: data.limit,
      offset: data.offset,
      operation: OPERATIONS.NEWSLETTER_ADMIN.GET_NEWSLETTER_SUBSCRIBERS,
      status: data.status,
    });

    try {
      // 2. Delegate to facade for business logic
      const subscribers = await NewsletterFacade.getSubscribersForAdminAsync(
        {
          dateRange: data.dateRange,
          search: data.search,
          status: data.status,
        },
        {
          limit: data.limit,
          offset: data.offset,
        },
        ctx.userId,
        dbInstance,
      );

      // 3. Add Sentry breadcrumb for successful operation
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          count: subscribers.length,
          hasDateRange: Boolean(data.dateRange),
          hasSearch: Boolean(data.search),
          status: data.status || 'all',
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Admin fetched newsletter subscribers',
      });

      // 4. Return consistent response shape
      return {
        data: subscribers,
        message: 'Subscribers fetched successfully',
        success: true,
      };
    } catch (error) {
      // 5. Handle errors with utility
      return handleActionError(error, {
        input: {
          hasDateRange: Boolean(data.dateRange),
          hasSearch: Boolean(data.search),
          limit: data.limit,
          offset: data.offset,
          status: data.status,
        },
        metadata: {
          actionName: ACTION_NAMES.NEWSLETTER_ADMIN.GET_SUBSCRIBERS,
        },
        operation: OPERATIONS.NEWSLETTER_ADMIN.GET_NEWSLETTER_SUBSCRIBERS,
        userId: ctx.userId,
      });
    }
  });

/**
 * Unsubscribe a user from newsletter (admin action)
 *
 * Features:
 * - Admin can unsubscribe by email or subscriber ID
 * - Operation logged for audit trail
 * - Handles already-unsubscribed and non-existent emails gracefully
 *
 * Sentry integration:
 * - Masks email in all Sentry operations for privacy
 * - Sets NEWSLETTER_DATA context at action start
 * - Adds breadcrumbs for successful unsubscribe
 */
export const unsubscribeUserAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.NEWSLETTER_ADMIN.UNSUBSCRIBE_USER,
    isTransactionRequired: true,
  })
  .inputSchema(unsubscribeByAdminSchema)
  .action(async ({ ctx }) => {
    const data = unsubscribeByAdminSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    // Validate that at least one identifier is provided
    if (!data.email && !data.id) {
      throw new ActionError(
        ErrorType.VALIDATION,
        ERROR_CODES.NEWSLETTER.INVALID_INPUT,
        'Either email or subscriber ID is required',
        { ctx, operation: OPERATIONS.NEWSLETTER_ADMIN.ADMIN_UNSUBSCRIBE_USER },
        true,
        400,
      );
    }

    // Mask email for privacy in all Sentry operations
    const maskedEmail = data.email ? maskEmail(data.email) : undefined;

    // 1. Set Sentry context at start of action
    Sentry.setContext(SENTRY_CONTEXTS.NEWSLETTER_DATA, {
      adminUserId: ctx.userId,
      email: maskedEmail,
      id: data.id,
      operation: OPERATIONS.NEWSLETTER_ADMIN.ADMIN_UNSUBSCRIBE_USER,
    });

    try {
      // 2. Delegate to facade for business logic
      // Note: For now, facade only supports email-based unsubscribe
      // If ID is provided, we'd need to fetch the email first (future enhancement)
      if (!data.email) {
        throw new ActionError(
          ErrorType.VALIDATION,
          ERROR_CODES.NEWSLETTER.INVALID_INPUT,
          'Email is required for unsubscribe operation',
          { ctx, operation: OPERATIONS.NEWSLETTER_ADMIN.ADMIN_UNSUBSCRIBE_USER },
          true,
          400,
        );
      }

      const result = await NewsletterFacade.unsubscribeByAdminAsync(data.email, ctx.userId, dbInstance);

      // 3. Handle unsuccessful results
      if (!result) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.NEWSLETTER.SUBSCRIBER_NOT_FOUND,
          ERROR_MESSAGES.NEWSLETTER.SUBSCRIBER_NOT_FOUND,
          { ctx, operation: OPERATIONS.NEWSLETTER_ADMIN.ADMIN_UNSUBSCRIBE_USER },
          true,
          404,
        );
      }

      // 4. Add Sentry breadcrumb for successful operation
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          email: maskedEmail,
          signupId: result.id,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Admin unsubscribed user from newsletter',
      });

      // 5. Return consistent response shape
      return {
        data: { signupId: result.id },
        message: 'User unsubscribed successfully',
        success: true,
      };
    } catch (error) {
      // 6. Handle errors with utility
      return handleActionError(error, {
        input: { email: maskedEmail, id: data.id },
        metadata: {
          actionName: ACTION_NAMES.NEWSLETTER_ADMIN.UNSUBSCRIBE_USER,
        },
        operation: OPERATIONS.NEWSLETTER_ADMIN.ADMIN_UNSUBSCRIBE_USER,
        userId: ctx.userId,
      });
    }
  });

/**
 * Get newsletter statistics for admin dashboard
 *
 * Features:
 * - Subscriber counts (total, active, unsubscribed)
 * - Recent subscriber activity
 * - Send history
 * - Send statistics
 *
 * Sentry integration:
 * - Sets NEWSLETTER_DATA context at action start
 * - Adds breadcrumbs for successful stats fetch
 */
export const getNewsletterStatsAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.NEWSLETTER_ADMIN.GET_NEWSLETTER_STATS,
    isTransactionRequired: false,
  })
  .action(async ({ ctx }) => {
    const dbInstance = ctx.db;

    // 1. Set Sentry context at start of action
    Sentry.setContext(SENTRY_CONTEXTS.NEWSLETTER_DATA, {
      adminUserId: ctx.userId,
      operation: OPERATIONS.NEWSLETTER_ADMIN.GET_NEWSLETTER_STATS,
    });

    try {
      // 2. Delegate to facade for business logic
      const stats = await NewsletterFacade.getNewsletterStatsAsync(ctx.userId, dbInstance);

      // 3. Add Sentry breadcrumb for successful operation
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          activeCount: stats.subscriberCounts.activeCount,
          recentActivityCount: stats.recentActivity.length,
          sendCount: stats.sendHistory.length,
          totalCount: stats.subscriberCounts.totalCount,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Admin fetched newsletter statistics',
      });

      // 4. Return consistent response shape
      return {
        data: stats,
        message: 'Newsletter statistics fetched successfully',
        success: true,
      };
    } catch (error) {
      // 5. Handle errors with utility
      return handleActionError(error, {
        metadata: {
          actionName: ACTION_NAMES.NEWSLETTER_ADMIN.GET_NEWSLETTER_STATS,
        },
        operation: OPERATIONS.NEWSLETTER_ADMIN.GET_NEWSLETTER_STATS,
        userId: ctx.userId,
      });
    }
  });

/**
 * Get newsletter send history with pagination (admin only)
 *
 * Features:
 * - Paginated send history
 * - Sorted by date descending
 * - Includes success/failure counts
 *
 * Sentry integration:
 * - Sets NEWSLETTER_DATA context at action start
 * - Adds breadcrumbs for successful fetch
 */
export const getSendHistoryAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.NEWSLETTER_ADMIN.GET_SEND_HISTORY,
    isTransactionRequired: false,
  })
  .action(async ({ ctx }) => {
    const dbInstance = ctx.db;

    // 1. Set Sentry context at start of action
    Sentry.setContext(SENTRY_CONTEXTS.NEWSLETTER_DATA, {
      adminUserId: ctx.userId,
      operation: OPERATIONS.NEWSLETTER_ADMIN.GET_NEWSLETTER_SEND_HISTORY,
    });

    try {
      // 2. Delegate to facade for business logic
      const sendHistory = await NewsletterFacade.getSendHistoryAsync({}, ctx.userId, dbInstance);

      // 3. Add Sentry breadcrumb for successful operation
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          count: sendHistory.length,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Admin fetched newsletter send history',
      });

      // 4. Return consistent response shape
      return {
        data: sendHistory,
        message: 'Send history fetched successfully',
        success: true,
      };
    } catch (error) {
      // 5. Handle errors with utility
      return handleActionError(error, {
        metadata: {
          actionName: ACTION_NAMES.NEWSLETTER_ADMIN.GET_SEND_HISTORY,
        },
        operation: OPERATIONS.NEWSLETTER_ADMIN.GET_NEWSLETTER_SEND_HISTORY,
        userId: ctx.userId,
      });
    }
  });

/**
 * Send newsletter to subscribers (admin only)
 *
 * Features:
 * - Sends to all active subscribers
 * - Creates audit trail send record
 * - Returns success/failure counts
 * - Supports HTML content
 *
 * Sentry integration:
 * - Sets NEWSLETTER_DATA context at action start
 * - Adds breadcrumbs for send initiation and completion
 * - Logs warnings for failed sends
 */
export const sendNewsletterAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.NEWSLETTER_ADMIN.SEND_NEWSLETTER,
    isTransactionRequired: true,
  })
  .inputSchema(sendNewsletterSchema)
  .action(async ({ ctx }) => {
    const data = sendNewsletterSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    // 1. Set Sentry context at start of action
    Sentry.setContext(SENTRY_CONTEXTS.NEWSLETTER_DATA, {
      adminUserId: ctx.userId,
      hasScheduledAt: Boolean(data.scheduledAt),
      hasTemplateId: Boolean(data.templateId),
      operation: OPERATIONS.NEWSLETTER_ADMIN.SEND_NEWSLETTER_BULK,
      subject: data.subject,
    });

    try {
      // 2. Delegate to facade for business logic
      const result = await NewsletterFacade.sendNewsletterAsync(
        data.subject,
        data.bodyHtml,
        ctx.userId,
        dbInstance,
      );

      // 3. Handle unsuccessful results
      if (!result.isSuccessful) {
        throw new ActionError(
          ErrorType.BUSINESS_RULE,
          ERROR_CODES.NEWSLETTER.SEND_FAILED,
          result.error || ERROR_MESSAGES.NEWSLETTER.SEND_FAILED,
          { ctx, operation: OPERATIONS.NEWSLETTER_ADMIN.SEND_NEWSLETTER_BULK },
          true,
          400,
        );
      }

      // 4. Add Sentry breadcrumb for successful operation
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          failedCount: result.failedCount,
          sendRecordId: result.sendRecord?.id,
          subject: data.subject,
          successCount: result.successCount,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Newsletter sent to ${result.successCount} subscribers`,
      });

      // Log warning if there were failures
      if (result.failedCount > 0) {
        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            failedCount: result.failedCount,
            subject: data.subject,
          },
          level: SENTRY_LEVELS.WARNING,
          message: `Newsletter had ${result.failedCount} failed sends`,
        });
      }

      // 5. Return consistent response shape
      return {
        data: {
          failedCount: result.failedCount,
          sendRecordId: result.sendRecord?.id,
          successCount: result.successCount,
        },
        message: `Newsletter sent successfully to ${result.successCount} subscribers`,
        success: true,
      };
    } catch (error) {
      // 6. Handle errors with utility
      return handleActionError(error, {
        input: {
          hasScheduledAt: Boolean(data.scheduledAt),
          hasTemplateId: Boolean(data.templateId),
          subject: data.subject,
        },
        metadata: {
          actionName: ACTION_NAMES.NEWSLETTER_ADMIN.SEND_NEWSLETTER,
        },
        operation: OPERATIONS.NEWSLETTER_ADMIN.SEND_NEWSLETTER_BULK,
        userId: ctx.userId,
      });
    }
  });

/**
 * Create a new newsletter template (admin only)
 *
 * Features:
 * - Stores reusable email templates
 * - Requires title, subject, and HTML/Markdown body
 * - Templates can be used for newsletter campaigns
 *
 * Sentry integration:
 * - Sets NEWSLETTER_DATA context at action start
 * - Adds breadcrumbs for successful creation
 */
export const createTemplateAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.NEWSLETTER_ADMIN.CREATE_TEMPLATE,
    isTransactionRequired: true,
  })
  .inputSchema(createNewsletterTemplateSchema)
  .action(async ({ ctx }) => {
    const data = createNewsletterTemplateSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    // 1. Set Sentry context at start of action
    Sentry.setContext(SENTRY_CONTEXTS.NEWSLETTER_DATA, {
      adminUserId: ctx.userId,
      operation: OPERATIONS.NEWSLETTER_ADMIN.CREATE_NEWSLETTER_TEMPLATE,
      subject: data.subject,
      title: data.title,
    });

    try {
      // 2. Delegate to facade for business logic
      const template = await NewsletterFacade.createTemplateAsync(
        {
          bodyHtml: data.bodyHtml,
          bodyMarkdown: data.bodyMarkdown,
          createdBy: ctx.userId,
          subject: data.subject,
          title: data.title,
        },
        ctx.userId,
        dbInstance,
      );

      // 3. Handle unsuccessful results
      if (!template) {
        throw new ActionError(
          ErrorType.BUSINESS_RULE,
          ERROR_CODES.NEWSLETTER.TEMPLATE_CREATE_FAILED,
          ERROR_MESSAGES.NEWSLETTER.TEMPLATE_CREATE_FAILED,
          { ctx, operation: OPERATIONS.NEWSLETTER_ADMIN.CREATE_NEWSLETTER_TEMPLATE },
          true,
          400,
        );
      }

      // 4. Add Sentry breadcrumb for successful operation
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          subject: data.subject,
          templateId: template.id,
          title: data.title,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Admin created newsletter template',
      });

      // 5. Return consistent response shape
      return {
        data: template,
        message: 'Template created successfully',
        success: true,
      };
    } catch (error) {
      // 6. Handle errors with utility
      return handleActionError(error, {
        input: {
          subject: data.subject,
          title: data.title,
        },
        metadata: {
          actionName: ACTION_NAMES.NEWSLETTER_ADMIN.CREATE_TEMPLATE,
        },
        operation: OPERATIONS.NEWSLETTER_ADMIN.CREATE_NEWSLETTER_TEMPLATE,
        userId: ctx.userId,
      });
    }
  });

/**
 * Update an existing newsletter template (admin only)
 *
 * Features:
 * - Updates template subject, title, and content
 * - All fields optional except ID
 * - Validates template exists before update
 *
 * Sentry integration:
 * - Sets NEWSLETTER_DATA context at action start
 * - Adds breadcrumbs for successful update
 */
export const updateTemplateAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.NEWSLETTER_ADMIN.UPDATE_TEMPLATE,
    isTransactionRequired: true,
  })
  .inputSchema(updateNewsletterTemplateSchema)
  .action(async ({ ctx }) => {
    const data = updateNewsletterTemplateSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    // 1. Set Sentry context at start of action
    Sentry.setContext(SENTRY_CONTEXTS.NEWSLETTER_DATA, {
      adminUserId: ctx.userId,
      hasBodyHtmlUpdate: Boolean(data.bodyHtml),
      hasBodyMarkdownUpdate: Boolean(data.bodyMarkdown),
      hasSubjectUpdate: Boolean(data.subject),
      hasTitleUpdate: Boolean(data.title),
      operation: OPERATIONS.NEWSLETTER_ADMIN.UPDATE_NEWSLETTER_TEMPLATE,
      templateId: data.id,
    });

    try {
      // 2. Delegate to facade for business logic
      const template = await NewsletterFacade.updateTemplateAsync(
        data.id,
        {
          bodyHtml: data.bodyHtml ?? undefined,
          bodyMarkdown: data.bodyMarkdown ?? undefined,
          subject: data.subject ?? undefined,
          title: data.title ?? undefined,
        },
        ctx.userId,
        dbInstance,
      );

      // 3. Handle unsuccessful results
      if (!template) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.NEWSLETTER.TEMPLATE_NOT_FOUND,
          ERROR_MESSAGES.NEWSLETTER.TEMPLATE_NOT_FOUND,
          { ctx, operation: OPERATIONS.NEWSLETTER_ADMIN.UPDATE_NEWSLETTER_TEMPLATE },
          true,
          404,
        );
      }

      // 4. Add Sentry breadcrumb for successful operation
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          hasBodyHtmlUpdate: Boolean(data.bodyHtml),
          hasSubjectUpdate: Boolean(data.subject),
          hasTitleUpdate: Boolean(data.title),
          templateId: data.id,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Admin updated newsletter template',
      });

      // 5. Return consistent response shape
      return {
        data: template,
        message: 'Template updated successfully',
        success: true,
      };
    } catch (error) {
      // 6. Handle errors with utility
      return handleActionError(error, {
        input: {
          hasBodyHtmlUpdate: Boolean(data.bodyHtml),
          hasSubjectUpdate: Boolean(data.subject),
          hasTitleUpdate: Boolean(data.title),
          templateId: data.id,
        },
        metadata: {
          actionName: ACTION_NAMES.NEWSLETTER_ADMIN.UPDATE_TEMPLATE,
        },
        operation: OPERATIONS.NEWSLETTER_ADMIN.UPDATE_NEWSLETTER_TEMPLATE,
        userId: ctx.userId,
      });
    }
  });

/**
 * Delete a newsletter template (admin only)
 *
 * Features:
 * - Hard deletes template (admin-only content)
 * - Validates template exists before deletion
 * - Logged for audit trail
 *
 * Sentry integration:
 * - Sets NEWSLETTER_DATA context at action start
 * - Adds breadcrumbs for successful deletion
 */
export const deleteTemplateAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.NEWSLETTER_ADMIN.DELETE_TEMPLATE,
    isTransactionRequired: true,
  })
  .inputSchema(updateNewsletterTemplateSchema.pick({ id: true }))
  .action(async ({ ctx }) => {
    const data = updateNewsletterTemplateSchema.pick({ id: true }).parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    // 1. Set Sentry context at start of action
    Sentry.setContext(SENTRY_CONTEXTS.NEWSLETTER_DATA, {
      adminUserId: ctx.userId,
      operation: OPERATIONS.NEWSLETTER_ADMIN.DELETE_NEWSLETTER_TEMPLATE,
      templateId: data.id,
    });

    try {
      // 2. Delegate to facade for business logic
      const template = await NewsletterFacade.deleteTemplateAsync(data.id, ctx.userId, dbInstance);

      // 3. Handle unsuccessful results
      if (!template) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.NEWSLETTER.TEMPLATE_NOT_FOUND,
          ERROR_MESSAGES.NEWSLETTER.TEMPLATE_NOT_FOUND,
          { ctx, operation: OPERATIONS.NEWSLETTER_ADMIN.DELETE_NEWSLETTER_TEMPLATE },
          true,
          404,
        );
      }

      // 4. Add Sentry breadcrumb for successful operation
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          subject: template.subject,
          templateId: data.id,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Admin deleted newsletter template',
      });

      // 5. Return consistent response shape
      return {
        data: { templateId: template.id },
        message: 'Template deleted successfully',
        success: true,
      };
    } catch (error) {
      // 6. Handle errors with utility
      return handleActionError(error, {
        input: {
          templateId: data.id,
        },
        metadata: {
          actionName: ACTION_NAMES.NEWSLETTER_ADMIN.DELETE_TEMPLATE,
        },
        operation: OPERATIONS.NEWSLETTER_ADMIN.DELETE_NEWSLETTER_TEMPLATE,
        userId: ctx.userId,
      });
    }
  });

/**
 * Get all newsletter templates with pagination (admin only)
 *
 * Features:
 * - Lists all available templates
 * - Supports pagination
 * - Used for template selection in newsletter sending
 *
 * Sentry integration:
 * - Sets NEWSLETTER_DATA context at action start
 * - Adds breadcrumbs for successful fetch
 */
export const getTemplatesAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.NEWSLETTER_ADMIN.GET_TEMPLATES,
    isTransactionRequired: false,
  })
  .action(async ({ ctx }) => {
    const dbInstance = ctx.db;

    // 1. Set Sentry context at start of action
    Sentry.setContext(SENTRY_CONTEXTS.NEWSLETTER_DATA, {
      adminUserId: ctx.userId,
      operation: OPERATIONS.NEWSLETTER_ADMIN.GET_NEWSLETTER_TEMPLATES,
    });

    try {
      // 2. Delegate to facade for business logic
      const templates = await NewsletterFacade.getTemplatesAsync({}, ctx.userId, dbInstance);

      // 3. Add Sentry breadcrumb for successful operation
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          count: templates.length,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Admin fetched newsletter templates',
      });

      // 4. Return consistent response shape
      return {
        data: templates,
        message: 'Templates fetched successfully',
        success: true,
      };
    } catch (error) {
      // 5. Handle errors with utility
      return handleActionError(error, {
        metadata: {
          actionName: ACTION_NAMES.NEWSLETTER_ADMIN.GET_TEMPLATES,
        },
        operation: OPERATIONS.NEWSLETTER_ADMIN.GET_NEWSLETTER_TEMPLATES,
        userId: ctx.userId,
      });
    }
  });

/**
 * Get a specific newsletter template by ID (admin only)
 *
 * Features:
 * - Fetches single template with full content
 * - Used for template editing and preview
 *
 * Sentry integration:
 * - Sets NEWSLETTER_DATA context at action start
 * - Adds breadcrumbs for successful fetch
 */
export const getTemplateByIdAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.NEWSLETTER_ADMIN.GET_TEMPLATES,
    isTransactionRequired: false,
  })
  .inputSchema(updateNewsletterTemplateSchema.pick({ id: true }))
  .action(async ({ ctx }) => {
    const data = updateNewsletterTemplateSchema.pick({ id: true }).parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    // 1. Set Sentry context at start of action
    Sentry.setContext(SENTRY_CONTEXTS.NEWSLETTER_DATA, {
      adminUserId: ctx.userId,
      operation: OPERATIONS.NEWSLETTER_ADMIN.GET_NEWSLETTER_TEMPLATES,
      templateId: data.id,
    });

    try {
      // 2. Delegate to facade for business logic
      const template = await NewsletterFacade.getTemplateByIdAsync(data.id, ctx.userId, dbInstance);

      // 3. Handle unsuccessful results
      if (!template) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.NEWSLETTER.TEMPLATE_NOT_FOUND,
          ERROR_MESSAGES.NEWSLETTER.TEMPLATE_NOT_FOUND,
          { ctx, operation: OPERATIONS.NEWSLETTER_ADMIN.GET_NEWSLETTER_TEMPLATES },
          true,
          404,
        );
      }

      // 4. Add Sentry breadcrumb for successful operation
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          subject: template.subject,
          templateId: data.id,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Admin fetched newsletter template',
      });

      // 5. Return consistent response shape
      return {
        data: template,
        message: 'Template fetched successfully',
        success: true,
      };
    } catch (error) {
      // 6. Handle errors with utility
      return handleActionError(error, {
        input: {
          templateId: data.id,
        },
        metadata: {
          actionName: ACTION_NAMES.NEWSLETTER_ADMIN.GET_TEMPLATES,
        },
        operation: OPERATIONS.NEWSLETTER_ADMIN.GET_NEWSLETTER_TEMPLATES,
        userId: ctx.userId,
      });
    }
  });
