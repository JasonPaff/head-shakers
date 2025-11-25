import { z } from 'zod';

import { SCHEMA_LIMITS } from '@/lib/constants';

// Type exports first for better IDE support
export type NewsletterSignup = z.infer<typeof newsletterSignupSchema>;
export type NewsletterSignupInput = z.input<typeof newsletterSignupSchema>;

/**
 * Schema for newsletter signup validation
 * Uses z.email() for email validation with max length constraint
 */
export const newsletterSignupSchema = z.object({
  email: z.email('Please enter a valid email address').max(SCHEMA_LIMITS.USER.EMAIL.MAX, {
    message: `Email must be at most ${SCHEMA_LIMITS.USER.EMAIL.MAX} characters`,
  }),
});
