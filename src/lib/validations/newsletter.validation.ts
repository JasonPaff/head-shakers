import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { SCHEMA_LIMITS } from '@/lib/constants';
import { newsletterSignups } from '@/lib/db/schema';

/**
 * Newsletter signup validation schemas
 *
 * Validates email addresses for newsletter subscriptions.
 * Email must be valid format and within configured length limits.
 *
 * @see SCHEMA_LIMITS.NEWSLETTER_SIGNUP for email constraints
 */

// Type exports (alphabetical order)
export type InsertNewsletterSignup = z.infer<typeof insertNewsletterSignupSchema>;
export type InsertNewsletterSignupInput = z.input<typeof insertNewsletterSignupSchema>;
export type SelectNewsletterSignup = z.infer<typeof selectNewsletterSignupSchema>;

/**
 * Select schema for newsletter signups (from database)
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
    .min(SCHEMA_LIMITS.NEWSLETTER_SIGNUP.EMAIL.MIN, {
      message: `Email must be at least ${SCHEMA_LIMITS.NEWSLETTER_SIGNUP.EMAIL.MIN} characters`,
    })
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
