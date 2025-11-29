import { and, eq, isNotNull, isNull, sql } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';

import { newsletterSignups } from '@/lib/db/schema/newsletter-signups.schema';
import { BaseQuery } from '@/lib/queries/base/base-query';
import { normalizeEmail } from '@/lib/utils/email-utils';

/**
 * Type for inserting a new newsletter signup
 */
export type InsertNewsletterSignup = typeof newsletterSignups.$inferInsert;

/**
 * Type for newsletter signup record from the database
 */
export type NewsletterSignupRecord = typeof newsletterSignups.$inferSelect;

/**
 * Newsletter query class for database operations
 */
export class NewsletterQuery extends BaseQuery {
  /**
   * Create a new newsletter subscription
   * Uses onConflictDoNothing to handle duplicate emails gracefully
   *
   * Note: userId can be undefined for anonymous signups. The null to undefined conversion
   * ensures compatibility with the database schema which uses varchar (allowing undefined but not null).
   *
   * Email normalization: Email addresses are normalized by converting to lowercase and trimming
   * whitespace to ensure case-insensitive matching and prevent duplicates from spacing differences.
   */
  static async createSignupAsync(
    email: string,
    userId: string | undefined,
    context: QueryContext,
  ): Promise<NewsletterSignupRecord | null> {
    const dbInstance = this.getDbInstance(context);
    const normalizedEmail = normalizeEmail(email);

    const result = await dbInstance
      .insert(newsletterSignups)
      .values({
        email: normalizedEmail,
        userId,
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

    const normalizedEmail = normalizeEmail(email);

    const result = await dbInstance
      .select({ id: newsletterSignups.id })
      .from(newsletterSignups)
      .where(eq(newsletterSignups.email, normalizedEmail))
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
    const normalizedEmail = normalizeEmail(email);

    const result = await dbInstance
      .select()
      .from(newsletterSignups)
      .where(eq(newsletterSignups.email, normalizedEmail))
      .limit(1);

    return result?.[0] || null;
  }

  /**
   * Get the active subscriber by email (not unsubscribed)
   */
  static async getActiveSubscriberAsync(
    email: string,
    context: QueryContext,
  ): Promise<NewsletterSignupRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const normalizedEmail = normalizeEmail(email);

    const result = await dbInstance
      .select()
      .from(newsletterSignups)
      .where(eq(newsletterSignups.email, normalizedEmail))
      .limit(1);

    const signup = result?.[0];
    if (!signup || signup.unsubscribedAt !== null) {
      return null;
    }

    return signup;
  }

  /**
   * Check if an email is actively subscribed (not unsubscribed)
   *
   * @returns true if the email is subscribed and not unsubscribed, false otherwise.
   * @example 'const isSubscribed = await NewsletterQuery.getIsActiveSubscriberAsync(email);'
   */
  static async getIsActiveSubscriberAsync(email: string, context: QueryContext): Promise<boolean> {
    const dbInstance = this.getDbInstance(context);

    const [newsletterSignup] = await dbInstance
      .select({ exists: sql<boolean>`1` })
      .from(newsletterSignups)
      .where(
        and(
          eq(newsletterSignups.email, email),
          isNotNull(newsletterSignups.subscribedAt),
          isNull(newsletterSignups.unsubscribedAt),
        ),
      )
      .limit(1);

    return !!newsletterSignup?.exists;
  }

  /**
   * Resubscribe an existing email (clear unsubscribedAt)
   * Returns null if the email doesn't exist in the system
   *
   * Note on subscribedAt behavior: We intentionally update subscribedAt to the current timestamp
   * when a user resubscribes. This decision prioritizes the most recent subscription intent over
   * preserving historical data. If original subscription date tracking is needed in the future,
   * consider adding a separate firstSubscribedAt field to the schema.
   */
  static async resubscribeAsync(
    email: string,
    context: QueryContext,
  ): Promise<NewsletterSignupRecord | null> {
    const existing = await this.findByEmailAsync(email, context);
    if (!existing) return null;

    const dbInstance = this.getDbInstance(context);
    const normalizedEmail = normalizeEmail(email);

    const result = await dbInstance
      .update(newsletterSignups)
      .set({
        subscribedAt: new Date(),
        unsubscribedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(newsletterSignups.email, normalizedEmail))
      .returning();

    return result?.[0] || null;
  }

  /**
   * Soft delete (unsubscribe) a newsletter signup by email
   * Sets unsubscribedAt timestamp instead of hard delete
   */
  static async unsubscribeAsync(
    email: string,
    context: QueryContext,
  ): Promise<NewsletterSignupRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const normalizedEmail = normalizeEmail(email);

    const result = await dbInstance
      .update(newsletterSignups)
      .set({
        unsubscribedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(newsletterSignups.email, normalizedEmail))
      .returning();

    return result?.[0] || null;
  }

  /**
   * Update user ID for an existing signup (for linking anonymous signup to user)
   * Idempotent: Only updates if userId is currently null (prevents overwriting existing userId)
   * Returns null if email doesn't exist or userId is already set
   */
  static async updateUserIdAsync(
    email: string,
    userId: string,
    context: QueryContext,
  ): Promise<NewsletterSignupRecord | null> {
    const existing = await this.findByEmailAsync(email, context);
    if (!existing || existing.userId !== null) return null;

    const dbInstance = this.getDbInstance(context);
    const normalizedEmail = normalizeEmail(email);

    const result = await dbInstance
      .update(newsletterSignups)
      .set({
        updatedAt: new Date(),
        userId,
      })
      .where(eq(newsletterSignups.email, normalizedEmail))
      .returning();

    return result?.[0] || null;
  }
}
