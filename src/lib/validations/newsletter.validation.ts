import { z } from 'zod';

import { SCHEMA_LIMITS } from '@/lib/constants';
import { zodDateString, zodMaxString, zodMinMaxString } from '@/lib/utils/zod.utils';

// ============================================================================
// Type Exports - Public Facing
// ============================================================================

export type CreateNewsletterTemplate = z.infer<typeof createNewsletterTemplateSchema>;
export type CreateNewsletterTemplateInput = z.input<typeof createNewsletterTemplateSchema>;

// ============================================================================
// Type Exports - Admin Operations
// ============================================================================

export type NewsletterSignup = z.infer<typeof newsletterSignupSchema>;
export type NewsletterSignupInput = z.input<typeof newsletterSignupSchema>;

export type NewsletterSubscriberFilter = z.infer<typeof newsletterSubscriberFilterSchema>;
export type NewsletterSubscriberFilterInput = z.input<typeof newsletterSubscriberFilterSchema>;

export type SendNewsletter = z.infer<typeof sendNewsletterSchema>;
export type SendNewsletterInput = z.input<typeof sendNewsletterSchema>;

export type UnsubscribeByAdmin = z.infer<typeof unsubscribeByAdminSchema>;
export type UnsubscribeByAdminInput = z.input<typeof unsubscribeByAdminSchema>;

export type UpdateNewsletterTemplate = z.infer<typeof updateNewsletterTemplateSchema>;
export type UpdateNewsletterTemplateInput = z.input<typeof updateNewsletterTemplateSchema>;

// ============================================================================
// Public Facing Schemas
// ============================================================================

/**
 * Schema for newsletter signup validation
 * Uses z.email() for email validation with max length constraint
 */
export const newsletterSignupSchema = z.object({
  email: z.email('Please enter a valid email address').max(SCHEMA_LIMITS.USER.EMAIL.MAX, {
    message: `Email must be at most ${SCHEMA_LIMITS.USER.EMAIL.MAX} characters`,
  }),
});

// ============================================================================
// Admin Subscriber Management Schemas
// ============================================================================

/**
 * Schema for filtering newsletter subscribers in admin panel
 * Supports search by email, status filtering, date range, and pagination
 */
export const newsletterSubscriberFilterSchema = z.object({
  dateRange: z
    .object({
      from: zodDateString({
        fieldName: 'Date From',
        isNullable: true,
      }).optional(),
      to: zodDateString({
        fieldName: 'Date To',
        isNullable: true,
      }).optional(),
    })
    .optional(),
  limit: z.number().min(1).max(100).default(25).optional(),
  offset: z.number().min(0).default(0).optional(),
  search: zodMaxString({
    fieldName: 'Search',
    isRequired: false,
    maxLength: SCHEMA_LIMITS.USER.EMAIL.MAX,
  }).optional(),
  status: z.enum(['subscribed', 'unsubscribed', 'all']).default('all').optional(),
});

/**
 * Schema for admin unsubscribe action
 * Allows unsubscribe by email or subscriber ID
 */
export const unsubscribeByAdminSchema = z.object({
  email: z
    .email('Please enter a valid email address')
    .max(SCHEMA_LIMITS.USER.EMAIL.MAX, {
      message: `Email must be at most ${SCHEMA_LIMITS.USER.EMAIL.MAX} characters`,
    })
    .optional(),
  id: z.uuid('Invalid subscriber ID').optional(),
});

// ============================================================================
// Admin Template Management Schemas
// ============================================================================

/**
 * Schema for creating a newsletter template
 * Requires title, subject, and both HTML and Markdown body content
 */
export const createNewsletterTemplateSchema = z.object({
  bodyHtml: zodMinMaxString({
    fieldName: 'Body HTML',
    maxLength: 100000,
    minLength: 1,
  }),
  bodyMarkdown: zodMinMaxString({
    fieldName: 'Body Markdown',
    maxLength: 100000,
    minLength: 1,
  }),
  subject: zodMinMaxString({
    fieldName: 'Subject',
    maxLength: SCHEMA_LIMITS.NEWSLETTER_SIGNUP.EMAIL.MAX,
    minLength: 1,
  }),
  title: zodMinMaxString({
    fieldName: 'Title',
    maxLength: SCHEMA_LIMITS.FEATURED_CONTENT.TITLE.MAX,
    minLength: SCHEMA_LIMITS.FEATURED_CONTENT.TITLE.MIN,
  }),
});

/**
 * Schema for updating a newsletter template
 * All fields optional except ID
 */
export const updateNewsletterTemplateSchema = z.object({
  bodyHtml: zodMaxString({
    fieldName: 'Body HTML',
    isRequired: false,
    maxLength: 100000,
  }).optional(),
  bodyMarkdown: zodMaxString({
    fieldName: 'Body Markdown',
    isRequired: false,
    maxLength: 100000,
  }).optional(),
  id: z.uuid('Template ID is required'),
  subject: zodMaxString({
    fieldName: 'Subject',
    isRequired: false,
    maxLength: SCHEMA_LIMITS.NEWSLETTER_SIGNUP.EMAIL.MAX,
  }).optional(),
  title: zodMaxString({
    fieldName: 'Title',
    isRequired: false,
    maxLength: SCHEMA_LIMITS.FEATURED_CONTENT.TITLE.MAX,
  }).optional(),
});

// ============================================================================
// Admin Newsletter Sending Schemas
// ============================================================================

/**
 * Schema for sending newsletters
 * Supports recipient filtering, optional scheduling, and template selection
 */
export const sendNewsletterSchema = z.object({
  bodyHtml: zodMinMaxString({
    fieldName: 'Body HTML',
    maxLength: 100000,
    minLength: 1,
  }),
  recipientFilter: z
    .object({
      status: z.enum(['subscribed', 'all']).default('subscribed'),
    })
    .default({ status: 'subscribed' }),
  scheduledAt: zodDateString({
    fieldName: 'Scheduled At',
    isNullable: true,
  }).optional(),
  subject: zodMinMaxString({
    fieldName: 'Subject',
    maxLength: SCHEMA_LIMITS.NEWSLETTER_SIGNUP.EMAIL.MAX,
    minLength: 1,
  }),
  templateId: z.uuid('Invalid template ID').optional(),
});
