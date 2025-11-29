import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { SCHEMA_LIMITS } from '@/lib/constants';
import { newsletterSignups } from '@/lib/db/schema';

/**
 * Newsletter signup validation schemas
 *
 * Validates email addresses for newsletter subscriptions.
 * Email must be a valid format and within configured length limits.
 *
 * @see SCHEMA_LIMITS.NEWSLETTER_SIGNUP for email constraints
 */

// Type exports (alphabetical order)
export type InsertNewsletterSignup = z.infer<typeof insertNewsletterSignupSchema>;
export type InsertNewsletterSignupInput = z.input<typeof insertNewsletterSignupSchema>;
export type SelectNewsletterSignup = z.infer<typeof selectNewsletterSignupSchema>;
export type UnsubscribeFromNewsletter = z.infer<typeof unsubscribeFromNewsletterSchema>;
export type UnsubscribeFromNewsletterInput = z.input<typeof unsubscribeFromNewsletterSchema>;

/**
 * Select the schema for newsletter signups (from the database)
 */
export const selectNewsletterSignupSchema = createSelectSchema(newsletterSignups);

/**
 * Insert schema for creating newsletter signups
 * Validates email format and length, omits auto-generated fields
 */
export const insertNewsletterSignupSchema = createInsertSchema(newsletterSignups, {
  email: z
    .email('Please enter a valid email address')
    .trim()
    .max(SCHEMA_LIMITS.NEWSLETTER_SIGNUP.EMAIL.MAX, {
      message: `Email must be at most ${SCHEMA_LIMITS.NEWSLETTER_SIGNUP.EMAIL.MAX} characters`,
    }),
}).omit({
  createdAt: true,
  id: true,
  subscribedAt: true,
  updatedAt: true,
  userId: true,
});

/**
 * Unsubscribe schema for newsletter unsubscribe action
 * Validates email format and length for unsubscribe requests
 */
export const unsubscribeFromNewsletterSchema = z.object({
  email: z
    .email('Please enter a valid email address')
    .trim()
    .max(SCHEMA_LIMITS.NEWSLETTER_SIGNUP.EMAIL.MAX, {
      message: `Email must be at most ${SCHEMA_LIMITS.NEWSLETTER_SIGNUP.EMAIL.MAX} characters`,
    }),
});
