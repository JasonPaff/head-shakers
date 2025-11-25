import { eq } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';

import { newsletterSignups } from '@/lib/db/schema/newsletter-signups.schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

/**
 * Type for inserting a new newsletter signup
 */
export type InsertNewsletterSignup = typeof newsletterSignups.$inferInsert;

/**
 * Type for newsletter signup record from database
 */
export type NewsletterSignupRecord = typeof newsletterSignups.$inferSelect;

/**
 * Newsletter query class for database operations
 */
export class NewsletterQuery extends BaseQuery {
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
  static async findByEmailAsync(email: string, context: QueryContext): Promise<NewsletterSignupRecord | null> {
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
  static async getActiveSubscriberAsync(email: string, context: QueryContext): Promise<NewsletterSignupRecord | null> {
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
  static async resubscribeAsync(email: string, context: QueryContext): Promise<NewsletterSignupRecord | null> {
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

  /**
   * Soft delete (unsubscribe) a newsletter signup by email
   * Sets unsubscribedAt timestamp instead of hard delete
   */
  static async unsubscribeAsync(email: string, context: QueryContext): Promise<NewsletterSignupRecord | null> {
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
