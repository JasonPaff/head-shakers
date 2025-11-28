import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { SCHEMA_LIMITS } from '@/lib/constants';
import { newsletterSignups } from '@/lib/db/schema';

export type InsertNewsletterSignup = z.infer<typeof insertNewsletterSignupSchema>;
export type InsertNewsletterSignupInput = z.input<typeof insertNewsletterSignupSchema>;
export type SelectNewsletterSignup = z.infer<typeof selectNewsletterSignupSchema>;

export const selectNewsletterSignupSchema = createSelectSchema(newsletterSignups);
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
